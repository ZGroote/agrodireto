begin;

-- Catálogo do piloto: vazio até a operação escolher região e culturas (plan.md §4).
create table public.catalogo_culturas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 80),
  segmento text not null check (segmento in ('hortifruti', 'graos', 'pecuaria', 'agroindustria')),
  unidades text[] not null check (cardinality(unidades) between 1 and 3 and unidades <@ array['kg', 'cx', 't']),
  ativo boolean not null default true
);
create unique index catalogo_culturas_nome on public.catalogo_culturas (segmento, lower(nome));

-- Cultura da propriedade com a previsão básica. Previsão é estimativa, nunca estoque.
create table public.culturas (
  id uuid primary key default gen_random_uuid(),
  propriedade_id uuid not null references public.propriedades (id) on delete cascade,
  catalogo_id uuid not null references public.catalogo_culturas (id),
  variedade text not null default '' check (char_length(variedade) <= 80),
  area_ha numeric not null check (area_ha > 0 and area_ha <= 1000000),
  plantio date,
  etapa text not null default '' check (char_length(etapa) <= 60),
  unidade text check (unidade in ('kg', 'cx', 't')),
  estimativa bigint check (estimativa between 1 and 1000000000),
  minimo bigint,
  maximo bigint,
  colheita date,
  criado_por uuid not null,
  atualizado_por uuid not null,
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  check ((unidade is null) = (estimativa is null) and (estimativa is null) = (colheita is null)),
  check ((minimo is null) = (maximo is null)),
  check (minimo is null or (estimativa is not null and minimo >= 1 and minimo <= estimativa and estimativa <= maximo))
);
create index culturas_propriedade on public.culturas (propriedade_id);

alter table public.catalogo_culturas enable row level security;
alter table public.culturas enable row level security;
revoke all on public.catalogo_culturas, public.culturas from public, anon, authenticated;
grant select on public.catalogo_culturas, public.culturas to authenticated;

create policy catalogo_culturas_leitura on public.catalogo_culturas for select to authenticated using (true);
create policy culturas_leitura on public.culturas for select to authenticated using (
  exists (
    select 1 from public.propriedades p
     where p.id = propriedade_id and agrodireto_privado.e_membro(p.organizacao_id)
  ) or (select public.acesso_equipe()) = 'autorizado'
);

create function public.salvar_cultura(
  p_id uuid, p_propriedade uuid, p_catalogo uuid,
  p_variedade text, p_area numeric, p_plantio date, p_etapa text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_unidades text[];
  v_id uuid;
begin
  if not exists (
    select 1 from public.propriedades
     where id = p_propriedade and agrodireto_privado.e_membro(organizacao_id)
  ) then
    raise insufficient_privilege using message = 'Propriedade não autorizada';
  end if;
  select unidades into v_unidades from public.catalogo_culturas where id = p_catalogo and ativo;
  if v_unidades is null then
    raise sqlstate 'PT422' using message = 'Cultura fora do catálogo';
  end if;

  if p_id is null then
    insert into public.culturas (propriedade_id, catalogo_id, variedade, area_ha, plantio, etapa, criado_por, atualizado_por)
    values (p_propriedade, p_catalogo, trim(coalesce(p_variedade, '')), p_area, p_plantio, trim(coalesce(p_etapa, '')), auth.uid(), auth.uid())
    returning id into v_id;
    return v_id;
  end if;

  select c.id into v_id from public.culturas c
    join public.propriedades p on p.id = c.propriedade_id
   where c.id = p_id and agrodireto_privado.e_membro(p.organizacao_id)
   for update of c;
  if v_id is null then
    raise sqlstate 'PT404' using message = 'Cultura não encontrada';
  end if;
  if exists (select 1 from public.culturas where id = p_id and unidade is not null and not unidade = any (v_unidades)) then
    raise sqlstate 'PT422' using message = 'A unidade da previsão não vale para a cultura escolhida';
  end if;
  update public.culturas
     set propriedade_id = p_propriedade, catalogo_id = p_catalogo, variedade = trim(coalesce(p_variedade, '')),
         area_ha = p_area, plantio = p_plantio, etapa = trim(coalesce(p_etapa, '')),
         atualizado_por = auth.uid(), atualizada_em = now()
   where id = p_id;
  return v_id;
end;
$$;

create function public.salvar_previsao(
  p_id uuid, p_unidade text, p_estimativa bigint, p_minimo bigint, p_maximo bigint, p_colheita date
)
returns void language plpgsql security definer set search_path = '' as $$
declare v_unidades text[];
begin
  select k.unidades into v_unidades from public.culturas c
    join public.propriedades p on p.id = c.propriedade_id
    join public.catalogo_culturas k on k.id = c.catalogo_id
   where c.id = p_id and agrodireto_privado.e_membro(p.organizacao_id)
   for update of c;
  if v_unidades is null then
    raise sqlstate 'PT404' using message = 'Cultura não encontrada';
  end if;
  if p_unidade is null or not p_unidade = any (v_unidades) then
    raise sqlstate 'PT422' using message = 'Unidade não aceita para esta cultura';
  end if;
  update public.culturas
     set unidade = p_unidade, estimativa = p_estimativa, minimo = p_minimo, maximo = p_maximo,
         colheita = p_colheita, atualizado_por = auth.uid(), atualizada_em = now()
   where id = p_id;
end;
$$;

revoke all on function public.salvar_cultura(uuid, uuid, uuid, text, numeric, date, text) from public, anon, authenticated;
revoke all on function public.salvar_previsao(uuid, text, bigint, bigint, bigint, date) from public, anon, authenticated;
grant execute on function public.salvar_cultura(uuid, uuid, uuid, text, numeric, date, text) to authenticated;
grant execute on function public.salvar_previsao(uuid, text, bigint, bigint, bigint, date) to authenticated;

commit;
