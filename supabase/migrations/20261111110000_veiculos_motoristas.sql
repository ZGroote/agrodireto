begin;

-- G03: frota da transportadora. Depende de 20261111087000_transportadoras.sql.
-- Checks só de formato; validade de CNH e seguro é conferida na gravação (RPC) e de novo em G04.

create function agrodireto_privado.cpf_valido(p text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare d int[]; s int;
begin
  if p is null or p !~ '^[0-9]{11}$' or p ~ '^(.)\1{10}$' then return false; end if;
  d := array(select substr(p, i, 1)::int from generate_series(1, 11) i);
  for n in 9..10 loop
    s := 0;
    for i in 1..n loop s := s + d[i] * (n + 2 - i); end loop;
    if (s * 10) % 11 % 10 <> d[n + 1] then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function agrodireto_privado.cpf_valido(text) from public, anon, authenticated;

create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  organizacao_id uuid not null references public.cadastros_transportadora (organizacao_id) on delete cascade,
  placa text not null unique check (placa ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'),
  renavam text not null check (renavam ~ '^[0-9]{11}$'),
  tipo text not null check (tipo in ('bau', 'refrigerado', 'graneleiro', 'boiadeiro', 'carroceria')),
  capacidade_kg integer not null check (capacidade_kg between 1 and 100000),
  seguro_validade date not null,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid references auth.users (id) on delete set null,
  unique (id, organizacao_id)
);
create index veiculos_organizacao on public.veiculos (organizacao_id);

create table public.motoristas (
  id uuid primary key default gen_random_uuid(),
  organizacao_id uuid not null references public.cadastros_transportadora (organizacao_id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 120),
  cpf text not null check (agrodireto_privado.cpf_valido(cpf)),
  cnh_numero text not null check (cnh_numero ~ '^[0-9]{11}$'),
  cnh_categoria text not null check (cnh_categoria in ('B', 'C', 'D', 'E')),
  cnh_validade date not null,
  -- FK composta: o veículo tem de ser da mesma transportadora.
  veiculo_id uuid,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid references auth.users (id) on delete set null,
  unique (organizacao_id, cpf),
  foreign key (veiculo_id, organizacao_id) references public.veiculos (id, organizacao_id)
);
create index motoristas_veiculo on public.motoristas (veiculo_id);

alter table public.veiculos enable row level security;
alter table public.motoristas enable row level security;
revoke all on public.veiculos, public.motoristas from public, anon, authenticated;
grant select on public.veiculos, public.motoristas to authenticated;
create policy veiculos_leitura on public.veiculos for select to authenticated using (
  agrodireto_privado.e_membro(organizacao_id) or (select public.acesso_equipe()) = 'autorizado'
);
create policy motoristas_leitura on public.motoristas for select to authenticated using (
  agrodireto_privado.e_membro(organizacao_id) or (select public.acesso_equipe()) = 'autorizado'
);

-- Só membro de uma transportadora grava a frota dela; equipe consulta.
create function agrodireto_privado.exigir_membro_transportadora(p_organizacao_id uuid)
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null
     or exists (select 1 from public.equipe_agrodireto where usuario_id = auth.uid())
     or not agrodireto_privado.e_membro(p_organizacao_id)
     or not exists (select 1 from public.cadastros_transportadora where organizacao_id = p_organizacao_id) then
    raise insufficient_privilege using message = 'Cadastro de frota não autorizado';
  end if;
end;
$$;
revoke all on function agrodireto_privado.exigir_membro_transportadora(uuid) from public, anon, authenticated;

-- p_id nulo cria; preenchido edita o veículo da mesma transportadora.
create function public.salvar_veiculo(
  p_id uuid, p_organizacao_id uuid, p_placa text, p_renavam text, p_tipo text,
  p_capacidade_kg integer, p_seguro_validade date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v uuid;
begin
  perform agrodireto_privado.exigir_membro_transportadora(p_organizacao_id);
  if p_seguro_validade is null or p_seguro_validade < current_date then
    raise sqlstate 'PT422' using message = 'Seguro do veículo vencido';
  end if;
  if p_id is null then
    insert into public.veiculos (organizacao_id, placa, renavam, tipo, capacidade_kg, seguro_validade, atualizado_por)
    values (p_organizacao_id, upper(regexp_replace(p_placa, '[^0-9A-Za-z]', '', 'g')), regexp_replace(p_renavam, '[^0-9]', '', 'g'),
            p_tipo, p_capacidade_kg, p_seguro_validade, auth.uid())
    returning id into v;
  else
    update public.veiculos
       set placa = upper(regexp_replace(p_placa, '[^0-9A-Za-z]', '', 'g')), renavam = regexp_replace(p_renavam, '[^0-9]', '', 'g'),
           tipo = p_tipo, capacidade_kg = p_capacidade_kg, seguro_validade = p_seguro_validade,
           atualizado_em = now(), atualizado_por = auth.uid()
     where id = p_id and organizacao_id = p_organizacao_id
    returning id into v;
    if v is null then raise insufficient_privilege using message = 'Veículo não encontrado'; end if;
  end if;
  return v;
end;
$$;

create function public.salvar_motorista(
  p_id uuid, p_organizacao_id uuid, p_nome text, p_cpf text, p_cnh_numero text,
  p_cnh_categoria text, p_cnh_validade date, p_veiculo_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare m uuid;
begin
  perform agrodireto_privado.exigir_membro_transportadora(p_organizacao_id);
  if p_cnh_validade is null or p_cnh_validade < current_date then
    raise sqlstate 'PT422' using message = 'CNH vencida';
  end if;
  if p_id is null then
    insert into public.motoristas (organizacao_id, nome, cpf, cnh_numero, cnh_categoria, cnh_validade, veiculo_id, atualizado_por)
    values (p_organizacao_id, trim(p_nome), regexp_replace(p_cpf, '[^0-9]', '', 'g'), regexp_replace(p_cnh_numero, '[^0-9]', '', 'g'),
            upper(trim(p_cnh_categoria)), p_cnh_validade, p_veiculo_id, auth.uid())
    returning id into m;
  else
    update public.motoristas
       set nome = trim(p_nome), cpf = regexp_replace(p_cpf, '[^0-9]', '', 'g'), cnh_numero = regexp_replace(p_cnh_numero, '[^0-9]', '', 'g'),
           cnh_categoria = upper(trim(p_cnh_categoria)), cnh_validade = p_cnh_validade, veiculo_id = p_veiculo_id,
           atualizado_em = now(), atualizado_por = auth.uid()
     where id = p_id and organizacao_id = p_organizacao_id
    returning id into m;
    if m is null then raise insufficient_privilege using message = 'Motorista não encontrado'; end if;
  end if;
  return m;
end;
$$;

revoke all on function public.salvar_veiculo(uuid, uuid, text, text, text, integer, date),
  public.salvar_motorista(uuid, uuid, text, text, text, text, date, uuid) from public, anon, authenticated;
grant execute on function public.salvar_veiculo(uuid, uuid, text, text, text, integer, date),
  public.salvar_motorista(uuid, uuid, text, text, text, text, date, uuid) to authenticated;

commit;
