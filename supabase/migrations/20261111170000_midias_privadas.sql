begin;

-- D03: armazenamento privado de mídia. O app reserva o caminho no servidor, envia ao bucket privado `midias`
-- e confirma; só a mídia confirmada entra na fila do worker. Quem vê: membros da organização dona da
-- propriedade (ou da propriedade do lote) e a equipe autorizada. Comprador não lê nada deste bucket.
-- Limites: 100 fotos e 100 vídeos por lote ou propriedade (DOC 013); foto até 20 MiB, vídeo até 50 MiB
-- e 60 s. Tamanho é conferido aqui pelo objeto real; a duração real, pelo worker (ffprobe).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('midias', 'midias', false, 52428800, null)
on conflict (id) do update set public = false, file_size_limit = 52428800, allowed_mime_types = null;

-- enviada_em nula = reservada, arquivo ainda não confirmado. O default mantém o contrato da fila para
-- linhas inseridas direto (worker e teste da fila); a reserva grava nulo de propósito.
alter table public.midias
  add column chave text check (chave ~ '^[a-z0-9-]{1,80}$'),
  add column enviada_em timestamptz default now();
create unique index midias_chave_escopo on public.midias (coalesce(lote_id, propriedade_id), chave);

create function agrodireto_privado.organizacao_da_midia(p_lote uuid, p_propriedade uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select p.organizacao_id from public.propriedades p
   where p.id = coalesce(p_propriedade, (select o.propriedade_id from public.ofertas_lote o where o.id = p_lote));
$$;
revoke all on function agrodireto_privado.organizacao_da_midia(uuid, uuid) from public, anon, authenticated;
grant execute on function agrodireto_privado.organizacao_da_midia(uuid, uuid) to authenticated;

-- Leitura por organização (perder o vínculo tira o acesso, mesmo do autor) e pela equipe.
drop policy midias_dono on public.midias;
create policy midias_leitura on public.midias for select to authenticated using (
  agrodireto_privado.e_membro(agrodireto_privado.organizacao_da_midia(lote_id, propriedade_id))
  or (select public.acesso_equipe()) = 'autorizado'
);

-- Storage: as políticas se apoiam na RLS de `midias` (o exists só enxerga linhas visíveis ao usuário).
create policy midias_storage_leitura on storage.objects for select to authenticated using (
  bucket_id = 'midias'
  and exists (select 1 from public.midias m where m.arquivo = name or m.arquivo_publicado = name)
);
create policy midias_storage_envio on storage.objects for insert to authenticated with check (
  bucket_id = 'midias'
  and exists (
    select 1 from public.midias m
     where m.arquivo = name and m.autor_id = (select auth.uid())
       and m.enviada_em is null and m.processamento = 'aguardando'
  )
);

-- Recusada na confirmação = falhou sem ter sido enviada; não conta na cota.
create function public.reservar_midia(p_lote uuid, p_propriedade uuid, p_chave text, p_extensao text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  org uuid;
  escopo uuid := coalesce(p_lote, p_propriedade);
  ext text := lower(p_extensao);
  v_tipo text;
  caminho text;
  existente record;
begin
  if num_nonnulls(p_lote, p_propriedade) <> 1 or p_chave is null or p_chave !~ '^[a-z0-9-]{1,80}$' then
    raise sqlstate 'PT422' using message = 'Mídia precisa de um lote ou de uma propriedade e de uma chave válida.';
  end if;
  -- Mesma lista de packages/dominio/formatos.ts (52 de imagem, 37 contêineres e fluxos de vídeo).
  if ext = any (array['jpg','jpeg','png','webp','avif','gif','bmp','tiff','tif','svg','ico','icns','heic','heif',
      'raw','cr2','cr3','nef','nrw','arw','srf','sr2','dng','orf','rw2','raf','pef',
      'psd','psb','ai','eps','pdf','jp2','j2k','jpf','jxl','exr','hdr','tga','dds','pcx',
      'ppm','pgm','pbm','pnm','xbm','xpm','cur','apng','qoi','fits','wbmp']) then
    v_tipo := 'foto';
  elsif ext = any (array['mp4','mkv','avi','mov','wmv','flv','webm','mpeg','mpg','m4v','3gp','3g2',
      'ts','mts','m2ts','vob','ogv','ogg','asf','rm','rmvb','f4v','f4p','f4a','f4b',
      'dv','mxf','gxf','nut','nsv','dvr-ms','y4m','yuv','r3d','braw','ari','crm',
      'h264','264','h265','265','hevc','h266','vvc','av1','ivf','vp8','vp9',
      'm1v','m2v','mp4v','mjpeg','mjpg','xvid','divx']) then
    v_tipo := 'video';
  else
    raise sqlstate 'PT422' using message = 'Formato de mídia não aceito.';
  end if;

  org := agrodireto_privado.organizacao_da_midia(p_lote, p_propriedade);
  if org is null or not agrodireto_privado.e_membro(org)
     or (p_lote is not null and not exists (
       select 1 from public.ofertas_lote where id = p_lote and retirada_em is null)) then
    raise sqlstate 'PT403' using message = 'Sem acesso a este lote ou propriedade.';
  end if;

  -- Serializa as reservas do mesmo escopo para a cota não ser ultrapassada por envios simultâneos.
  perform pg_advisory_xact_lock(hashtext('midias:' || escopo::text));

  caminho := org::text || '/' || case when p_lote is null then 'propriedade' else 'lote' end || '/'
             || escopo::text || '/' || p_chave || '.' || ext;
  select arquivo, enviada_em, processamento into existente from public.midias
   where coalesce(lote_id, propriedade_id) = escopo and chave = p_chave;
  if found then
    if existente.arquivo = caminho and not (existente.processamento = 'falhou' and existente.enviada_em is null) then
      return caminho;
    end if;
    raise sqlstate 'PT409' using message = 'Esta chave já foi usada em outra mídia.';
  end if;

  if (select count(*) from public.midias
       where coalesce(lote_id, propriedade_id) = escopo and tipo = v_tipo
         and not (processamento = 'falhou' and enviada_em is null)) >= 100 then
    raise sqlstate 'PT422' using message = case v_tipo when 'foto' then 'Limite de 100 fotos atingido.'
                                                  else 'Limite de 100 vídeos atingido.' end;
  end if;

  insert into public.midias (autor_id, lote_id, propriedade_id, tipo, arquivo, chave, enviada_em)
  values (auth.uid(), p_lote, p_propriedade, v_tipo, caminho, p_chave, null);
  return caminho;
end;
$$;

-- Confirma o envio pelo objeto real no Storage. Devolve 'enviada' (entra na fila) ou 'recusada' (acima do limite).
create function public.confirmar_midia(p_arquivo text)
returns text language plpgsql security definer set search_path = '' as $$
declare m record;
begin
  select md.id, md.tipo, md.enviada_em, md.processamento, (s.metadata->>'size')::bigint as tamanho
    into m
    from public.midias md
    join storage.objects s on s.bucket_id = 'midias' and s.name = md.arquivo
   where md.arquivo = p_arquivo and md.autor_id = auth.uid()
     and agrodireto_privado.e_membro(agrodireto_privado.organizacao_da_midia(md.lote_id, md.propriedade_id))
   for update of md;
  if not found then
    raise sqlstate 'PT409' using message = 'Arquivo ainda não confirmado.';
  end if;
  if m.enviada_em is not null then return 'enviada'; end if;
  if m.processamento = 'falhou' then return 'recusada'; end if;

  if m.tamanho is null or m.tamanho > (case m.tipo when 'foto' then 20971520 else 52428800 end) then
    update public.midias set processamento = 'falhou', tentativas_processamento = 3,
           tamanho_original_bytes = m.tamanho,
           motivo_processamento = case m.tipo when 'foto' then 'Foto acima de 20 MiB.' else 'Vídeo acima de 50 MiB.' end
     where id = m.id;
    return 'recusada';
  end if;

  update public.midias set enviada_em = now(), tamanho_original_bytes = m.tamanho where id = m.id;
  return 'enviada';
end;
$$;

revoke all on function public.reservar_midia(uuid, uuid, text, text), public.confirmar_midia(text)
  from public, anon, authenticated;
grant execute on function public.reservar_midia(uuid, uuid, text, text), public.confirmar_midia(text) to authenticated;

-- Fila: mesma assinatura e comportamento, mas só assume mídia com envio confirmado.
create or replace function public.assumir_proxima_midia(p_prazo_seg int)
returns table (midia_id uuid, caminho text, tentativa int)
language sql security definer set search_path = '' as $$
  update public.midias m
     set processamento = 'falhou',
         motivo_processamento = 'Tentativas esgotadas: o processamento parou sem resposta.'
   where m.processamento = 'otimizando' and m.tentativas_processamento >= 3
     and m.processamento_iniciado_em < now() - make_interval(secs => greatest(p_prazo_seg, 60));

  update public.midias m
     set processamento = 'otimizando',
         tentativas_processamento = m.tentativas_processamento + 1,
         processamento_iniciado_em = now(),
         motivo_processamento = null
   where m.id = (
     select c.id from public.midias c
      where c.tentativas_processamento < 3 and c.enviada_em is not null
        and (c.processamento = 'aguardando'
          or (c.processamento = 'falhou' and c.processamento_iniciado_em < now() - interval '5 minutes')
          or (c.processamento = 'otimizando'
              and c.processamento_iniciado_em < now() - make_interval(secs => greatest(p_prazo_seg, 60))))
      order by c.criada_em, c.id
      limit 1
      for update skip locked
   )
  returning m.id, m.arquivo, m.tentativas_processamento;
$$;

commit;
