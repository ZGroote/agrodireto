begin;
update agrodireto_privado.seguranca_equipe set exige_mfa = true where unica;
insert into auth.users (id, aud, role, email) values
('eec4d7f1-bd11-41c1-9087-000000000301','authenticated','authenticated','agrodireto-transp-a@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000302','authenticated','authenticated','agrodireto-transp-b@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000303','authenticated','authenticated','agrodireto-transp-admin@example.invalid');
insert into public.equipe_agrodireto values ('eec4d7f1-bd11-41c1-9087-000000000303');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000301","aal":"aal1"}',true);
select set_config('teste.org', public.enviar_cadastro_transportadora(
  ' Boa Rota Transportes ','12.ABC.345/01DE-35','Carlos Silva','(11) 98888-7777','Ibiúna','sp',
  array['sp','SP',' mg'], array['Refrigerada','carga_seca'])::text, true);
do $$
declare org uuid := current_setting('teste.org')::uuid;
begin
 if public.enviar_cadastro_transportadora('Outra','11222333000181','Outro','11999999999','Outra','MG',array['MG'],array['granel']) <> org then raise exception 'Envio repetido criou outra transportadora'; end if;
 if (select count(*) from public.cadastros_transportadora) <> 1 or (select count(*) from public.organizacoes) <> 1 then raise exception 'Envio repetido duplicou ou mudou o cadastro'; end if;
 if (select tipo from public.organizacoes where id = org) <> 'transportadora'
    or not exists (select 1 from public.membros_organizacao where organizacao_id = org and usuario_id = auth.uid() and papel = 'titular') then raise exception 'Organização ou titular errados'; end if;
 if not exists (select 1 from public.cadastros_transportadora where organizacao_id = org and razao_social = 'Boa Rota Transportes'
    and cnpj = '12ABC34501DE35' and contato_telefone = '11988887777' and uf = 'SP' and status = 'em_analise'
    and ufs_atendidas = array['MG','SP'] and tipos_carga = array['carga_seca','refrigerada']) then raise exception 'Dados não normalizados'; end if;
 begin update public.cadastros_transportadora set status = 'aprovada'; raise exception 'Autoaprovação permitida'; exception when insufficient_privilege then null; end;
 begin perform public.revisar_cadastro_transportadora(org, (select enviada_em from public.cadastros_transportadora), null); raise exception 'Usuário comum aprovou'; exception when insufficient_privilege then null; end;
 begin perform public.reenviar_cadastro_transportadora(org, (select enviada_em from public.cadastros_transportadora), 'X Ltda','11222333000181','Carlos','11988887777','Ibiúna','SP',array['SP'],array['granel']); raise exception 'Reenviou cadastro em análise'; exception when sqlstate 'PT409' then null; end;
 if (select organizacao_id from public.propriedades where id = public.enviar_propriedade('Sítio teste','Ibiúna','SP',1,'Tomate')) = org then raise exception 'Propriedade caiu na transportadora'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000302","aal":"aal2"}',true);
do $$
declare org uuid := current_setting('teste.org')::uuid;
begin
 if exists (select 1 from public.cadastros_transportadora) or exists (select 1 from public.organizacoes where id = org) then raise exception 'Acesso cruzado permitido'; end if;
 begin perform public.reenviar_cadastro_transportadora(org, now(), 'Invasão','11222333000181','Invasor','11988887777','Cidade','SP',array['SP'],array['granel']); raise exception 'Outra empresa reenviou'; exception when sqlstate 'PT409' then null; end;
 begin perform public.enviar_cadastro_transportadora('Cópia','12ABC34501DE35','Fulano','11988887777','Cidade','SP',array['SP'],array['granel']); raise exception 'CNPJ repetido aceito'; exception when unique_violation then null; end;
 begin perform public.enviar_cadastro_transportadora('Teste','11222333000182','Fulano','11988887777','Cidade','SP',array['SP'],array['granel']); raise exception 'CNPJ inválido aceito'; exception when check_violation then null; end;
 begin perform public.enviar_cadastro_transportadora('Teste','11222333000181','Fulano','11988887777','Cidade','XX',array['SP'],array['granel']); raise exception 'UF inválida aceita'; exception when check_violation then null; end;
 begin perform public.enviar_cadastro_transportadora('Teste','11222333000181','Fulano','11988887777','Cidade','SP','{}',array['granel']); raise exception 'Sem região atendida aceito'; exception when check_violation then null; end;
 begin perform public.enviar_cadastro_transportadora('Teste','11222333000181','Fulano','11988887777','Cidade','SP',array['SP','ZZ'],array['granel']); raise exception 'Região inválida aceita'; exception when check_violation then null; end;
 begin perform public.enviar_cadastro_transportadora('Teste','11222333000181','Fulano','11988887777','Cidade','SP',array['SP'],array['foguete']); raise exception 'Tipo de carga inválido aceito'; exception when check_violation then null; end;
 begin perform public.enviar_cadastro_transportadora('Teste','11222333000181','Fulano','11988887777','Cidade','SP',array['SP'],array['granel',null]); raise exception 'Tipo de carga nulo aceito'; exception when check_violation then null; end;
 if exists (select 1 from public.membros_organizacao where usuario_id = auth.uid()) then raise exception 'Envio recusado deixou organização'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000303","aal":"aal1"}',true);
