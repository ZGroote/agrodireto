begin;
update agrodireto_privado.seguranca_equipe set exige_mfa = true where unica;
insert into auth.users (id, aud, role, email) values
('eec4d7f1-bd11-41c1-9087-000000000311','authenticated','authenticated','agrodireto-frota-a@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000312','authenticated','authenticated','agrodireto-frota-b@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000313','authenticated','authenticated','agrodireto-frota-admin@example.invalid');
insert into public.equipe_agrodireto values ('eec4d7f1-bd11-41c1-9087-000000000313');
set local role authenticated;

-- Transportadora B, com um veículo próprio.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000312","aal":"aal1"}',true);
select set_config('teste.org_b', public.enviar_cadastro_transportadora(
  'Frota B Transportes','11222333000181','Bia','11977776666','Campinas','SP',array['SP'],array['granel'])::text, true);
select set_config('teste.veiculo_b', public.salvar_veiculo(null, current_setting('teste.org_b')::uuid,
  'xyz-9876','98765432109','graneleiro',30000, current_date + 30)::text, true);

-- Transportadora A (em análise) cadastra frota.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000311","aal":"aal1"}',true);
select set_config('teste.org', public.enviar_cadastro_transportadora(
  'Frota A Transportes','12ABC34501DE35','Carlos','11988887777','Ibiúna','SP',array['SP'],array['refrigerada'])::text, true);
select set_config('teste.veiculo', public.salvar_veiculo(null, current_setting('teste.org')::uuid,
  'abc-1d23',' 1234567890-1 ','bau',1000, current_date + 365)::text, true);
select set_config('teste.motorista', public.salvar_motorista(null, current_setting('teste.org')::uuid,
  ' João Lima ','529.982.247-25','123.456.789-01','d', current_date + 365, current_setting('teste.veiculo')::uuid)::text, true);
do $$
declare org uuid := current_setting('teste.org')::uuid; v uuid := current_setting('teste.veiculo')::uuid; m uuid := current_setting('teste.motorista')::uuid;
begin
 if not exists (select 1 from public.veiculos where id = v and organizacao_id = org and placa = 'ABC1D23' and renavam = '12345678901'
    and tipo = 'bau' and capacidade_kg = 1000 and atualizado_por = auth.uid()) then raise exception 'Veículo não persistido ou não normalizado'; end if;
 if not exists (select 1 from public.motoristas where id = m and organizacao_id = org and nome = 'João Lima' and cpf = '52998224725'
    and cnh_numero = '12345678901' and cnh_categoria = 'D' and veiculo_id = v) then raise exception 'Motorista não persistido ou não normalizado'; end if;
 if exists (select 1 from public.veiculos where organizacao_id <> org) then raise exception 'Leu frota de outra empresa'; end if;
 -- Edição e desvínculo.
 perform public.salvar_veiculo(v, org, 'ABC1234','12345678901','refrigerado',1200, current_date + 200);
 perform public.salvar_motorista(m, org, 'João Lima','52998224725','12345678901','E', current_date + 200, null);
 if not exists (select 1 from public.veiculos where id = v and placa = 'ABC1234' and tipo = 'refrigerado' and capacidade_kg = 1200) then raise exception 'Edição do veículo perdida'; end if;
 if not exists (select 1 from public.motoristas where id = m and cnh_categoria = 'E' and veiculo_id is null) then raise exception 'Edição/desvínculo do motorista perdido'; end if;
 perform public.salvar_motorista(m, org, 'João Lima','52998224725','12345678901','E', current_date + 200, v);
 -- Vínculo alheio ou inválido.
 begin perform public.salvar_motorista(m, org, 'João Lima','52998224725','12345678901','E', current_date + 200, current_setting('teste.veiculo_b')::uuid); raise exception 'Vinculou veículo de outra empresa'; exception when foreign_key_violation then null; end;
 begin perform public.salvar_veiculo(current_setting('teste.veiculo_b')::uuid, org, 'XYZ9876','98765432109','bau',1, current_date + 1); raise exception 'Editou veículo de outra empresa'; exception when insufficient_privilege then null; end;
 begin perform public.salvar_veiculo(null, current_setting('teste.org_b')::uuid, 'DEF5678','12345678901','bau',1000, current_date + 1); raise exception 'Gravou na frota de outra empresa'; exception when insufficient_privilege then null; end;
 begin perform public.salvar_veiculo(null, org, 'XYZ9876','12345678901','bau',1000, current_date + 1); raise exception 'Placa repetida aceita'; exception when unique_violation then null; end;
 begin perform public.salvar_veiculo(null, org, 'AB12345','12345678901','bau',1000, current_date + 1); raise exception 'Placa inválida aceita'; exception when check_violation then null; end;
 begin perform public.salvar_veiculo(null, org, 'DEF5678','12345678901','foguete',1000, current_date + 1); raise exception 'Tipo inválido aceito'; exception when check_violation then null; end;
 begin perform public.salvar_veiculo(null, org, 'DEF5678','12345678901','bau',0, current_date + 1); raise exception 'Capacidade zero aceita'; exception when check_violation then null; end;
 begin perform public.salvar_veiculo(null, org, 'DEF5678','12345678901','bau',1000, current_date - 1); raise exception 'Seguro vencido aceito'; exception when sqlstate 'PT422' then null; end;
 begin perform public.salvar_motorista(null, org, 'Ana','52998224726','12345678901','C', current_date + 1, null); raise exception 'CPF inválido aceito'; exception when check_violation then null; end;
 begin perform public.salvar_motorista(null, org, 'Ana','11111111111','12345678901','C', current_date + 1, null); raise exception 'CPF repetido-dígito aceito'; exception when check_violation then null; end;
 begin perform public.salvar_motorista(null, org, 'Ana','52998224725','12345678901','C', current_date + 1, null); raise exception 'CPF duplicado na empresa'; exception when unique_violation then null; end;
 begin perform public.salvar_motorista(null, org, 'Ana','11144477735','12345678901','A', current_date + 1, null); raise exception 'Categoria A aceita'; exception when check_violation then null; end;
 begin perform public.salvar_motorista(null, org, 'Ana','11144477735','12345678901','C', current_date - 1, null); raise exception 'CNH vencida aceita'; exception when sqlstate 'PT422' then null; end;
 begin insert into public.veiculos (organizacao_id, placa, renavam, tipo, capacidade_kg, seguro_validade) values (org,'GHI1J23','12345678901','bau',1, current_date + 1); raise exception 'Insert direto permitido'; exception when insufficient_privilege then null; end;
 begin update public.motoristas set cnh_validade = current_date + 3650; raise exception 'Update direto permitido'; exception when insufficient_privilege then null; end;
