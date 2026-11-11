begin;
update agrodireto_privado.seguranca_equipe set exige_mfa = true where unica;
update agrodireto_privado.catalogo_homologacao set habilitado = true where unica;
insert into auth.users (id, aud, role, email) values
('c0c0c0c0-0000-4000-8000-000000000001','authenticated','authenticated','comprador-a@example.invalid'),
('c0c0c0c0-0000-4000-8000-000000000002','authenticated','authenticated','comprador-b@example.invalid'),
('c0c0c0c0-0000-4000-8000-000000000003','authenticated','authenticated','comprador-equipe@example.invalid');
insert into public.equipe_agrodireto values ('c0c0c0c0-0000-4000-8000-000000000003');
do $$
begin
 if not agrodireto_privado.cnpj_valido('11222333000181') or not agrodireto_privado.cnpj_valido('12ABC34501DE35')
    or agrodireto_privado.cnpj_valido('11222333000182') or agrodireto_privado.cnpj_valido('11111111111111')
    or agrodireto_privado.cnpj_valido('12abc34501de35') then raise exception 'Validação de CNPJ incorreta'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"c0c0c0c0-0000-4000-8000-000000000001","aal":"aal1"}',true);
do $$
begin
 begin perform public.consultar_catalogo(); raise exception 'Catálogo liberado sem cadastro'; exception when sqlstate 'PT403' then null; end;
 begin perform public.enviar_cadastro_comprador('Mercado Teste','11.222.333/0001-82','Ana','11 99999-0000','São Paulo','SP','Rua Teste, 100'); raise exception 'CNPJ inválido aceito'; exception when check_violation then null; end;
 if (select count(*) from public.organizacoes) <> 0 then raise exception 'Envio inválido deixou organização'; end if;
end $$;
select set_config('teste.org', public.enviar_cadastro_comprador('Mercado Teste','11.222.333/0001-81','Ana','(11) 99999-0000','São Paulo','sp','Rua Teste, 100')::text, true);
do $$
declare org uuid := current_setting('teste.org')::uuid;
begin
 if public.enviar_cadastro_comprador('Outro nome','12ABC34501DE35','Ana','11999990000','Campinas','SP','Rua Teste, 100') <> org then raise exception 'Reenvio criou outra empresa'; end if;
 if (select count(*) from public.cadastros_comprador) <> 1 or (select cnpj from public.cadastros_comprador) <> '11222333000181'
    or (select contato_telefone from public.cadastros_comprador) <> '11999990000' or (select uf from public.cadastros_comprador) <> 'SP' then raise exception 'Cadastro não normalizado ou duplicado'; end if;
 if (select tipo from public.organizacoes where id = org) <> 'comprador' or not exists (select 1 from public.membros_organizacao where organizacao_id = org and usuario_id = auth.uid() and papel = 'titular') then raise exception 'Empresa compradora mal criada'; end if;
 begin perform public.consultar_catalogo(); raise exception 'Catálogo liberado em análise'; exception when sqlstate 'PT403' then null; end;
 perform public.enviar_propriedade('Sítio do comprador','Campinas','SP',3,'Milho');
 if (select count(*) from public.organizacoes) <> 2 or (select organizacao_id from public.propriedades) = org then raise exception 'Propriedade caiu na empresa compradora'; end if;
 begin update public.cadastros_comprador set status = 'aprovada'; raise exception 'Autoaprovação permitida'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"c0c0c0c0-0000-4000-8000-000000000002","aal":"aal2"}',true);
do $$
declare org uuid := current_setting('teste.org')::uuid;
begin
 if (select count(*) from public.cadastros_comprador) <> 0 then raise exception 'Acesso cruzado permitido'; end if;
 begin perform public.revisar_cadastro_comprador(org, now(), null); raise exception 'Usuário comum aprovou'; exception when insufficient_privilege then null; end;
 begin perform public.reenviar_cadastro_comprador(org, now(),'Invasão','11222333000181','B','11999990000','Rio','RJ','Rua X, 1'); raise exception 'Outra empresa reenviou'; exception when sqlstate 'PT409' then null; end;
 begin perform public.enviar_cadastro_comprador('Copia','11222333000181','Bia','11999990000','Rio','RJ','Rua X, 1'); raise exception 'CNPJ duplicado aceito'; exception when unique_violation then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"c0c0c0c0-0000-4000-8000-000000000003","aal":"aal1"}',true);
