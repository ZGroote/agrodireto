begin;
update agrodireto_privado.seguranca_equipe set exige_mfa = true where unica;
insert into auth.users (id, aud, role, email) values
('eec4d7f1-bd11-41c1-9087-000000000001','authenticated','authenticated','agrodireto-rls-a@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000002','authenticated','authenticated','agrodireto-rls-b@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000003','authenticated','authenticated','agrodireto-rls-admin@example.invalid');
insert into public.equipe_agrodireto values ('eec4d7f1-bd11-41c1-9087-000000000003');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000001","aal":"aal1"}',true);
select public.enviar_propriedade('Propriedade teste','Cidade teste','SP',2.5,'Tomate');
select public.enviar_propriedade('Reenvio','Cidade teste','SP',9,'Milho');
do $$
begin
 if (select count(*) from public.propriedades) <> 1 or (select nome from public.propriedades) <> 'Propriedade teste' then raise exception 'Reenvio duplicou ou alterou o cadastro'; end if;
 begin update public.propriedades set status='aprovada'; raise exception 'Autoaprovação permitida'; exception when insufficient_privilege then null; end;
 begin insert into public.equipe_agrodireto values (auth.uid()); raise exception 'Autopromoção permitida'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000002","aal":"aal2"}',true);
do $$
begin
 if (select count(*) from public.propriedades) <> 0 then raise exception 'Acesso cruzado permitido'; end if;
 begin perform public.aprovar_propriedade('eec4d7f1-bd11-41c1-9087-000000000001'); raise exception 'Usuário comum aprovou'; exception when insufficient_privilege then null; end;
 begin perform public.enviar_propriedade('Teste','Cidade','XX',-1,'Tomate'); raise exception 'Dados inválidos aceitos'; exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000003","aal":"aal1"}',true);
do $$
begin
 if (select count(*) from public.propriedades) <> 0 then raise exception 'Equipe sem MFA leu dados'; end if;
 begin perform public.aprovar_propriedade('eec4d7f1-bd11-41c1-9087-000000000001'); raise exception 'Equipe sem MFA aprovou'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000003","aal":"aal2"}',true);
select public.aprovar_propriedade('eec4d7f1-bd11-41c1-9087-000000000001');
select public.aprovar_propriedade('eec4d7f1-bd11-41c1-9087-000000000001');
do $$
begin
 if not exists(select 1 from public.propriedades where status='aprovada' and aprovada_por=auth.uid() and aprovada_em is not null) then raise exception 'Aprovação sem auditoria'; end if;
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
 begin perform public.aprovar_propriedade('eec4d7f1-bd11-41c1-9087-000000000001'); raise exception 'Usuário comum aprovou no modo de homologação'; exception when insufficient_privilege then null; end;
 begin update agrodireto_privado.seguranca_equipe set exige_mfa = true; raise exception 'Conta comum alterou a política'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$
begin
 if has_table_privilege('anon','public.propriedades','select') or has_function_privilege('anon','public.enviar_propriedade(text,text,text,numeric,text)','execute') then raise exception 'Acesso anônimo permitido'; end if;
end $$;
rollback;
select 'RLS, MFA, idempotência, auditoria e validação OK; dados de teste revertidos' as resultado;