end $$;

-- Mesmo motorista pode trabalhar para outra transportadora (CPF único por empresa).
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000312","aal":"aal1"}',true);
do $$
begin
 if exists (select 1 from public.veiculos where organizacao_id = current_setting('teste.org')::uuid)
    or exists (select 1 from public.motoristas where organizacao_id = current_setting('teste.org')::uuid) then raise exception 'Outra empresa leu a frota'; end if;
 perform public.salvar_motorista(null, current_setting('teste.org_b')::uuid, 'João Lima','52998224725','12345678901','E', current_date + 10, current_setting('teste.veiculo_b')::uuid);
end $$;

-- Equipe: sem MFA não lê nem grava; com MFA identifica o responsável.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000313","aal":"aal1"}',true);
do $$
begin
 if exists (select 1 from public.motoristas) then raise exception 'Equipe sem MFA leu motoristas'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000313","aal":"aal2"}',true);
do $$
begin
 if not exists (select 1 from public.motoristas m join public.veiculos v on v.id = m.veiculo_id
    join public.cadastros_transportadora t on t.organizacao_id = m.organizacao_id
    where m.id = current_setting('teste.motorista')::uuid and v.placa = 'ABC1234' and t.contato_telefone = '11988887777') then raise exception 'Equipe não identifica motorista, veículo e transportadora'; end if;
 begin perform public.salvar_veiculo(null, current_setting('teste.org')::uuid, 'JKL1234','12345678901','bau',1000, current_date + 1); raise exception 'Equipe gravou frota'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$
begin
 if has_table_privilege('anon','public.veiculos','select') or has_table_privilege('anon','public.motoristas','select')
    or has_table_privilege('authenticated','public.veiculos','insert') or has_table_privilege('authenticated','public.motoristas','update')
    or has_function_privilege('anon','public.salvar_veiculo(uuid,uuid,text,text,text,integer,date)','execute')
    or has_function_privilege('anon','public.salvar_motorista(uuid,uuid,text,text,text,text,date,uuid)','execute') then raise exception 'Privilégios abertos demais'; end if;
end $$;
rollback;
