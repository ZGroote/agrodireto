begin;

alter table public.propriedades
  drop constraint propriedades_status_check,
  add constraint propriedades_status_check check (status in ('em_analise', 'ajustes_solicitados', 'aprovada')),
  add column motivo_ajuste text check (char_length(motivo_ajuste) between 1 and 500),
  add column ajuste_solicitado_em timestamptz,
  add column ajuste_solicitado_por uuid references auth.users (id) on delete set null;

create function public.revisar_propriedade(p_usuario_id uuid, p_enviada_em timestamptz, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.acesso_equipe() <> 'autorizado' then
    raise insufficient_privilege using message = 'Revisão não autorizada';
  end if;

  update public.propriedades
     set status = case when p_motivo is null then 'aprovada' else 'ajustes_solicitados' end,
         aprovada_em = case when p_motivo is null then now() end,
         aprovada_por = case when p_motivo is null then auth.uid() end,
         motivo_ajuste = trim(p_motivo),
         ajuste_solicitado_em = case when p_motivo is not null then now() end,
         ajuste_solicitado_por = case when p_motivo is not null then auth.uid() end
   where usuario_id = p_usuario_id and status = 'em_analise' and enviada_em = p_enviada_em;

  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
end;
$$;

create function public.reenviar_propriedade(p_enviada_em timestamptz, p_nome text, p_cidade text, p_uf text, p_area numeric, p_culturas text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.propriedades
     set nome = trim(p_nome), cidade = trim(p_cidade), uf = upper(trim(p_uf)),
         area = p_area, culturas = trim(p_culturas), status = 'em_analise',
         enviada_em = clock_timestamp(), motivo_ajuste = null,
         ajuste_solicitado_em = null, ajuste_solicitado_por = null
   where usuario_id = auth.uid() and status = 'ajustes_solicitados' and enviada_em = p_enviada_em;

  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
end;
$$;

revoke all on function public.revisar_propriedade(uuid,timestamptz,text), public.reenviar_propriedade(timestamptz,text,text,text,numeric,text) from public, anon, authenticated;
grant execute on function public.revisar_propriedade(uuid,timestamptz,text), public.reenviar_propriedade(timestamptz,text,text,text,numeric,text) to authenticated;

commit;
