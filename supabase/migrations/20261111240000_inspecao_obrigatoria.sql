begin;

-- E00: regra de inspeção obrigatória (DOC 039 item 6; DOC 042).
-- A inspeção (concluir_inspecao_lote) existe sobre o lote gravado; por isso o lote que exige inspeção é gravado
-- com verificacao = 'inspecao_obrigatoria' e só aparece no catálogo depois de inspeção 'aprovado'.
-- Lotes existentes ficam 'declarado' (default).
alter table public.ofertas_lote
  add column verificacao text not null default 'declarado'
    check (verificacao in ('declarado', 'inspecao_obrigatoria'));

-- publicar_oferta_lote: copiada de 20261111080000_organizacoes.sql (versão mais recente); muda só a verificação.
create or replace function public.publicar_oferta_lote(
  p_rascunho_id text, p_produto text, p_quantidade numeric, p_unidade text, p_preco_centavos bigint,
  p_colheita date, p_retirada_inicio date, p_retirada_fim date, p_validade date,
  p_padrao text, p_calibre text, p_embalagem text, p_condicoes text, p_propriedade_id uuid default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare oferta_id uuid; prop uuid; total integer; v_verificacao text := 'declarado';
begin
  if not exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado) then
    raise sqlstate 'PT403' using message = 'Publicação de homologação indisponível.';
  end if;
  select count(*), min(p.id::text)::uuid into total, prop from public.propriedades p
   where p.status = 'aprovada' and agrodireto_privado.e_membro(p.organizacao_id)
     and (p_propriedade_id is null or p.id = p_propriedade_id);
  if total = 0 then
    raise sqlstate 'PT403' using message = 'A propriedade precisa estar aprovada para publicar.';
  end if;
  if total > 1 then
    raise sqlstate 'PT422' using message = 'Escolha a propriedade do lote.';
  end if;
  perform 1 from public.propriedades where id = prop and status = 'aprovada' for share;
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

  -- E00 (DOC 039 item 6, DOC 042): inspeção obrigatória no 1º lote da organização, acima de R$ 20.000
  -- (quantidade x preço) ou no segmento pecuária; nos demais, "Declarado pelo produtor".
  if not exists (
       select 1 from public.ofertas_lote o join public.propriedades p on p.id = o.propriedade_id
        where p.organizacao_id = (select organizacao_id from public.propriedades where id = prop))
     or p_quantidade * p_preco_centavos > 2000000
     or exists (select 1 from public.catalogo_culturas c
                 where c.segmento = 'pecuaria' and lower(c.nome) = lower(trim(p_produto))) then
    v_verificacao := 'inspecao_obrigatoria';
  end if;

  insert into public.ofertas_lote (
    produtor_id, propriedade_id, rascunho_id, produto, quantidade, unidade, preco_centavos,
    colheita, retirada_inicio, retirada_fim, validade, padrao, calibre, embalagem, condicoes, verificacao
  ) values (
    auth.uid(), prop, p_rascunho_id, trim(p_produto), p_quantidade, p_unidade, p_preco_centavos,
    p_colheita, p_retirada_inicio, p_retirada_fim, p_validade, trim(p_padrao),
    trim(p_calibre), trim(p_embalagem), trim(p_condicoes), v_verificacao
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

-- consultar_catalogo: copiada de 20261111085000_compradores.sql (versão mais recente); só o filtro de inspeção
-- entra no where. O retorno não muda.
create or replace function public.consultar_catalogo(p_id uuid default null, p_busca text default '', p_pagina integer default 0)
returns table (
  id uuid, produto text, fornecedor text, cidade text, uf text,
  quantidade numeric, unidade text, preco_centavos bigint, colheita date,
  retirada_inicio date, retirada_fim date, validade date,
  padrao text, calibre text, embalagem text, condicoes text
) language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado)
     or not agrodireto_privado.comprador_autorizado() then
    raise sqlstate 'PT403' using message = 'Catálogo disponível para compradores autorizados.';
  end if;
  return query
    select o.id, o.produto, p.nome, p.cidade, p.uf, o.quantidade, o.unidade,
           o.preco_centavos, o.colheita, o.retirada_inicio, o.retirada_fim, o.validade,
           o.padrao, o.calibre, o.embalagem, o.condicoes
      from public.ofertas_lote o join public.propriedades p on p.id = o.propriedade_id
     where o.retirada_em is null and p.status = 'aprovada'
       and (o.verificacao = 'declarado' or exists (
         select 1 from public.inspecoes_lote i where i.lote_id = o.id and i.resultado = 'aprovado'))
       and least(o.validade, o.retirada_fim) >= (now() at time zone 'America/Sao_Paulo')::date
       and (p_id is null or o.id = p_id)
       and (coalesce(p_busca, '') = '' or position(lower(left(p_busca, 120)) in lower(o.produto)) > 0)
     order by o.publicada_em desc, o.id
     limit 20 offset least(greatest(p_pagina, 0), 1000) * 20;
end;
$$;

commit;
