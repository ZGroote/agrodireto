begin;
insert into auth.users (id, aud, role, email) values
 ('d0100000-0000-0000-0000-000000000001','authenticated','authenticated','cultura-a@example.invalid'),
 ('d0100000-0000-0000-0000-000000000002','authenticated','authenticated','cultura-b@example.invalid');
insert into public.catalogo_culturas (id, nome, segmento, unidades, ativo) values
 ('d0100000-0000-0000-0000-0000000000c1','Cultura teste','hortifruti',array['kg','cx'],true),
 ('d0100000-0000-0000-0000-0000000000c2','Cultura inativa','graos',array['t'],false),
 ('d0100000-0000-0000-0000-0000000000c3','Cultura em toneladas','graos',array['t'],true);
set local role authenticated;

select set_config('request.jwt.claims','{"sub":"d0100000-0000-0000-0000-000000000002","aal":"aal1"}',true);
select set_config('teste.prop_b', public.enviar_propriedade('Propriedade B','Cidade','SP',3,'Milho')::text, true);

select set_config('request.jwt.claims','{"sub":"d0100000-0000-0000-0000-000000000001","aal":"aal1"}',true);
select set_config('teste.prop_a', public.enviar_propriedade('Propriedade A','Cidade','SP',5,'Tomate')::text, true);
select set_config('teste.cultura', public.salvar_cultura(null, current_setting('teste.prop_a')::uuid,
  'd0100000-0000-0000-0000-0000000000c1', ' Italiano ', 2.5, '2026-10-01', 'Plantio')::text, true);
do $$
declare
  prop uuid := current_setting('teste.prop_a')::uuid;
  cult uuid := current_setting('teste.cultura')::uuid;
  r public.culturas;
begin
  if (select count(*) from public.catalogo_culturas where id::text like 'd0100000-%') <> 3 then raise exception 'Produtor não lê o catálogo'; end if;
  select * into r from public.culturas where id = cult;
  if r.variedade <> 'Italiano' or r.area_ha <> 2.5 or r.plantio <> '2026-10-01' or r.etapa <> 'Plantio'
     or r.criado_por <> auth.uid() or r.unidade is not null then raise exception 'Cultura não reabriu como foi cadastrada'; end if;
  -- Edição mantém o registro e a autoria original.
  if public.salvar_cultura(cult, prop, 'd0100000-0000-0000-0000-0000000000c1', 'Débora', 3, null, 'Desenvolvimento') <> cult then raise exception 'Edição devolveu outra cultura'; end if;
  if (select count(*) from public.culturas) <> 1 or (select variedade from public.culturas) <> 'Débora' or (select plantio from public.culturas) is not null then raise exception 'Edição duplicou ou não gravou'; end if;
  begin perform public.salvar_cultura(null, prop, 'd0100000-0000-0000-0000-0000000000c2', '', 1, null, ''); raise exception 'Aceitou cultura inativa'; exception when sqlstate 'PT422' then null; end;
  begin perform public.salvar_cultura(null, prop, gen_random_uuid(), '', 1, null, ''); raise exception 'Aceitou cultura fora do catálogo'; exception when sqlstate 'PT422' then null; end;
  begin perform public.salvar_cultura(null, prop, 'd0100000-0000-0000-0000-0000000000c1', '', 0, null, ''); raise exception 'Aceitou área zero'; exception when check_violation then null; end;
  -- Unidade inválida é recusada; a válida grava.
  begin perform public.salvar_previsao(cult, 't', 100, null, null, '2027-01-10'); raise exception 'Aceitou unidade fora da cultura'; exception when sqlstate 'PT422' then null; end;
  begin perform public.salvar_previsao(cult, 'sc', 100, null, null, '2027-01-10'); raise exception 'Aceitou unidade inexistente'; exception when sqlstate 'PT422' then null; end;
  begin perform public.salvar_previsao(cult, 'kg', 0, null, null, '2027-01-10'); raise exception 'Aceitou estimativa zero'; exception when check_violation then null; end;
  begin perform public.salvar_previsao(cult, 'kg', 100, 120, 150, '2027-01-10'); raise exception 'Aceitou mínimo acima da estimativa'; exception when check_violation then null; end;
  begin perform public.salvar_previsao(cult, 'kg', 100, 90, null, '2027-01-10'); raise exception 'Aceitou faixa pela metade'; exception when check_violation then null; end;
  begin perform public.salvar_previsao(cult, 'kg', 100, null, null, null); raise exception 'Aceitou previsão sem colheita'; exception when check_violation then null; end;
  perform public.salvar_previsao(cult, 'cx', 400, 350, 450, '2027-01-10');
  select * into r from public.culturas where id = cult;
  if r.unidade <> 'cx' or r.estimativa <> 400 or r.minimo <> 350 or r.maximo <> 450 or r.colheita <> '2027-01-10' then raise exception 'Previsão não reabriu como foi salva'; end if;
  perform public.salvar_previsao(cult, 'kg', 800, null, null, '2027-01-12');
  if (select minimo from public.culturas where id = cult) is not null then raise exception 'Faixa removida continuou gravada'; end if;
  -- Trocar para cultura cuja unidade não serve para a previsão gravada.
  begin perform public.salvar_cultura(cult, prop, 'd0100000-0000-0000-0000-0000000000c3', '', 1, null, ''); raise exception 'Trocou a cultura deixando unidade inválida'; exception when sqlstate 'PT422' then null; end;
  -- Escrita só pelas funções.
  begin insert into public.culturas (propriedade_id, catalogo_id, area_ha, criado_por, atualizado_por) values (prop, 'd0100000-0000-0000-0000-0000000000c1', 1, auth.uid(), auth.uid()); raise exception 'Inseriu cultura direto'; exception when insufficient_privilege then null; end;
  begin update public.culturas set unidade = 't'; raise exception 'Alterou cultura direto'; exception when insufficient_privilege then null; end;
  begin insert into public.catalogo_culturas (nome, segmento, unidades) values ('Invasão','graos',array['t']); raise exception 'Produtor escreveu no catálogo'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims','{"sub":"d0100000-0000-0000-0000-000000000002","aal":"aal1"}',true);
