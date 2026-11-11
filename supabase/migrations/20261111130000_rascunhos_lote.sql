begin;

create table public.rascunhos_lote (
  id uuid primary key default gen_random_uuid(),
  autor uuid not null references auth.users(id) on delete cascade,
  rascunho_id text not null check (rascunho_id ~ '^[a-z0-9-]{1,80}$'),
  propriedade_id uuid not null references public.propriedades(id),
  cultura_id uuid not null references public.culturas(id),
  etapa text not null check (etapa in ('novo', 'padrao', 'preco', 'revisar')),
  quantidade numeric check (quantidade > 0 and quantidade <= 1000000000),
  unidade text not null check (unidade in ('kg', 'cx', 't')),
  preco_centavos bigint check (preco_centavos between 1 and 100000000000),
  padrao text not null default '' check (char_length(padrao) <= 120),
  calibre text not null default '' check (char_length(calibre) <= 120),
  embalagem text not null default '' check (char_length(embalagem) <= 120),
  condicoes text not null default '' check (char_length(condicoes) <= 2000),
  colheita date,
  retirada_inicio date,
  retirada_fim date,
  validade date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (autor, rascunho_id),
  check ((retirada_inicio is null) = (retirada_fim is null)),
  check (retirada_fim >= retirada_inicio)
);

alter table public.rascunhos_lote enable row level security;
revoke all on public.rascunhos_lote from public, anon, authenticated;
grant select on public.rascunhos_lote to authenticated;
create policy rascunhos_lote_leitura on public.rascunhos_lote for select to authenticated using (
  autor = (select auth.uid()) and exists (
    select 1 from public.propriedades p where p.id = propriedade_id
      and agrodireto_privado.e_membro(p.organizacao_id)
  )
);

create function public.salvar_rascunho_lote(
  p_rascunho_id text, p_propriedade uuid, p_cultura uuid, p_etapa text,
  p_quantidade numeric, p_unidade text, p_preco_centavos bigint,
  p_padrao text, p_calibre text, p_embalagem text, p_condicoes text,
  p_colheita date, p_retirada_inicio date, p_retirada_fim date, p_validade date
)
returns void language plpgsql security definer set search_path = '' as $$
declare v_unidades text[];
begin
  if auth.uid() is null or not exists (
    select 1 from public.propriedades p where p.id = p_propriedade
      and agrodireto_privado.e_membro(p.organizacao_id)
  ) then raise insufficient_privilege using message = 'Propriedade não autorizada'; end if;
  select k.unidades into v_unidades from public.culturas c
    join public.catalogo_culturas k on k.id = c.catalogo_id
    where c.id = p_cultura and c.propriedade_id = p_propriedade
    for share of c;
  if v_unidades is null or p_unidade is null or not p_unidade = any(v_unidades) then
    raise sqlstate 'PT422' using message = 'Confira a cultura, a propriedade e a unidade do lote';
  end if;
  -- Também confere o vínculo anterior: perder acesso não permite mover um rascunho.
  if exists (
    select 1 from public.rascunhos_lote r join public.propriedades p on p.id = r.propriedade_id
    where r.autor = auth.uid() and r.rascunho_id = p_rascunho_id
      and not agrodireto_privado.e_membro(p.organizacao_id)
  ) then raise insufficient_privilege using message = 'Rascunho não autorizado'; end if;
  insert into public.rascunhos_lote (
    autor, rascunho_id, propriedade_id, cultura_id, etapa, quantidade, unidade, preco_centavos,
    padrao, calibre, embalagem, condicoes, colheita, retirada_inicio, retirada_fim, validade
  ) values (
    auth.uid(), p_rascunho_id, p_propriedade, p_cultura, p_etapa, p_quantidade, p_unidade, p_preco_centavos,
    trim(coalesce(p_padrao,'')), trim(coalesce(p_calibre,'')), trim(coalesce(p_embalagem,'')),
    trim(coalesce(p_condicoes,'')), p_colheita, p_retirada_inicio, p_retirada_fim, p_validade
  ) on conflict (autor, rascunho_id) do update set
    propriedade_id = excluded.propriedade_id, cultura_id = excluded.cultura_id, etapa = excluded.etapa,
    quantidade = excluded.quantidade, unidade = excluded.unidade, preco_centavos = excluded.preco_centavos,
    padrao = excluded.padrao, calibre = excluded.calibre, embalagem = excluded.embalagem,
    condicoes = excluded.condicoes, colheita = excluded.colheita, retirada_inicio = excluded.retirada_inicio,
    retirada_fim = excluded.retirada_fim, validade = excluded.validade, atualizado_em = clock_timestamp();
end;
$$;

create function public.descartar_rascunho_lote(p_rascunho_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if exists (select 1 from public.ofertas_lote where produtor_id = auth.uid() and rascunho_id = p_rascunho_id) then
    raise sqlstate 'PT422' using message = 'O lote já foi publicado; mantenha suas evidências';
  end if;
  if exists (
    select 1 from public.rascunhos_lote r join public.propriedades p on p.id = r.propriedade_id
    where r.autor = auth.uid() and r.rascunho_id = p_rascunho_id
      and not agrodireto_privado.e_membro(p.organizacao_id)
  ) then raise insufficient_privilege; end if;
  delete from public.rascunhos_lote r using public.propriedades p
    where r.autor = auth.uid() and r.rascunho_id = p_rascunho_id
      and p.id = r.propriedade_id and agrodireto_privado.e_membro(p.organizacao_id);
end;
$$;

revoke all on function public.salvar_rascunho_lote(text,uuid,uuid,text,numeric,text,bigint,text,text,text,text,date,date,date,date),
  public.descartar_rascunho_lote(text) from public, anon, authenticated;
grant execute on function public.salvar_rascunho_lote(text,uuid,uuid,text,numeric,text,bigint,text,text,text,text,date,date,date,date),
  public.descartar_rascunho_lote(text) to authenticated;

commit;
