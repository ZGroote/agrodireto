begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidencias-lote', 'evidencias-lote', false, 6291456,
        array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime']);

create table public.evidencias_lote (
  lote_id uuid not null references public.ofertas_lote(id) on delete cascade,
  chave text not null check (chave ~ '^[a-z0-9-]{1,80}$'),
  arquivo text not null unique,
  tipo text not null check (tipo in ('foto','video')),
  enviada_em timestamptz,
  primary key (lote_id, chave)
);
alter table public.evidencias_lote enable row level security;
revoke all on public.evidencias_lote from public, anon, authenticated;
grant select on public.evidencias_lote to authenticated;
create policy evidencias_lote_dono on public.evidencias_lote for select to authenticated using (
  exists (select 1 from public.ofertas_lote o where o.id = lote_id and o.produtor_id = (select auth.uid()))
);

create policy evidencias_lote_storage_leitura on storage.objects for select to authenticated using (
  bucket_id = 'evidencias-lote'
  and exists (select 1 from public.evidencias_lote e where e.arquivo = name)
);
create policy evidencias_lote_storage_envio on storage.objects for insert to authenticated with check (
  bucket_id = 'evidencias-lote'
  and exists (
    select 1 from public.evidencias_lote e
    join public.ofertas_lote o on o.id = e.lote_id
    where e.arquivo = name and e.enviada_em is null
      and o.produtor_id = (select auth.uid()) and o.retirada_em is null
  )
  and exists (select 1 from public.propriedades p where p.usuario_id = (select auth.uid()) and p.status = 'aprovada')
);

create function public.reservar_evidencia_lote(p_lote uuid, p_chave text, p_extensao text)
returns text language plpgsql security definer set search_path = '' as $$
declare caminho text;
begin
  if not exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado) then
    raise sqlstate 'PT403' using message = 'Envio de evidências indisponível.';
  end if;
  perform 1 from public.propriedades where usuario_id = auth.uid() and status = 'aprovada' for update;
  if not found or not exists (
    select 1 from public.ofertas_lote where id = p_lote and produtor_id = auth.uid() and retirada_em is null
  ) then
    raise sqlstate 'PT403' using message = 'A oferta precisa estar publicada pela sua conta.';
  end if;
  if p_chave is null or p_chave !~ '^[a-z0-9-]{1,80}$' or p_extensao is null
     or p_extensao not in ('jpg','png','webp','mp4','mov') then
    raise sqlstate 'PT422' using message = 'Formato de evidência não aceito.';
  end if;
  caminho := auth.uid()::text || '/' || p_lote::text || '/' || p_chave || '.' || p_extensao;
  if exists (select 1 from public.evidencias_lote where arquivo = caminho) then return caminho; end if;
  if exists (select 1 from public.evidencias_lote where lote_id = p_lote and chave = p_chave) then
    raise sqlstate 'PT409' using message = 'A evidência já foi reservada com outro formato.';
  end if;
  if (select count(*) from public.evidencias_lote where lote_id = p_lote) >= 10 or (
    select count(*) from public.evidencias_lote e join public.ofertas_lote o on o.id = e.lote_id
    where o.produtor_id = auth.uid()
  ) >= 30 then
    raise sqlstate 'PT422' using message = 'Limite de evidências da homologação atingido.';
  end if;
  insert into public.evidencias_lote (lote_id, chave, arquivo, tipo)
  values (p_lote, p_chave, caminho, case when p_extensao in ('mp4','mov') then 'video' else 'foto' end);
  return caminho;
end;
$$;

create function public.confirmar_evidencia_lote(p_lote uuid, p_chave text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.evidencias_lote e
     set enviada_em = coalesce(e.enviada_em, now())
    from public.ofertas_lote o
   where e.lote_id = p_lote and e.chave = p_chave and o.id = e.lote_id and o.produtor_id = auth.uid()
     and exists (select 1 from storage.objects s where s.bucket_id = 'evidencias-lote' and s.name = e.arquivo);
  if not found then
    raise sqlstate 'PT409' using message = 'Arquivo ainda não confirmado.';
  end if;
end;
$$;

revoke all on function public.reservar_evidencia_lote(uuid,text,text),
  public.confirmar_evidencia_lote(uuid,text) from public, anon, authenticated;
grant execute on function public.reservar_evidencia_lote(uuid,text,text),
  public.confirmar_evidencia_lote(uuid,text) to authenticated;

commit;