do $$
declare
  cult uuid := current_setting('teste.cultura')::uuid;
begin
  if (select count(*) from public.culturas) <> 0 then raise exception 'Outra organização leu a cultura'; end if;
  begin perform public.salvar_cultura(null, current_setting('teste.prop_a')::uuid, 'd0100000-0000-0000-0000-0000000000c1', '', 1, null, ''); raise exception 'Cadastrou na propriedade de outro'; exception when insufficient_privilege then null; end;
  begin perform public.salvar_cultura(cult, current_setting('teste.prop_b')::uuid, 'd0100000-0000-0000-0000-0000000000c1', '', 1, null, ''); raise exception 'Moveu a cultura de outro'; exception when sqlstate 'PT404' then null; end;
  begin perform public.salvar_previsao(cult, 'kg', 1, null, null, '2027-01-10'); raise exception 'Alterou a previsão de outro'; exception when sqlstate 'PT404' then null; end;
end $$;

reset role;
do $$
begin
  if (select estimativa from public.culturas where id = current_setting('teste.cultura')::uuid) <> 800 then raise exception 'Terceiro alterou a previsão'; end if;
  if has_function_privilege('anon','public.salvar_cultura(uuid,uuid,uuid,text,numeric,date,text)','execute')
    or has_function_privilege('anon','public.salvar_previsao(uuid,text,bigint,bigint,bigint,date)','execute')
    or has_table_privilege('anon','public.culturas','select')
    or has_table_privilege('anon','public.catalogo_culturas','select') then raise exception 'Privilégio a mais'; end if;
end $$;
rollback;
select 'Culturas: catálogo, cadastro e reabertura, unidade inválida, faixa, autoria, RLS e privilégios OK; dados de teste revertidos' as resultado;