do $$
begin
 if exists (select 1 from public.cadastros_comprador) then raise exception 'Equipe sem MFA leu cadastro'; end if;
 begin perform public.revisar_cadastro_comprador(current_setting('teste.org')::uuid, now(), null); raise exception 'Equipe sem MFA revisou'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"c0c0c0c0-0000-4000-8000-000000000003","aal":"aal2"}',true);
select public.revisar_cadastro_comprador(organizacao_id, enviada_em, 'Confira o endereço de entrega')
  from public.cadastros_comprador where organizacao_id = current_setting('teste.org')::uuid;
select set_config('request.jwt.claims','{"sub":"c0c0c0c0-0000-4000-8000-000000000001","aal":"aal1"}',true);
do $$
declare org uuid := current_setting('teste.org')::uuid; versao timestamptz;
begin
 select enviada_em into versao from public.cadastros_comprador where organizacao_id = org and status = 'ajustes_solicitados' and motivo_ajuste = 'Confira o endereço de entrega';
 if versao is null then raise exception 'Pedido de ajuste não registrado'; end if;
 begin perform public.reenviar_cadastro_comprador(org, versao - interval '1 second','Mercado Teste','11222333000181','Ana','11999990000','São Paulo','SP','Rua Teste, 200'); raise exception 'Versão antiga aceita'; exception when sqlstate 'PT409' then null; end;
 perform public.reenviar_cadastro_comprador(org, versao,'Mercado Central','11222333000181','Ana','11999990000','São Paulo','SP','Rua Teste, 200');
 if (select status from public.cadastros_comprador) <> 'em_analise' or (select nome from public.organizacoes where id = org) <> 'Mercado Central' then raise exception 'Reenvio não voltou para análise'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"c0c0c0c0-0000-4000-8000-000000000003","aal":"aal2"}',true);
select public.revisar_cadastro_comprador(organizacao_id, enviada_em, null)
  from public.cadastros_comprador where organizacao_id = current_setting('teste.org')::uuid;
select set_config('request.jwt.claims','{"sub":"c0c0c0c0-0000-4000-8000-000000000001","aal":"aal1"}',true);
do $$
begin
 if not exists (select 1 from public.cadastros_comprador where status = 'aprovada' and aprovada_por = 'c0c0c0c0-0000-4000-8000-000000000003' and aprovada_em is not null) then raise exception 'Aprovação sem auditoria'; end if;
 perform public.consultar_catalogo();
 if not public.sou_comprador_autorizado() then raise exception 'Comprador aprovado não reconhecido'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"c0c0c0c0-0000-4000-8000-000000000002","aal":"aal1"}',true);
do $$
begin
 if public.sou_comprador_autorizado() then raise exception 'Conta de fora reconhecida como compradora'; end if;
 begin perform public.consultar_catalogo(); raise exception 'Catálogo liberado a quem não é da empresa'; exception when sqlstate 'PT403' then null; end;
end $$;
reset role;
do $$
begin
 if has_table_privilege('anon','public.cadastros_comprador','select')
    or has_function_privilege('anon','public.enviar_cadastro_comprador(text,text,text,text,text,text,text)','execute')
    or has_function_privilege('authenticated','public.revisar_cadastro_comprador(uuid,timestamptz,text)','execute') is not true then raise exception 'Permissões incorretas'; end if;
end $$;
rollback;
select 'Empresa compradora, CNPJ, RLS, MFA, ajustes, aprovação e catálogo OK; dados de teste revertidos' as resultado;
