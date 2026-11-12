begin;

-- E03: demandas estruturadas do comprador (região do piloto: SP intraestadual).
-- exige organizacao_id explícito e confere aprovação dessa empresa (DOC 032).

create table public.demandas_compra (
  id uuid primary key default gen_random_uuid(),
  organizacao_id uuid not null references public.cadastros_comprador (organizacao_id) on delete cascade,
  catalogo_id uuid not null references public.catalogo_culturas (id),
  quantidade numeric not null check (quantidade > 0 and quantidade <= 1000000000),
  unidade text not null check (unidade in ('kg', 'cx', 't', 'sc')),
  prazo date not null,
  uf text not null default 'SP' check (uf = 'SP'),
  observacao text not null default '' check (char_length(observacao) <= 1000),
  status text not null default 'aberta' check (status in ('aberta', 'encerrada')),
  criado_por uuid not null,
  atualizado_por uuid not null,
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  encerrada_em timestamptz,
  check ((status = 'encerrada') = (encerrada_em is not null))
);
create index demandas_compra_organizacao on public.demandas_compra (organizacao_id, criada_em desc);
create index demandas_compra_abertas on public.demandas_compra (status, prazo) where status = 'aberta';

alter table public.demandas_compra enable row level security;
revoke all on public.demandas_compra from public, anon, authenticated;
grant select on public.demandas_compra to authenticated;

-- RLS de leitura direta: apenas membros da empresa compradora aprovada ou equipe com ler_ofertas.
-- Produtores consultam demandas abertas via RPC listar_demandas_abertas (não veem demandas encerradas nem dados privados).
create policy demandas_compra_leitura on public.demandas_compra for select to authenticated using (
  (
    agrodireto_privado.e_membro(organizacao_id)
    and exists (
      select 1 from public.cadastros_comprador c
       where c.organizacao_id = demandas_compra.organizacao_id and c.status = 'aprovada'
    )
  )
  or (select public.equipe_pode('ler_ofertas'))
);

create function public.salvar_demanda_compra(
  p_id uuid, p_organizacao_id uuid, p_catalogo_id uuid,
  p_quantidade numeric, p_unidade text, p_prazo date, p_uf text, p_observacao text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_unidades text[];
  v_id uuid;
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if auth.uid() is null or p_organizacao_id is null
     or exists (select 1 from public.equipe_agrodireto where usuario_id = auth.uid())
     or not agrodireto_privado.e_membro(p_organizacao_id) then
    raise insufficient_privilege using message = 'Empresa compradora não autorizada';
  end if;

  perform 1 from public.cadastros_comprador
   where organizacao_id = p_organizacao_id and status = 'aprovada'
   for share;
  if not found then
    raise sqlstate 'PT403' using message = 'A empresa compradora precisa estar aprovada para publicar demandas';
  end if;

  if upper(trim(coalesce(p_uf, ''))) <> 'SP' then
    raise sqlstate 'PT422' using message = 'No piloto, as demandas são restritas a SP';
  end if;

  if p_prazo is null or p_prazo < v_hoje then
    raise sqlstate 'PT422' using message = 'O prazo da demanda precisa estar vigente';
  end if;

  select unidades into v_unidades from public.catalogo_culturas where id = p_catalogo_id and ativo;
  if v_unidades is null or p_unidade is null or not p_unidade = any (v_unidades) then
    raise sqlstate 'PT422' using message = 'Escolha uma cultura ativa e uma unidade válida do catálogo';
  end if;

  if p_id is null then
    insert into public.demandas_compra (
      organizacao_id, catalogo_id, quantidade, unidade, prazo, uf, observacao, criado_por, atualizado_por
    ) values (
      p_organizacao_id, p_catalogo_id, p_quantidade, p_unidade, p_prazo, 'SP',
      trim(coalesce(p_observacao, '')), auth.uid(), auth.uid()
    ) returning id into v_id;
    return v_id;
  end if;

  select d.id into v_id from public.demandas_compra d
   where d.id = p_id and d.organizacao_id = p_organizacao_id and d.status = 'aberta'
   for update of d;
  if v_id is null then
    raise sqlstate 'PT404' using message = 'Demanda aberta não encontrada para esta empresa';
  end if;

  update public.demandas_compra
     set catalogo_id = p_catalogo_id,
         quantidade = p_quantidade,
         unidade = p_unidade,
         prazo = p_prazo,
         uf = 'SP',
         observacao = trim(coalesce(p_observacao, '')),
         atualizado_por = auth.uid(),
         atualizada_em = now()
   where id = p_id;
  return v_id;
end;
$$;

create function public.encerrar_demanda_compra(p_id uuid, p_organizacao_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or p_organizacao_id is null
     or exists (select 1 from public.equipe_agrodireto where usuario_id = auth.uid())
     or not agrodireto_privado.e_membro(p_organizacao_id) then
    raise insufficient_privilege using message = 'Empresa compradora não autorizada';
  end if;

  perform 1 from public.cadastros_comprador
   where organizacao_id = p_organizacao_id and status = 'aprovada'
   for share;
  if not found then
    raise sqlstate 'PT403' using message = 'A empresa compradora precisa estar aprovada';
  end if;

  update public.demandas_compra
     set status = 'encerrada',
         encerrada_em = coalesce(encerrada_em, now()),
         atualizado_por = auth.uid(),
         atualizada_em = now()
   where id = p_id and organizacao_id = p_organizacao_id;
  if not found then
    raise sqlstate 'PT404' using message = 'Demanda não encontrada para esta empresa';
  end if;
end;
$$;

-- Leitura para o Agricultor (produtor com propriedade aprovada) ou equipe com ler_ofertas.
create function public.listar_demandas_abertas(p_busca text default '', p_pagina integer default 0)
returns table (
  id uuid, catalogo_id uuid, cultura text, segmento text,
  comprador text, cidade text, uf text,
  quantidade numeric, unidade text, prazo date, observacao text, criada_em timestamptz
) language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or (
    not (select public.equipe_pode('ler_ofertas'))
    and not exists (
      select 1 from public.propriedades p
       where p.status = 'aprovada' and agrodireto_privado.e_membro(p.organizacao_id)
    )
  ) then
    raise sqlstate 'PT403' using message = 'Demandas disponíveis para produtores com propriedade aprovada.';
  end if;

  return query
    select d.id, d.catalogo_id, k.nome, k.segmento,
           c.razao_social, c.cidade, d.uf,
           d.quantidade, d.unidade, d.prazo, d.observacao, d.criada_em
      from public.demandas_compra d
      join public.catalogo_culturas k on k.id = d.catalogo_id
      join public.cadastros_comprador c on c.organizacao_id = d.organizacao_id
     where d.status = 'aberta'
       and c.status = 'aprovada'
       and d.prazo >= (now() at time zone 'America/Sao_Paulo')::date
       and (coalesce(p_busca, '') = '' or position(lower(left(p_busca, 120)) in lower(k.nome)) > 0)
     order by d.prazo asc, d.criada_em desc, d.id
     limit 20 offset least(greatest(coalesce(p_pagina, 0), 0), 1000) * 20;
end;
$$;

revoke all on function public.salvar_demanda_compra(uuid, uuid, uuid, numeric, text, date, text, text),
  public.encerrar_demanda_compra(uuid, uuid),
  public.listar_demandas_abertas(text, integer) from public, anon, authenticated;
grant execute on function public.salvar_demanda_compra(uuid, uuid, uuid, numeric, text, date, text, text),
  public.encerrar_demanda_compra(uuid, uuid),
  public.listar_demandas_abertas(text, integer) to authenticated;

commit;
