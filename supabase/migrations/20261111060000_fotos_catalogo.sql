begin;

insert into storage.buckets (id, name, public, allowed_mime_types)
values ('fotos-catalogo', 'fotos-catalogo', false, array['image/webp']);

alter table public.evidencias_lote
  add column autorizada_catalogo boolean not null default false,
  add column copia_catalogo text unique,
  add constraint foto_catalogo_caminho check (
    copia_catalogo is null or (tipo = 'foto' and copia_catalogo = lote_id::text || '/' || chave || '.webp')
  );

grant select (lote_id, chave, tipo, arquivo, revisao, autorizada_catalogo, copia_catalogo)
  on public.evidencias_lote to service_role;
grant update (copia_catalogo) on public.evidencias_lote to service_role;

create function public.autorizar_foto_catalogo(p_lote uuid, p_chave text, p_autorizar boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.evidencias_lote e set autorizada_catalogo = p_autorizar
    from public.ofertas_lote o
   where e.lote_id = p_lote and e.chave = p_chave and e.tipo = 'foto'
     and p_autorizar is not null and o.id = e.lote_id and o.produtor_id = auth.uid()
     and (not p_autorizar or (e.revisao = 'aprovada' and o.retirada_em is null));
  if not found then raise sqlstate 'PT409' using message = 'Foto indisponível para compartilhamento.'; end if;
end;
$$;

create function agrodireto_privado.pode_ver_foto_catalogo(p_arquivo text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado)
     and exists (select 1 from agrodireto_privado.compradores_catalogo where usuario_id = auth.uid())
     and exists (
       select 1 from public.evidencias_lote e
       join public.ofertas_lote o on o.id = e.lote_id
       join public.propriedades p on p.usuario_id = o.produtor_id
       where e.copia_catalogo = p_arquivo and e.revisao = 'aprovada' and e.autorizada_catalogo
         and o.retirada_em is null and p.status = 'aprovada'
         and least(o.validade, o.retirada_fim) >= (now() at time zone 'America/Sao_Paulo')::date
     );
$$;

create policy fotos_catalogo_leitura on storage.objects for select to authenticated using (
  bucket_id = 'fotos-catalogo' and agrodireto_privado.pode_ver_foto_catalogo(name)
);

create function public.listar_fotos_catalogo(p_lote uuid)
returns table (arquivo text) language sql stable security definer set search_path = '' as $$
  select e.copia_catalogo from public.evidencias_lote e
    where e.lote_id = p_lote and e.copia_catalogo is not null
      and agrodireto_privado.pode_ver_foto_catalogo(e.copia_catalogo)
    order by e.chave;
$$;

revoke all on function agrodireto_privado.pode_ver_foto_catalogo(text),
  public.autorizar_foto_catalogo(uuid,text,boolean), public.listar_fotos_catalogo(uuid) from public, anon, authenticated;
grant execute on function agrodireto_privado.pode_ver_foto_catalogo(text),
  public.autorizar_foto_catalogo(uuid,text,boolean), public.listar_fotos_catalogo(uuid) to authenticated;

commit;
