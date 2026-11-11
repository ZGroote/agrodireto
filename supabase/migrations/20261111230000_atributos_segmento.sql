begin;

-- D09 Onda 1 (DOC 038 §4.2, aprovado em 11/11): atributos do lote por segmento, validados no servidor.
-- Hortifrúti e grãos têm campos; agroindústria e pecuária ficam com a estrutura pronta e nenhum campo.

-- Unidade sc = saca de 60 kg, só para grãos.
alter table public.catalogo_culturas drop constraint catalogo_culturas_unidades_check;
alter table public.catalogo_culturas add constraint catalogo_culturas_unidades_check
  check (cardinality(unidades) between 1 and 4 and unidades <@ array['kg', 'cx', 't', 'sc']);
alter table public.culturas drop constraint culturas_unidade_check;
alter table public.culturas add constraint culturas_unidade_check check (unidade in ('kg', 'cx', 't', 'sc'));
alter table public.rascunhos_lote drop constraint rascunhos_lote_unidade_check;
alter table public.rascunhos_lote add constraint rascunhos_lote_unidade_check check (unidade in ('kg', 'cx', 't', 'sc'));
alter table public.ofertas_lote drop constraint ofertas_lote_unidade_check;
alter table public.ofertas_lote add constraint ofertas_lote_unidade_check check (unidade in ('kg', 'cx', 't', 'sc'));
update public.catalogo_culturas set unidades = unidades || array['sc']
 where segmento = 'graos' and not 'sc' = any (unidades);

alter table public.rascunhos_lote add column atributos jsonb not null default '{}'::jsonb
  check (jsonb_typeof(atributos) = 'object');

-- Valida os atributos do segmento. Campo de outro segmento ou valor fora da lista: PT422.
-- O rascunho pode ser parcial: os obrigatórios só valem a partir da etapa de preço.
create function agrodireto_privado.validar_atributos_lote(p_segmento text, p_unidade text, p_etapa text, p_atributos jsonb)
returns void language plpgsql immutable set search_path = '' as $$
declare
  chave text;
  valor numeric;
  permitidas text[];
  obrigatorias text[] := '{}';
  a jsonb := coalesce(p_atributos, '{}'::jsonb);
  completo boolean := p_etapa in ('preco', 'revisar');
begin
  if jsonb_typeof(a) <> 'object' then
    raise sqlstate 'PT422' using message = 'Atributos do lote inválidos.';
  end if;
  if p_segmento = 'hortifruti' then
    permitidas := array['padrao_qualidade', 'calibre', 'embalagem', 'peso_medio_embalagem_kg'];
    obrigatorias := array['padrao_qualidade', 'embalagem'];
    if p_unidade = 'cx' then obrigatorias := obrigatorias || array['peso_medio_embalagem_kg']; end if;
  elsif p_segmento = 'graos' then
    permitidas := array['origem_classificacao', 'tipo_grao', 'umidade_max_pct', 'impurezas_max_pct', 'acondicionamento'];
    obrigatorias := permitidas;
  else
    -- agroindustria e pecuaria: estrutura pronta, sem campos na Onda 1.
    permitidas := '{}';
  end if;

  for chave in select jsonb_object_keys(a) loop
    if not chave = any (permitidas) then
      raise sqlstate 'PT422' using message = format('O campo %s não vale para este segmento.', chave);
    end if;
  end loop;
  if completo then
    foreach chave in array obrigatorias loop
      if not a ? chave then
        raise sqlstate 'PT422' using message = format('Preencha o campo %s do lote.', chave);
      end if;
    end loop;
  end if;

  if a ? 'padrao_qualidade' and coalesce(a->>'padrao_qualidade', '') <> all (array['extra', 'primeira_cat1', 'segunda_cat2', 'industria', 'sem_classificacao'])
     or a ? 'embalagem' and coalesce(a->>'embalagem', '') <> all (array['caixa_plastica', 'caixa_madeira', 'caixa_papelao', 'saco_rede', 'granel'])
     or a ? 'calibre' and (jsonb_typeof(a->'calibre') <> 'string' or char_length(a->>'calibre') not between 1 and 60)
     or a ? 'origem_classificacao' and coalesce(a->>'origem_classificacao', '') <> all (array['declarada_vendedor', 'certificada_cgc_mapa'])
     or a ? 'tipo_grao' and coalesce(a->>'tipo_grao', '') <> all (array['tipo_1', 'tipo_2', 'tipo_3', 'fora_de_tipo', 'padrao_exportacao'])
     or a ? 'acondicionamento' and coalesce(a->>'acondicionamento', '') <> all (array['granel', 'big_bag', 'sacaria_60kg']) then
    raise sqlstate 'PT422' using message = 'Valor fora da lista em um atributo do lote.';
  end if;
  -- Números: confere o tipo antes do cast (SQL não garante a ordem de avaliação de um OR).
  foreach chave in array array['peso_medio_embalagem_kg', 'umidade_max_pct', 'impurezas_max_pct'] loop
    continue when not a ? chave;
    if jsonb_typeof(a->chave) <> 'number' then
      raise sqlstate 'PT422' using message = format('O campo %s precisa ser um número.', chave);
    end if;
    valor := (a->>chave)::numeric;
    if (chave = 'peso_medio_embalagem_kg' and (valor <= 0 or valor > 1000))
       or (chave = 'umidade_max_pct' and (valor < 0 or valor > 30))
       or (chave = 'impurezas_max_pct' and (valor < 0 or valor > 15)) then
      raise sqlstate 'PT422' using message = format('O campo %s está fora do limite.', chave);
    end if;
  end loop;