do $$
begin
 if exists (select 1 from public.cadastros_transportadora) then raise exception 'Equipe sem MFA leu cadastros'; end if;
 begin perform public.revisar_cadastro_transportadora(current_setting('teste.org')::uuid, now(), null); raise exception 'Equipe sem MFA revisou'; exception when insufficient_privilege then null; end;
 begin perform public.enviar_cadastro_transportadora('Equipe','11222333000181','Equipe','11988887777','Cidade','SP',array['SP'],array['granel']); raise exception 'Equipe enviou cadastro'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000303","aal":"aal2"}',true);
select set_config('teste.enviada', (select enviada_em::text from public.cadastros_transportadora), true);
select public.revisar_cadastro_transportadora(current_setting('teste.org')::uuid, current_setting('teste.enviada')::timestamptz, ' Envie o CNPJ da matriz ');
do $$
begin
 if not exists (select 1 from public.cadastros_transportadora where status = 'ajustes_solicitados' and motivo_ajuste = 'Envie o CNPJ da matriz'
    and ajuste_solicitado_por = auth.uid() and ajuste_solicitado_em is not null and aprovada_em is null) then raise exception 'Pedido de ajuste sem auditoria'; end if;
 begin perform public.revisar_cadastro_transportadora(current_setting('teste.org')::uuid, current_setting('teste.enviada')::timestamptz, null); raise exception 'Revisou duas vezes'; exception when sqlstate 'PT409' then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000301","aal":"aal1"}',true);
select public.reenviar_cadastro_transportadora(current_setting('teste.org')::uuid, current_setting('teste.enviada')::timestamptz,
  'Boa Rota Transportes Matriz','11.222.333/0001-81','Carlos Silva','11988887777','Ibiúna','SP',array['SP','PR'],array['granel']);
do $$
begin
 if not exists (select 1 from public.cadastros_transportadora where status = 'em_analise' and cnpj = '11222333000181' and motivo_ajuste is null
    and ajuste_solicitado_por is null and enviada_em > current_setting('teste.enviada')::timestamptz and ufs_atendidas = array['PR','SP']) then raise exception 'Reenvio não voltou para análise'; end if;
 if (select nome from public.organizacoes where id = current_setting('teste.org')::uuid) <> 'Boa Rota Transportes Matriz' then raise exception 'Nome da organização não acompanhou'; end if;
 begin perform public.reenviar_cadastro_transportadora(current_setting('teste.org')::uuid, current_setting('teste.enviada')::timestamptz, 'Boa Rota','11222333000181','Carlos','11988887777','Ibiúna','SP',array['SP'],array['granel']); raise exception 'Reenvio com versão antiga aceito'; exception when sqlstate 'PT409' then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000303","aal":"aal2"}',true);
select public.revisar_cadastro_transportadora(current_setting('teste.org')::uuid, (select enviada_em from public.cadastros_transportadora), null);
do $$
begin
 if not exists (select 1 from public.cadastros_transportadora where status = 'aprovada' and aprovada_por = auth.uid() and aprovada_em is not null and motivo_ajuste is null) then raise exception 'Aprovação sem auditoria'; end if;
end $$;
reset role;
do $$
begin
 if has_table_privilege('anon','public.cadastros_transportadora','select')
    or has_table_privilege('authenticated','public.cadastros_transportadora','insert')
    or has_table_privilege('authenticated','public.cadastros_transportadora','update')
    or has_function_privilege('anon','public.enviar_cadastro_transportadora(text,text,text,text,text,text,text[],text[])','execute')
    or has_function_privilege('authenticated','agrodireto_privado.lista_normalizada(text[],boolean)','execute') then raise exception 'Privilégio a mais'; end if;
end $$;
rollback;
select 'Transportadora: organização, idempotência, CNPJ, regiões, tipos de carga, RLS, MFA, ajustes e aprovação OK; dados de teste revertidos' as resultado;
