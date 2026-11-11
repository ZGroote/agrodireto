-- Executar pelo Maestro no agro após a migration. Todos os dados são revertidos.
begin;
insert into auth.users (id, aud, role, email) values
 ('d0200000-0000-0000-0000-000000000001','authenticated','authenticated','rascunho-a@example.invalid'),
 ('d0200000-0000-0000-0000-000000000002','authenticated','authenticated','rascunho-b@example.invalid');
insert into public.catalogo_culturas (id, nome, segmento, unidades) values
 ('d0200000-0000-0000-0000-0000000000c1','Rascunho teste','hortifruti',array['kg','cx']);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"d0200000-0000-0000-0000-000000000002","aal":"aal1"}',true);
select set_config('teste.prop_b', public.enviar_propriedade('Propriedade B','Cidade','SP',3,'Milho')::text, true);
select set_config('request.jwt.claims','{"sub":"d0200000-0000-0000-0000-000000000001","aal":"aal1"}',true);
select set_config('teste.prop_a', public.enviar_propriedade('Propriedade A','Cidade','SP',5,'Tomate')::text, true);
select set_config('teste.prop_a2', public.enviar_propriedade('Propriedade A2','Cidade','SP',5,'Tomate')::text, true);
select set_config('teste.cultura', public.salvar_cultura(null, current_setting('teste.prop_a')::uuid,
  'd0200000-0000-0000-0000-0000000000c1', '', 2, null, '')::text, true);

do $$
declare
  prop uuid := current_setting('teste.prop_a')::uuid;
  cult uuid := current_setting('teste.cultura')::uuid;
  r public.rascunhos_lote;
begin
  perform public.salvar_rascunho_lote('teste-1',prop,cult,'novo',null,'kg',null,'','','','',null,null,null,null);
  select * into strict r from public.rascunhos_lote where rascunho_id = 'teste-1';
  if r.quantidade is not null or r.preco_centavos is not null or r.autor <> auth.uid() then raise exception 'Parcial ou autoria inválida'; end if;
  perform public.salvar_rascunho_lote('teste-1',prop,cult,'revisar',12.5,'cx',1234,'A','Grande','Caixa','Seco','2026-11-20','2026-11-21','2026-11-22','2026-11-23');
  select * into strict r from public.rascunhos_lote where rascunho_id = 'teste-1';
  if r.quantidade <> 12.5 or r.preco_centavos <> 1234 or r.padrao <> 'A' or r.calibre <> 'Grande'
    or r.embalagem <> 'Caixa' or r.condicoes <> 'Seco' or r.etapa <> 'revisar'
    or r.cultura_id <> cult or r.propriedade_id <> prop or r.unidade <> 'cx'
    or r.colheita <> '2026-11-20' or r.retirada_inicio <> '2026-11-21'
    or r.retirada_fim <> '2026-11-22' or r.validade <> '2026-11-23'
    then raise exception 'Campos não reabriram'; end if;
  -- Repetição e última gravação do mesmo autor: uma única linha.
  perform public.salvar_rascunho_lote('teste-1',prop,cult,'preco',14,'kg',1500,'B','','','',null,null,null,null);
  if (select count(*) from public.rascunhos_lote) <> 1 or
    (select quantidade from public.rascunhos_lote) <> 14 then raise exception 'Upsert duplicou ou ignorou gravação'; end if;
  if exists(select 1 from public.ofertas_lote where rascunho_id = 'teste-1') then raise exception 'Rascunho foi publicado'; end if;
  begin perform public.salvar_rascunho_lote('teste-1',prop,cult,'novo',0,'kg',1,'','','','',null,null,null,null); raise exception 'Aceitou zero'; exception when check_violation then null; end;
  begin perform public.salvar_rascunho_lote('teste-1',prop,cult,'novo',1000000001,'kg',1,'','','','',null,null,null,null); raise exception 'Aceitou excesso'; exception when check_violation then null; end;
  begin perform public.salvar_rascunho_lote('teste-1',prop,cult,'novo',1,'kg',0,'','','','',null,null,null,null); raise exception 'Aceitou preço zero'; exception when check_violation then null; end;
  begin perform public.salvar_rascunho_lote('teste-1',prop,cult,'novo',1,'t',1,'','','','',null,null,null,null); raise exception 'Aceitou unidade fora da cultura'; exception when sqlstate 'PT422' then null; end;
  begin perform public.salvar_rascunho_lote('teste-1',prop,cult,'novo',1,'sc',1,'','','','',null,null,null,null); raise exception 'Aceitou unidade inexistente'; exception when sqlstate 'PT422' then null; end;
  begin perform public.salvar_rascunho_lote('ID INVÁLIDO',prop,cult,'novo',1,'kg',1,'','','','',null,null,null,null); raise exception 'Aceitou id inválido'; exception when check_violation then null; end;
  begin perform public.salvar_rascunho_lote('teste-1',prop,cult,'publicado',1,'kg',1,'','','','',null,null,null,null); raise exception 'Aceitou etapa inválida'; exception when check_violation then null; end;
  begin perform public.salvar_rascunho_lote('teste-1',prop,cult,'novo',1,'kg',1,repeat('A',121),'','','',null,null,null,null); raise exception 'Aceitou qualidade longa'; exception when check_violation then null; end;
  begin perform public.salvar_rascunho_lote('teste-1',prop,cult,'novo',1,'kg',1,'','','','',null,'2026-11-22','2026-11-21',null); raise exception 'Aceitou período invertido'; exception when check_violation then null; end;
  begin perform public.salvar_rascunho_lote('teste-1',current_setting('teste.prop_a2')::uuid,cult,'novo',1,'kg',1,'','','','',null,null,null,null); raise exception 'Aceitou cultura de outra propriedade'; exception when sqlstate 'PT422' then null; end;
  begin perform public.salvar_rascunho_lote('teste-1',current_setting('teste.prop_b')::uuid,cult,'novo',1,'kg',1,'','','','',null,null,null,null); raise exception 'Aceitou propriedade alheia'; exception when insufficient_privilege then null; end;
  begin update public.rascunhos_lote set quantidade = 50; raise exception 'Permitiu escrita direta'; exception when insufficient_privilege then null; end;
