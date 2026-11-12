-- D09 Onda 1: atributos do lote por segmento e unidade sc, validados em salvar_rascunho_lote. Tudo no rollback.
begin;
insert into auth.users (id, aud, role, email) values
 ('56000000-0000-0000-0000-000000000001','authenticated','authenticated','seg-produtor@example.invalid');
insert into public.organizacoes (id, nome) values ('56000000-0000-0000-0000-000000000010','Organização segmentos');
insert into public.membros_organizacao (organizacao_id, usuario_id, papel)
values ('56000000-0000-0000-0000-000000000010','56000000-0000-0000-0000-000000000001','titular');
insert into public.propriedades (id, usuario_id, organizacao_id, nome, cidade, uf, area, culturas, status)
values ('56000000-0000-0000-0000-000000000020','56000000-0000-0000-0000-000000000001','56000000-0000-0000-0000-000000000010',
        'Fazenda segmentos','Cidade teste','SP',1,'Vários','aprovada');
insert into public.catalogo_culturas (id, nome, segmento, unidades) values
 ('56000000-0000-0000-0000-0000000000c1','Teste horti D09','hortifruti',array['kg','cx','t']),
 ('56000000-0000-0000-0000-0000000000c2','Teste grão D09','graos',array['kg','t','sc']),
 ('56000000-0000-0000-0000-0000000000c3','Teste agro D09','agroindustria',array['kg','t']);
insert into public.culturas (id, propriedade_id, catalogo_id, area_ha, criado_por, atualizado_por)
select ('56000000-0000-0000-0000-0000000000d' || n)::uuid, '56000000-0000-0000-0000-000000000020',
       ('56000000-0000-0000-0000-0000000000c' || n)::uuid, 1,
       '56000000-0000-0000-0000-000000000001','56000000-0000-0000-0000-000000000001'
  from generate_series(1, 3) n;

do $$
begin
  if exists (select 1 from public.catalogo_culturas where segmento = 'graos' and not 'sc' = any (unidades)) then
    raise exception 'Cultura de grãos sem a unidade sc';
  end if;
  if exists (select 1 from public.catalogo_culturas where segmento <> 'graos' and 'sc' = any (unidades)) then
    raise exception 'sc fora de grãos';
  end if;
  -- Assinatura antiga removida (sem overload) e a nova só para authenticated.
  if exists (select 1 from pg_proc where proname = 'salvar_rascunho_lote' and pronamespace = 'public'::regnamespace and pronargs <> 16) then
    raise exception 'Sobrou outra assinatura de salvar_rascunho_lote';
  end if;
  if has_function_privilege('anon','public.salvar_rascunho_lote(text,uuid,uuid,text,numeric,text,bigint,text,text,text,text,date,date,date,date,jsonb)','execute')
     or not has_function_privilege('authenticated','public.salvar_rascunho_lote(text,uuid,uuid,text,numeric,text,bigint,text,text,text,text,date,date,date,date,jsonb)','execute') then
    raise exception 'Permissões de salvar_rascunho_lote erradas';
  end if;
end $$;

-- Atalho só deste teste (some no rollback): grava um rascunho como quem chama.
create function public.teste_d09_salvar(p_id text, p_cultura text, p_etapa text, p_unidade text, p_atributos jsonb, p_calibre text default '')
returns void language sql as $$
  select public.salvar_rascunho_lote(p_id, '56000000-0000-0000-0000-000000000020', p_cultura::uuid, p_etapa,
    10, p_unidade, 1000, '', p_calibre, '', '', null, null, null, null, p_atributos);
$$;
grant execute on function public.teste_d09_salvar(text, text, text, text, jsonb, text) to authenticated;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"56000000-0000-0000-0000-000000000001","aal":"aal1"}',true);

do $$
declare horti text := '56000000-0000-0000-0000-0000000000d1'; grao text := '56000000-0000-0000-0000-0000000000d2';
        agro text := '56000000-0000-0000-0000-0000000000d3';
