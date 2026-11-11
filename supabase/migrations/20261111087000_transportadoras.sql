begin;

-- Cadastro da transportadora: mesmo ciclo do comprador (em_analise → ajustes_solicitados → aprovada).
-- Depende de 20261111085000_compradores.sql (organizacoes.tipo e agrodireto_privado.cnpj_valido).

create table public.cadastros_transportadora (
  organizacao_id uuid primary key references public.organizacoes (id) on delete cascade,
  enviado_por uuid not null references auth.users (id) on delete cascade,
  razao_social text not null check (char_length(razao_social) between 2 and 160),
  cnpj text not null unique check (agrodireto_privado.cnpj_valido(cnpj)),
  contato_nome text not null check (char_length(contato_nome) between 2 and 120),
  contato_telefone text not null check (contato_telefone ~ '^[0-9]{10,11}$'),
  cidade text not null check (char_length(cidade) between 2 and 100),
  uf text not null check (uf in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  ufs_atendidas text[] not null check (
    cardinality(ufs_atendidas) > 0
    and ufs_atendidas <@ array['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
  ),
  -- Requisitos de G08; a compatibilidade com veículo e carga é regra de lá.
  tipos_carga text[] not null check (
    cardinality(tipos_carga) > 0
    and tipos_carga <@ array['carga_seca','refrigerada','granel','animais_vivos']
  ),
  status text not null default 'em_analise' check (status in ('em_analise', 'ajustes_solicitados', 'aprovada')),
  enviada_em timestamptz not null default now(),
  motivo_ajuste text check (char_length(motivo_ajuste) between 1 and 500),
  ajuste_solicitado_em timestamptz,
  ajuste_solicitado_por uuid references auth.users (id) on delete set null,
  aprovada_em timestamptz,
  aprovada_por uuid references auth.users (id) on delete set null
);

alter table public.cadastros_transportadora enable row level security;
revoke all on public.cadastros_transportadora from public, anon, authenticated;
grant select on public.cadastros_transportadora to authenticated;
create policy cadastros_transportadora_leitura on public.cadastros_transportadora for select to authenticated using (
  agrodireto_privado.e_membro(organizacao_id) or (select public.acesso_equipe()) = 'autorizado'
);

-- Listas sem repetição e em maiúsculas/minúsculas canônicas; null dentro da lista cai no check.
create function agrodireto_privado.lista_normalizada(p text[], p_maiuscula boolean)
returns text[] language sql immutable set search_path = '' as $$
  select coalesce(array_agg(distinct case when p_maiuscula then upper(trim(x)) else lower(trim(x)) end), '{}')
    from unnest(p) x;
$$;
revoke all on function agrodireto_privado.lista_normalizada(text[], boolean) from public, anon, authenticated;

-- Envio: cria a transportadora no primeiro envio; repetir não duplica.
create function public.enviar_cadastro_transportadora(
  p_razao_social text, p_cnpj text, p_contato_nome text, p_contato_telefone text,
  p_cidade text, p_uf text, p_ufs_atendidas text[], p_tipos_carga text[]
) returns uuid language plpgsql security definer set search_path = '' as $$
declare org uuid;
begin
  if auth.uid() is null or exists (
    select 1 from public.equipe_agrodireto where usuario_id = auth.uid()
  ) then
    raise insufficient_privilege using message = 'Envio não autorizado';
  end if;
  perform pg_advisory_xact_lock(hashtext('transportadora:' || auth.uid()::text));
  select m.organizacao_id into org from public.membros_organizacao m
    join public.organizacoes o on o.id = m.organizacao_id
   where m.usuario_id = auth.uid() and m.papel = 'titular' and o.tipo = 'transportadora'
   order by m.incluido_em, m.organizacao_id limit 1;
  if org is not null then return org; end if;

  insert into public.organizacoes (nome, tipo) values (trim(p_razao_social), 'transportadora') returning id into org;
  insert into public.membros_organizacao (organizacao_id, usuario_id, papel) values (org, auth.uid(), 'titular');
  insert into public.cadastros_transportadora (
    organizacao_id, enviado_por, razao_social, cnpj, contato_nome, contato_telefone,
    cidade, uf, ufs_atendidas, tipos_carga
  ) values (
    org, auth.uid(), trim(p_razao_social), upper(regexp_replace(p_cnpj, '[^0-9A-Za-z]', '', 'g')),
    trim(p_contato_nome), regexp_replace(p_contato_telefone, '[^0-9]', '', 'g'),
    trim(p_cidade), upper(trim(p_uf)),
    agrodireto_privado.lista_normalizada(p_ufs_atendidas, true),
    agrodireto_privado.lista_normalizada(p_tipos_carga, false)
  );
  return org;
end;
$$;

create function public.reenviar_cadastro_transportadora(
  p_organizacao_id uuid, p_enviada_em timestamptz,
  p_razao_social text, p_cnpj text, p_contato_nome text, p_contato_telefone text,
  p_cidade text, p_uf text, p_ufs_atendidas text[], p_tipos_carga text[]
) returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.cadastros_transportadora
     set razao_social = trim(p_razao_social), cnpj = upper(regexp_replace(p_cnpj, '[^0-9A-Za-z]', '', 'g')),
         contato_nome = trim(p_contato_nome), contato_telefone = regexp_replace(p_contato_telefone, '[^0-9]', '', 'g'),
         cidade = trim(p_cidade), uf = upper(trim(p_uf)),
         ufs_atendidas = agrodireto_privado.lista_normalizada(p_ufs_atendidas, true),
         tipos_carga = agrodireto_privado.lista_normalizada(p_tipos_carga, false),
         status = 'em_analise', enviada_em = clock_timestamp(), motivo_ajuste = null,
         ajuste_solicitado_em = null, ajuste_solicitado_por = null
   where organizacao_id = p_organizacao_id and agrodireto_privado.e_membro(organizacao_id)
     and status = 'ajustes_solicitados' and enviada_em = p_enviada_em;
  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
  update public.organizacoes set nome = trim(p_razao_social) where id = p_organizacao_id;
end;
$$;

create function public.revisar_cadastro_transportadora(p_organizacao_id uuid, p_enviada_em timestamptz, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.acesso_equipe() <> 'autorizado' then
    raise insufficient_privilege using message = 'Revisão não autorizada';
  end if;
  update public.cadastros_transportadora
     set status = case when p_motivo is null then 'aprovada' else 'ajustes_solicitados' end,
         aprovada_em = case when p_motivo is null then now() end,
         aprovada_por = case when p_motivo is null then auth.uid() end,
         motivo_ajuste = trim(p_motivo),
         ajuste_solicitado_em = case when p_motivo is not null then now() end,
         ajuste_solicitado_por = case when p_motivo is not null then auth.uid() end
   where organizacao_id = p_organizacao_id and status = 'em_analise' and enviada_em = p_enviada_em;
  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
end;
$$;

revoke all on function public.enviar_cadastro_transportadora(text, text, text, text, text, text, text[], text[]),
  public.reenviar_cadastro_transportadora(uuid, timestamptz, text, text, text, text, text, text, text[], text[]),
  public.revisar_cadastro_transportadora(uuid, timestamptz, text) from public, anon, authenticated;
grant execute on function public.enviar_cadastro_transportadora(text, text, text, text, text, text, text[], text[]),
  public.reenviar_cadastro_transportadora(uuid, timestamptz, text, text, text, text, text, text, text[], text[]),
  public.revisar_cadastro_transportadora(uuid, timestamptz, text) to authenticated;

commit;