end;
$$;
revoke all on function agrodireto_privado.validar_atributos_lote(text, text, text, jsonb) from public, anon, authenticated;

-- Mesma regra de antes + atributos do segmento. Calibre (texto) em grãos é campo de outro segmento.
drop function public.salvar_rascunho_lote(text,uuid,uuid,text,numeric,text,bigint,text,text,text,text,date,date,date,date);
create function public.salvar_rascunho_lote(
  p_rascunho_id text, p_propriedade uuid, p_cultura uuid, p_etapa text,
  p_quantidade numeric, p_unidade text, p_preco_centavos bigint,
  p_padrao text, p_calibre text, p_embalagem text, p_condicoes text,
  p_colheita date, p_retirada_inicio date, p_retirada_fim date, p_validade date,
  p_atributos jsonb default '{}'::jsonb
)
returns void language plpgsql security definer set search_path = '' as $$
declare v_unidades text[]; v_segmento text;
begin
  if auth.uid() is null or not exists (
    select 1 from public.propriedades p where p.id = p_propriedade
      and agrodireto_privado.e_membro(p.organizacao_id)
  ) then raise insufficient_privilege using message = 'Propriedade não autorizada'; end if;
  select k.unidades, k.segmento into v_unidades, v_segmento from public.culturas c
    join public.catalogo_culturas k on k.id = c.catalogo_id
    where c.id = p_cultura and c.propriedade_id = p_propriedade
    for share of c;
  if v_unidades is null or p_unidade is null or not p_unidade = any(v_unidades) then
    raise sqlstate 'PT422' using message = 'Confira a cultura, a propriedade e a unidade do lote';
  end if;
  if v_segmento <> 'hortifruti' and coalesce(trim(p_calibre), '') <> '' then
    raise sqlstate 'PT422' using message = 'O campo calibre não vale para este segmento.';
  end if;
  perform agrodireto_privado.validar_atributos_lote(v_segmento, p_unidade, p_etapa, p_atributos);
  -- Também confere o vínculo anterior: perder acesso não permite mover um rascunho.
  if exists (
    select 1 from public.rascunhos_lote r join public.propriedades p on p.id = r.propriedade_id
    where r.autor = auth.uid() and r.rascunho_id = p_rascunho_id
      and not agrodireto_privado.e_membro(p.organizacao_id)
  ) then raise insufficient_privilege using message = 'Rascunho não autorizado'; end if;
  insert into public.rascunhos_lote (
    autor, rascunho_id, propriedade_id, cultura_id, etapa, quantidade, unidade, preco_centavos,
    padrao, calibre, embalagem, condicoes, colheita, retirada_inicio, retirada_fim, validade, atributos
  ) values (
    auth.uid(), p_rascunho_id, p_propriedade, p_cultura, p_etapa, p_quantidade, p_unidade, p_preco_centavos,
    trim(coalesce(p_padrao,'')), trim(coalesce(p_calibre,'')), trim(coalesce(p_embalagem,'')),
    trim(coalesce(p_condicoes,'')), p_colheita, p_retirada_inicio, p_retirada_fim, p_validade,
    coalesce(p_atributos, '{}'::jsonb)
  ) on conflict (autor, rascunho_id) do update set
    propriedade_id = excluded.propriedade_id, cultura_id = excluded.cultura_id, etapa = excluded.etapa,
    quantidade = excluded.quantidade, unidade = excluded.unidade, preco_centavos = excluded.preco_centavos,
    padrao = excluded.padrao, calibre = excluded.calibre, embalagem = excluded.embalagem,
    condicoes = excluded.condicoes, colheita = excluded.colheita, retirada_inicio = excluded.retirada_inicio,
    retirada_fim = excluded.retirada_fim, validade = excluded.validade, atributos = excluded.atributos,
    atualizado_em = clock_timestamp();
end;
$$;
revoke all on function public.salvar_rascunho_lote(text,uuid,uuid,text,numeric,text,bigint,text,text,text,text,date,date,date,date,jsonb)
  from public, anon, authenticated;
grant execute on function public.salvar_rascunho_lote(text,uuid,uuid,text,numeric,text,bigint,text,text,text,text,date,date,date,date,jsonb)
  to authenticated;

commit;