begin
  -- Grãos em sc, completo.
  perform public.teste_d09_salvar('seg-grao', grao, 'preco', 'sc', '{"origem_classificacao":"declarada_vendedor","tipo_grao":"tipo_1","umidade_max_pct":14,"impurezas_max_pct":1,"acondicionamento":"big_bag"}');
  if (select unidade from public.rascunhos_lote where rascunho_id = 'seg-grao') <> 'sc'
     or (select atributos->>'tipo_grao' from public.rascunhos_lote where rascunho_id = 'seg-grao') <> 'tipo_1' then
    raise exception 'Rascunho de grãos em sc não gravou';
  end if;
  -- Rascunho parcial na etapa padrão é aceito; na etapa preço exige os obrigatórios.
  perform public.teste_d09_salvar('seg-grao-parcial', grao, 'padrao', 't', '{"tipo_grao":"tipo_2"}');
  begin perform public.teste_d09_salvar('seg-grao-parcial', grao, 'preco', 't', '{"tipo_grao":"tipo_2"}'); raise exception 'Grão incompleto avançou';
  exception when sqlstate 'PT422' then null; end;
  -- Campo de outro segmento é recusado, nos dois sentidos, e calibre em grãos também.
  begin perform public.teste_d09_salvar('seg-x1', grao, 'padrao', 'kg', '{"calibre":"Graúdo"}'); raise exception 'Calibre aceito em grãos';
  exception when sqlstate 'PT422' then null; end;
  begin perform public.teste_d09_salvar('seg-x2', grao, 'padrao', 'kg', '{}', 'Graúdo'); raise exception 'Calibre (texto) aceito em grãos';
  exception when sqlstate 'PT422' then null; end;
  begin perform public.teste_d09_salvar('seg-x3', horti, 'padrao', 'kg', '{"umidade_max_pct":14}'); raise exception 'Umidade aceita em hortifrúti';
  exception when sqlstate 'PT422' then null; end;
  -- Limites e listas.
  begin perform public.teste_d09_salvar('seg-x4', grao, 'padrao', 'kg', '{"umidade_max_pct":31}'); raise exception 'Umidade acima de 30';
  exception when sqlstate 'PT422' then null; end;
  begin perform public.teste_d09_salvar('seg-x5', grao, 'padrao', 'kg', '{"impurezas_max_pct":"1"}'); raise exception 'Impureza como texto';
  exception when sqlstate 'PT422' then null; end;
  begin perform public.teste_d09_salvar('seg-x6', grao, 'padrao', 'kg', '{"tipo_grao":"tipo_9"}'); raise exception 'Tipo fora da lista';
  exception when sqlstate 'PT422' then null; end;
  -- sc só onde o catálogo tem.
  begin perform public.teste_d09_salvar('seg-x7', horti, 'padrao', 'sc', '{}'); raise exception 'sc aceito em hortifrúti';
  exception when sqlstate 'PT422' then null; end;
  -- Hortifrúti: peso da caixa obrigatório só em cx, e positivo.
  perform public.teste_d09_salvar('seg-horti-kg', horti, 'preco', 'kg', '{"padrao_qualidade":"extra","embalagem":"granel"}');
  begin perform public.teste_d09_salvar('seg-horti-cx', horti, 'preco', 'cx', '{"padrao_qualidade":"extra","embalagem":"caixa_plastica"}');
    raise exception 'Caixa sem peso médio avançou';
  exception when sqlstate 'PT422' then null; end;
  begin perform public.teste_d09_salvar('seg-horti-cx', horti, 'padrao', 'cx', '{"peso_medio_embalagem_kg":0}'); raise exception 'Peso zero aceito';
  exception when sqlstate 'PT422' then null; end;
  perform public.teste_d09_salvar('seg-horti-cx', horti, 'revisar', 'cx',
    '{"padrao_qualidade":"primeira_cat1","calibre":"50-65 mm","embalagem":"caixa_plastica","peso_medio_embalagem_kg":20.5}', '50-65 mm');
  -- Agroindústria: estrutura pronta, sem campos.
  perform public.teste_d09_salvar('seg-agro', agro, 'preco', 't', '{}');
  begin perform public.teste_d09_salvar('seg-agro-x', agro, 'padrao', 't', '{"padrao_qualidade":"extra"}'); raise exception 'Campo aceito em agroindústria';
  exception when sqlstate 'PT422' then null; end;
  -- Não-objeto é recusado.
  begin perform public.teste_d09_salvar('seg-x8', horti, 'padrao', 'kg', '[]'); raise exception 'Atributos em lista aceitos';
  exception when sqlstate 'PT422' then null; end;
  if (select count(*) from public.rascunhos_lote where rascunho_id like 'seg-%') <> 5 then
    raise exception 'Quantidade de rascunhos inesperada: %', (select count(*) from public.rascunhos_lote where rascunho_id like 'seg-%');
  end if;
end $$;
rollback;
select 'Atributos por segmento: sc em grãos, campos de outro segmento recusados, obrigatórios a partir do preço' as resultado;
