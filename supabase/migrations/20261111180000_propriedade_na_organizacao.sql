begin;

-- Envio de propriedade na organização escolhida (B01 etapa 2).
-- Com p_organizacao: exige vínculo (titular ou membro, a mesma regra do reenvio) com organização de produtor.
-- Sem p_organizacao: comportamento anterior (primeira organização em que é titular, ou cria uma).
-- Mudar a assinatura criaria um overload; por isso a versão antiga é removida.
drop function public.enviar_propriedade(text, text, text, numeric, text);

create function public.enviar_propriedade(p_nome text, p_cidade text, p_uf text, p_area numeric, p_culturas text,
  p_organizacao uuid default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare org uuid; prop uuid;
begin
  if auth.uid() is null or exists (
    select 1 from public.equipe_agrodireto where usuario_id = auth.uid()
  ) then
    raise insufficient_privilege using message = 'Envio não autorizado';
  end if;
  if p_organizacao is not null then
    select o.id into org from public.organizacoes o
      join public.membros_organizacao m on m.organizacao_id = o.id
     where o.id = p_organizacao and o.tipo = 'produtor' and m.usuario_id = auth.uid()
     for share of o;
    if org is null then
      raise insufficient_privilege using message = 'Envio não autorizado';
    end if;
  else
    perform pg_advisory_xact_lock(hashtext('organizacao:' || auth.uid()::text));
    select m.organizacao_id into org from public.membros_organizacao m
      join public.organizacoes o on o.id = m.organizacao_id
     where m.usuario_id = auth.uid() and m.papel = 'titular' and o.tipo = 'produtor'
     order by m.incluido_em, m.organizacao_id limit 1;
    if org is null then
      insert into public.organizacoes (nome, tipo) values (trim(p_nome), 'produtor') returning id into org;
      insert into public.membros_organizacao (organizacao_id, usuario_id, papel)
        values (org, auth.uid(), 'titular');
    end if;
  end if;
  insert into public.propriedades (usuario_id, organizacao_id, nome, cidade, uf, area, culturas)
  values (auth.uid(), org, trim(p_nome), trim(p_cidade), upper(trim(p_uf)), p_area, trim(p_culturas))
  on conflict (organizacao_id, lower(nome)) do nothing
  returning id into prop;
  if prop is null then
    select id into prop from public.propriedades
     where organizacao_id = org and lower(nome) = lower(trim(p_nome));
  end if;
  return prop;
end;
$$;
revoke all on function public.enviar_propriedade(text, text, text, numeric, text, uuid) from public, anon, authenticated;
grant execute on function public.enviar_propriedade(text, text, text, numeric, text, uuid) to authenticated;

commit;
