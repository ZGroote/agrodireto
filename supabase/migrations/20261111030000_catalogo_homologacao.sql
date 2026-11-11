begin;

create table agrodireto_privado.catalogo_homologacao (
  unica boolean primary key default true check (unica),
  habilitado boolean not null default false
);
insert into agrodireto_privado.catalogo_homologacao default values;

create table agrodireto_privado.compradores_catalogo (
  usuario_id uuid primary key references auth.users (id) on delete cascade
);

create table public.ofertas_lote (
  id uuid primary key default gen_random_uuid(),
  produtor_id uuid not null references public.propriedades (usuario_id) on delete cascade,
  rascunho_id text not null check (rascunho_id ~ '^[a-z0-9-]{1,80}$'),
  produto text not null check (char_length(produto) between 2 and 120),
  quantidade numeric not null check (quantidade > 0 and quantidade <= 1000000000),
  unidade text not null check (unidade in ('kg', 'cx', 't')),
  preco_centavos bigint not null check (preco_centavos between 1 and 1000000000),
  colheita date,
  retirada_inicio date not null,
  retirada_fim date not null check (retirada_fim >= retirada_inicio),
  validade date not null,
  padrao text not null check (char_length(padrao) <= 100),
  calibre text not null check (char_length(calibre) <= 100),
  embalagem text not null check (char_length(embalagem) <= 100),
  condicoes text not null check (char_length(condicoes) <= 500),
  publicada_em timestamptz not null default now(),
  retirada_em timestamptz,
  unique (produtor_id, rascunho_id),
  check (colheita is null or colheita <= retirada_fim)
);

alter table agrodireto_privado.catalogo_homologacao enable row level security;
alter table agrodireto_privado.compradores_catalogo enable row level security;
alter table public.ofertas_lote enable row level security;
revoke all on public.ofertas_lote from public, anon, authenticated;
grant select on public.ofertas_lote to authenticated;
create policy ofertas_proprio_produtor on public.ofertas_lote
  for select to authenticated using (produtor_id = (select auth.uid()));

create function public.publicar_oferta_lote(
  p_rascunho_id text, p_produto text, p_quantidade numeric, p_unidade text, p_preco_centavos bigint,
  p_colheita date, p_retirada_inicio date, p_retirada_fim date, p_validade date,
  p_padrao text, p_calibre text, p_embalagem text, p_condicoes text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare oferta_id uuid;
begin
  if not exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado) then
    raise sqlstate 'PT403' using message = 'Publicação de homologação indisponível.';
  end if;
  perform 1 from public.propriedades where usuario_id = auth.uid() and status = 'aprovada' for share;
  if not found then
    raise sqlstate 'PT403' using message = 'A propriedade precisa estar aprovada para publicar.';
  end if;
  select id into oferta_id from public.ofertas_lote
    where produtor_id = auth.uid() and rascunho_id = p_rascunho_id;
  if found then return oferta_id; end if;

  if p_validade < (now() at time zone 'America/Sao_Paulo')::date or
     p_retirada_fim < (now() at time zone 'America/Sao_Paulo')::date then
    raise sqlstate 'PT422' using message = 'A validade e a retirada precisam estar vigentes.';
  end if;

  insert into public.ofertas_lote (
    produtor_id, rascunho_id, produto, quantidade, unidade, preco_centavos,
    colheita, retirada_inicio, retirada_fim, validade, padrao, calibre, embalagem, condicoes
  ) values (
    auth.uid(), p_rascunho_id, trim(p_produto), p_quantidade, p_unidade, p_preco_centavos,
    p_colheita, p_retirada_inicio, p_retirada_fim, p_validade, trim(p_padrao),
    trim(p_calibre), trim(p_embalagem), trim(p_condicoes)
  )
  on conflict (produtor_id, rascunho_id) do nothing
  returning id into oferta_id;
  if oferta_id is null then
    select id into oferta_id from public.ofertas_lote
      where produtor_id = auth.uid() and rascunho_id = p_rascunho_id;
  end if;
  return oferta_id;
end;
$$;

create function public.retirar_oferta_lote(p_id uuid)
returns void language sql security definer set search_path = '' as $$
  update public.ofertas_lote set retirada_em = now()
  where id = p_id and produtor_id = auth.uid() and retirada_em is null;
$$;

create function public.consultar_catalogo(p_id uuid default null, p_busca text default '', p_pagina integer default 0)
returns table (
  id uuid, produto text, fornecedor text, cidade text, uf text,
  quantidade numeric, unidade text, preco_centavos bigint, colheita date,
  retirada_inicio date, retirada_fim date, validade date,
  padrao text, calibre text, embalagem text, condicoes text
) language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado)
     or not exists (select 1 from agrodireto_privado.compradores_catalogo where usuario_id = auth.uid()) then
    raise sqlstate 'PT403' using message = 'Catálogo disponível para compradores autorizados.';
  end if;
  return query
    select o.id, o.produto, p.nome, p.cidade, p.uf, o.quantidade, o.unidade,
           o.preco_centavos, o.colheita, o.retirada_inicio, o.retirada_fim, o.validade,
           o.padrao, o.calibre, o.embalagem, o.condicoes
      from public.ofertas_lote o join public.propriedades p on p.usuario_id = o.produtor_id
     where o.retirada_em is null and p.status = 'aprovada'
       and least(o.validade, o.retirada_fim) >= (now() at time zone 'America/Sao_Paulo')::date
       and (p_id is null or o.id = p_id)
       and (coalesce(p_busca, '') = '' or position(lower(left(p_busca, 120)) in lower(o.produto)) > 0)
     order by o.publicada_em desc, o.id
     limit 20 offset least(greatest(p_pagina, 0), 1000) * 20;
end;
$$;

revoke all on function public.publicar_oferta_lote(text,text,numeric,text,bigint,date,date,date,date,text,text,text,text),
  public.retirar_oferta_lote(uuid), public.consultar_catalogo(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.publicar_oferta_lote(text,text,numeric,text,bigint,date,date,date,date,text,text,text,text),
  public.retirar_oferta_lote(uuid), public.consultar_catalogo(uuid,text,integer) to authenticated;

commit;
