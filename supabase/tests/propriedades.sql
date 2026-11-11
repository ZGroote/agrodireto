begin;
update agrodireto_privado.seguranca_equipe set exige_mfa = true where unica;
insert into auth.users (id, aud, role, email) values
('eec4d7f1-bd11-41c1-9087-000000000001','authenticated','authenticated','agrodireto-rls-a@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000002','authenticated','authenticated','agrodireto-rls-b@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000003','authenticated','authenticated','agrodireto-rls-admin@example.invalid');
insert into public.equipe_agrodireto values ('eec4d7f1-bd11-41c1-9087-000000000003');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000001","aal":"aal1"}',true);
select set_config('teste.prop', public.enviar_propriedade('Propriedade teste','Cidade teste','SP',2.5,'Tomate')::text, true);
do $$
declare prop uuid := current_setting('teste.prop')::uuid;
begin
 if public.enviar_propriedade(' Propriedade teste ','Outra','MG',9,'Milho') <> prop then raise exception 'Reenvio com o mesmo nome devolveu outra propriedade'; end if;
 if (select count(*) from public.propriedades) <> 1 or (select nome from public.propriedades) <> 'Propriedade teste' then raise exception 'Reenvio duplicou ou alterou o cadastro'; end if;
 perform public.enviar_propriedade('Segunda área','Cidade teste','SP',4,'Café');
 if (select count(*) from public.propriedades) <> 2 or (select count(distinct organizacao_id) from public.propriedades) <> 1 then raise exception 'Segunda propriedade não ficou na mesma organização'; end if;
 if (select count(*) from public.organizacoes) <> 1 or not exists (select 1 from public.membros_organizacao where usuario_id = auth.uid() and papel = 'titular') then raise exception 'Organização ou titular não criados'; end if;
 begin perform public.publicar_oferta_lote('lote-a','Tomate',10,'kg',500,null,current_date,current_date,current_date,'','','',''); raise exception 'Publicou sem propriedade aprovada'; exception when sqlstate 'PT403' then null; end;
 begin update public.propriedades set status='aprovada'; raise exception 'Autoaprovação permitida'; exception when insufficient_privilege then null; end;
 begin insert into public.equipe_agrodireto values (auth.uid()); raise exception 'Autopromoção permitida'; exception when insufficient_privilege then null; end;
 begin insert into public.membros_organizacao (organizacao_id, usuario_id) select organizacao_id, 'eec4d7f1-bd11-41c1-9087-000000000002' from public.propriedades limit 1; raise exception 'Membro incluído pelo app'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000002","aal":"aal2"}',true);
do $$
declare prop uuid := current_setting('teste.prop')::uuid;
begin
 if (select count(*) from public.propriedades) <> 0 or (select count(*) from public.organizacoes) <> 0 or (select count(*) from public.membros_organizacao) <> 0 then raise exception 'Acesso cruzado permitido'; end if;
 begin perform public.aprovar_propriedade(prop); raise exception 'Usuário comum aprovou'; exception when insufficient_privilege then null; end;
 begin perform public.reenviar_propriedade(prop, now(), 'Invasão','Cidade','SP',1,'Milho'); raise exception 'Outra organização reenviou'; exception when sqlstate 'PT409' then null; end;
 begin perform public.enviar_propriedade('Teste','Cidade','XX',-1,'Tomate'); raise exception 'Dados inválidos aceitos'; exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000003","aal":"aal1"}',true);
do $$
begin
 if (select count(*) from public.propriedades) <> 0 then raise exception 'Equipe sem MFA leu dados'; end if;
 begin perform public.aprovar_propriedade(current_setting('teste.prop')::uuid); raise exception 'Equipe sem MFA aprovou'; exception when insufficient_privilege then null; end;
 begin perform public.enviar_propriedade('Equipe','Cidade','SP',1,'Milho'); raise exception 'Equipe enviou propriedade'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000003","aal":"aal2"}',true);
select public.aprovar_propriedade(current_setting('teste.prop')::uuid);
select public.aprovar_propriedade(current_setting('teste.prop')::uuid);
do $$
begin
 if (select count(*) from public.propriedades where status='aprovada' and aprovada_por=auth.uid() and aprovada_em is not null) <> 1 then raise exception 'Aprovação sem auditoria ou fora da propriedade escolhida'; end if;
 if not exists (select 1 from public.organizacoes o join public.propriedades p on p.organizacao_id = o.id where p.id = current_setting('teste.prop')::uuid) then raise exception 'Equipe não lê as organizações'; end if;
end $$;
reset role;
update agrodireto_privado.catalogo_homologacao set habilitado = true where unica;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000001","aal":"aal1"}',true);
do $$
begin
 if (select propriedade_id from public.ofertas_lote where id = public.publicar_oferta_lote('lote-a','Tomate',10,'kg',500,null,current_date,current_date,current_date,'','','','')) <> current_setting('teste.prop')::uuid then raise exception 'Lote não ficou ligado à propriedade aprovada'; end if;
end $$;
reset role;
update agrodireto_privado.seguranca_equipe set exige_mfa = false where unica;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000003","aal":"aal1"}',true);
do $$
begin
 if public.acesso_equipe() <> 'autorizado' or not exists (select 1 from public.propriedades where status='aprovada') then raise exception 'Equipe bloqueada no modo de homologação'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000002","aal":"aal1"}',true);
do $$
begin
 if public.acesso_equipe() <> 'sem_acesso' or exists (select 1 from public.propriedades) then raise exception 'Acesso cruzado permitido no modo de homologação'; end if;
 begin perform public.aprovar_propriedade(current_setting('teste.prop')::uuid); raise exception 'Usuário comum aprovou no modo de homologação'; exception when insufficient_privilege then null; end;
 begin update agrodireto_privado.seguranca_equipe set exige_mfa = true; raise exception 'Conta comum alterou a política'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$
begin
 if has_table_privilege('anon','public.propriedades','select') or has_table_privilege('anon','public.organizacoes','select')
    or has_table_privilege('anon','public.membros_organizacao','select')
    or has_function_privilege('anon','public.enviar_propriedade(text,text,text,numeric,text)','execute') then raise exception 'Acesso anônimo permitido'; end if;
end $$;
rollback;
select 'Organizações, várias propriedades, RLS, MFA, idempotência, auditoria e validação OK; dados de teste revertidos' as resultado;