end $$;

-- Mesmo membro da organização não pode ler nem descartar o rascunho do autor.
reset role;
insert into public.membros_organizacao (organizacao_id, usuario_id)
 select organizacao_id,'d0200000-0000-0000-0000-000000000002' from public.propriedades where id = current_setting('teste.prop_a')::uuid;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"d0200000-0000-0000-0000-000000000002","aal":"aal1"}',true);
do $$
begin
  if exists(select 1 from public.rascunhos_lote) then raise exception 'Outro membro leu o rascunho'; end if;
  perform public.descartar_rascunho_lote('teste-1');
  perform public.salvar_rascunho_lote('teste-1',current_setting('teste.prop_a')::uuid,current_setting('teste.cultura')::uuid,'novo',2,'kg',2,'','','','',null,null,null,null);
end $$;
reset role;
do $$
begin
  if (select count(*) from public.rascunhos_lote where rascunho_id = 'teste-1') <> 2 or
    (select quantidade from public.rascunhos_lote where autor = 'd0200000-0000-0000-0000-000000000001') <> 14
    then raise exception 'Colisão entre autores'; end if;
end $$;
delete from public.membros_organizacao where usuario_id = 'd0200000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"d0200000-0000-0000-0000-000000000001","aal":"aal1"}',true);
do $$
begin
  if exists(select 1 from public.rascunhos_lote) then raise exception 'Ex-membro leu seu rascunho'; end if;
  begin perform public.salvar_rascunho_lote('teste-1',current_setting('teste.prop_a')::uuid,current_setting('teste.cultura')::uuid,'novo',1,'kg',1,'','','','',null,null,null,null); raise exception 'Ex-membro gravou'; exception when insufficient_privilege then null; end;
  begin perform public.descartar_rascunho_lote('teste-1'); raise exception 'Ex-membro descartou'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"d0200000-0000-0000-0000-000000000002","aal":"aal1"}',true);
select public.descartar_rascunho_lote('teste-1');
select public.descartar_rascunho_lote('teste-1');
do $$ begin if exists(select 1 from public.rascunhos_lote) then raise exception 'Descarte não persistiu'; end if; end $$;
reset role;
do $$
begin
  if has_function_privilege('anon','public.salvar_rascunho_lote(text,uuid,uuid,text,numeric,text,bigint,text,text,text,text,date,date,date,date)','execute')
    or has_function_privilege('anon','public.descartar_rascunho_lote(text)','execute')
    or has_table_privilege('anon','public.rascunhos_lote','select') then raise exception 'Privilégio indevido para anon'; end if;
end $$;
rollback;
select 'D02: parcial, reabertura, idempotência, validação, origem, autoria, RLS e descarte OK; dados revertidos' as resultado;
