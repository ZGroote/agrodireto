begin;

-- B01: seleção auditada; nunca substitui a autorização por vínculo nas operações.
create table public.trocas_contexto (
  usuario uuid not null references auth.users(id) on delete cascade,
  perfil text not null check (perfil in ('produtor', 'comprador', 'transportadora')),
  organizacao_origem uuid references public.organizacoes(id),
  organizacao_destino uuid not null references public.organizacoes(id),
  em timestamptz not null,
  primary key (usuario, perfil, em)
);
alter table public.trocas_contexto enable row level security;
revoke all on public.trocas_contexto from public, anon, authenticated;
grant select on public.trocas_contexto to authenticated;
create policy trocas_contexto_leitura on public.trocas_contexto for select to authenticated
  using (usuario = (select auth.uid()));

-- Resposta neutra inclusive para e-mail ausente, vazio ou já vinculado.
-- Nenhuma consulta pública a auth.users e nenhuma concessão de papel administrativo.
create function public.incluir_membro(p_organizacao uuid, p_email text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not agrodireto_privado.e_titular(p_organizacao) then
    raise insufficient_privilege using message = 'Inclusão não autorizada';
  end if;
  perform 1 from public.membros_organizacao
   where organizacao_id = p_organizacao and usuario_id = auth.uid() and papel = 'titular'
   for share;
  if not found then raise insufficient_privilege using message = 'Inclusão não autorizada'; end if;
  insert into public.membros_organizacao (organizacao_id, usuario_id, papel)
    select p_organizacao, u.id, 'membro' from auth.users u
     where lower(u.email) = lower(trim(p_email)) and nullif(trim(p_email), '') is not null
    on conflict (organizacao_id, usuario_id) do nothing;
end;
$$;

create function public.listar_meus_vinculos()
returns table (organizacao_id uuid, nome text, perfil text, papel text,
  status_cadastro text, propriedades_aprovadas bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise insufficient_privilege using message = 'Sessão necessária'; end if;
  return query
    select o.id, o.nome, o.tipo, m.papel,
      case o.tipo when 'comprador' then c.status when 'transportadora' then t.status end,
      (select count(*) from public.propriedades p where p.organizacao_id = o.id and p.status = 'aprovada')
    from public.membros_organizacao m
    join public.organizacoes o on o.id = m.organizacao_id
    left join public.cadastros_comprador c on c.organizacao_id = o.id
    left join public.cadastros_transportadora t on t.organizacao_id = o.id
    where m.usuario_id = auth.uid()
    order by o.tipo, o.nome, o.id;
end;
$$;

create function public.contexto_atual(p_perfil text)
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare destino uuid;
begin
  if auth.uid() is null then raise insufficient_privilege using message = 'Sessão necessária'; end if;
  if p_perfil is null or p_perfil not in ('produtor', 'comprador', 'transportadora') then
    raise invalid_parameter_value using message = 'Perfil inválido';
  end if;
  select t.organizacao_destino into destino from public.trocas_contexto t
   where t.usuario = auth.uid() and t.perfil = p_perfil order by t.em desc limit 1;
  -- Revogação não reativa silenciosamente uma organização anterior.
  if exists (select 1 from public.organizacoes o where o.id = destino and o.tipo = p_perfil)
     and agrodireto_privado.e_membro(destino) then return destino; end if;
  return null;
end;
$$;

create function public.trocar_contexto(p_perfil text, p_organizacao uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare anterior public.trocas_contexto%rowtype;
begin
  if auth.uid() is null then raise insufficient_privilege using message = 'Sessão necessária'; end if;
  if p_perfil is null or p_perfil not in ('produtor', 'comprador', 'transportadora') then
    raise invalid_parameter_value using message = 'Perfil inválido';
  end if;
  perform pg_advisory_xact_lock(hashtext('contexto:' || auth.uid()::text || ':' || p_perfil));
  perform 1 from public.membros_organizacao m join public.organizacoes o on o.id = m.organizacao_id
   where m.usuario_id = auth.uid() and o.id = p_organizacao and o.tipo = p_perfil
   for share of m, o;
  if not found then raise insufficient_privilege using message = 'Contexto não autorizado'; end if;
  select t.* into anterior from public.trocas_contexto t
   where t.usuario = auth.uid() and t.perfil = p_perfil order by t.em desc limit 1;
  if anterior.organizacao_destino = p_organizacao then return p_organizacao; end if;
  insert into public.trocas_contexto(usuario, perfil, organizacao_origem, organizacao_destino, em)
    values (auth.uid(), p_perfil, anterior.organizacao_destino, p_organizacao,
      greatest(clock_timestamp(), anterior.em + interval '1 microsecond'));
  return p_organizacao;
end;
$$;

revoke all on function public.incluir_membro(uuid, text), public.listar_meus_vinculos(),
  public.contexto_atual(text), public.trocar_contexto(text, uuid) from public, anon, authenticated;
grant execute on function public.incluir_membro(uuid, text), public.listar_meus_vinculos(),
  public.contexto_atual(text), public.trocar_contexto(text, uuid) to authenticated;

-- Mesma assinatura e grants; alinha o comprador à regra da transportadora.
create or replace function public.reenviar_cadastro_comprador(
  p_organizacao_id uuid, p_enviada_em timestamptz,
  p_razao_social text, p_cnpj text, p_contato_nome text, p_contato_telefone text,
  p_cidade text, p_uf text, p_endereco_entrega text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if agrodireto_privado.e_membro(p_organizacao_id) and not agrodireto_privado.e_titular(p_organizacao_id) then
    raise insufficient_privilege using message = 'Só o titular reenvia o cadastro';
  end if;
  update public.cadastros_comprador
     set razao_social = trim(p_razao_social), cnpj = upper(regexp_replace(p_cnpj, '[^0-9A-Za-z]', '', 'g')),
         contato_nome = trim(p_contato_nome), contato_telefone = regexp_replace(p_contato_telefone, '[^0-9]', '', 'g'),
         cidade = trim(p_cidade), uf = upper(trim(p_uf)), endereco_entrega = trim(p_endereco_entrega),
         status = 'em_analise', enviada_em = clock_timestamp(), motivo_ajuste = null,
         ajuste_solicitado_em = null, ajuste_solicitado_por = null
   where organizacao_id = p_organizacao_id and agrodireto_privado.e_titular(organizacao_id)
     and status = 'ajustes_solicitados' and enviada_em = p_enviada_em;
  if not found then raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.'; end if;
  update public.organizacoes set nome = trim(p_razao_social) where id = p_organizacao_id;
end;
$$;

commit;
