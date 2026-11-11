begin;

-- D08: o catálogo passa a exibir VÍDEO do lote, pelo mesmo caminho da foto: equipe aprova, produtor autoriza,
-- o worker grava a cópia sem metadados (MP4 H.264) em fotos-catalogo e o comprador autorizado vê enquanto a
-- oferta estiver vigente. Pendente, rejeitada ou não autorizada nunca sai (pode_ver_foto_catalogo não muda).

update storage.buckets set allowed_mime_types = array['image/webp', 'video/mp4'] where id = 'fotos-catalogo';

alter table public.evidencias_lote drop constraint foto_catalogo_caminho;
alter table public.evidencias_lote add constraint foto_catalogo_caminho check (
  copia_catalogo is null
  or (tipo = 'foto' and copia_catalogo = lote_id::text || '/' || chave || '.webp')
  or (tipo = 'video' and copia_catalogo = lote_id::text || '/' || chave || '.mp4')
);

-- Nome legado: desde a D08 autoriza foto OU vídeo do lote. Mantido para não quebrar o app do Agricultor.
create or replace function public.autorizar_foto_catalogo(p_lote uuid, p_chave text, p_autorizar boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.evidencias_lote e set autorizada_catalogo = p_autorizar
    from public.ofertas_lote o
   where e.lote_id = p_lote and e.chave = p_chave
     and p_autorizar is not null and o.id = e.lote_id and o.produtor_id = auth.uid()
     and (not p_autorizar or (e.revisao = 'aprovada' and o.retirada_em is null));
  if not found then raise sqlstate 'PT409' using message = 'Mídia indisponível para compartilhamento.'; end if;
end;
$$;

-- O retorno ganha o tipo; mudar o retorno exige recriar. Permissões iguais às de 20261111060000.
drop function public.listar_fotos_catalogo(uuid);
create function public.listar_fotos_catalogo(p_lote uuid)
returns table (arquivo text, tipo text) language sql stable security definer set search_path = '' as $$
  select e.copia_catalogo, e.tipo from public.evidencias_lote e
    where e.lote_id = p_lote and e.copia_catalogo is not null
      and agrodireto_privado.pode_ver_foto_catalogo(e.copia_catalogo)
    order by e.chave;
$$;
revoke all on function public.listar_fotos_catalogo(uuid) from public, anon, authenticated;
grant execute on function public.listar_fotos_catalogo(uuid) to authenticated;

commit;
