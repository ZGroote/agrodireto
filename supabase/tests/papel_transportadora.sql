begin;
update agrodireto_privado.seguranca_equipe set exige_mfa = true where unica;
insert into auth.users (id, aud, role, email) values
('eec4d7f1-bd11-41c1-9087-000000000321','authenticated','authenticated','agrodireto-papel-titular@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000322','authenticated','authenticated','agrodireto-papel-membro@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000323','authenticated','authenticated','agrodireto-papel-outra@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000324','authenticated','authenticated','agrodireto-papel-admin@example.invalid');
insert into public.equipe_agrodireto values ('eec4d7f1-bd11-41c1-9087-000000000324');
set local role authenticated;

-- Titular cria a transportadora; outra empresa cria a sua.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000321","aal":"aal1"}',true);
select set_config('teste.org', public.enviar_cadastro_transportadora(
  'Papel Transportes','12ABC34501DE35','Titular','11988887777','Ibiúna','SP',array['SP'],array['granel'])::text, true);
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000323","aal":"aal1"}',true);
select set_config('teste.org_outra', public.enviar_cadastro_transportadora(
  'Outra Transportes','11222333000181','Outra','11977776666','Campinas','SP',array['SP'],array['granel'])::text, true);

-- Inclusão de membro ainda não tem fluxo (B01): entra direto pelo dono do banco.
reset role;
insert into public.membros_organizacao (organizacao_id, usuario_id, papel)
values (current_setting('teste.org')::uuid, 'eec4d7f1-bd11-41c1-9087-000000000322', 'membro');
set local role authenticated;

-- Equipe pede ajuste para liberar o reenvio.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000324","aal":"aal2"}',true);
select public.revisar_cadastro_transportadora(current_setting('teste.org')::uuid,
  (select enviada_em from public.cadastros_transportadora where organizacao_id = current_setting('teste.org')::uuid), 'Confira o telefone');
select set_config('teste.enviada', (select enviada_em::text from public.cadastros_transportadora where organizacao_id = current_setting('teste.org')::uuid), true);

-- Helper genérico.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000321","aal":"aal1"}',true);
do $$
begin
 if not agrodireto_privado.e_titular(current_setting('teste.org')::uuid) then raise exception 'Titular não reconhecido'; end if;
 if agrodireto_privado.e_titular(current_setting('teste.org_outra')::uuid) then raise exception 'Titular de outra organização'; end if;
end $$;

-- Membro: grava frota, mas não reenvia o cadastro.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000322","aal":"aal1"}',true);
do $$
declare org uuid := current_setting('teste.org')::uuid;
begin
 if agrodireto_privado.e_titular(org) or not agrodireto_privado.e_membro(org) then raise exception 'Papel do membro errado'; end if;
 perform public.salvar_veiculo(null, org, 'ABC1D23','12345678901','bau',1000, current_date + 30);
 perform public.salvar_motorista(null, org, 'Ana Souza','52998224725','12345678901','C', current_date + 30, null);
 begin perform public.reenviar_cadastro_transportadora(org, current_setting('teste.enviada')::timestamptz,
   'Papel Transportes','12ABC34501DE35','Membro','11988887777','Ibiúna','SP',array['SP'],array['granel']); raise exception 'Membro reenviou o cadastro';
 exception when insufficient_privilege then null; end;
 begin perform public.salvar_veiculo(null, current_setting('teste.org_outra')::uuid, 'DEF5678','12345678901','bau',1000, current_date + 30); raise exception 'Membro gravou frota de outra empresa';
 exception when insufficient_privilege then null; end;
end $$;

-- Outra empresa: reenvio segue sem revelar a organização (PT409).
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000323","aal":"aal1"}',true);
do $$
begin
 begin perform public.reenviar_cadastro_transportadora(current_setting('teste.org')::uuid, current_setting('teste.enviada')::timestamptz,
   'Invasão','12ABC34501DE35','Invasor','11988887777','Ibiúna','SP',array['SP'],array['granel']); raise exception 'Outra empresa reenviou';
 exception when sqlstate 'PT409' then null; end;
end $$;

-- Sem sessão (token expirado chega sem sub): nada grava.
select set_config('request.jwt.claims','{}',true);
do $$
declare org uuid := current_setting('teste.org')::uuid;
begin
 begin perform public.enviar_cadastro_transportadora('Sem Sessão','11444777000161','X','11988887777','Ibiúna','SP',array['SP'],array['granel']); raise exception 'Enviou sem sessão';
 exception when insufficient_privilege then null; end;
 begin perform public.reenviar_cadastro_transportadora(org, current_setting('teste.enviada')::timestamptz,
   'Sem Sessão','12ABC34501DE35','X','11988887777','Ibiúna','SP',array['SP'],array['granel']); raise exception 'Reenviou sem sessão';
 exception when sqlstate 'PT409' then null; end;
 begin perform public.salvar_veiculo(null, org, 'GHI1J23','12345678901','bau',1000, current_date + 30); raise exception 'Salvou veículo sem sessão';
 exception when insufficient_privilege then null; end;
 begin perform public.salvar_motorista(null, org, 'Sem Sessão','11144477735','12345678901','C', current_date + 30, null); raise exception 'Salvou motorista sem sessão';
 exception when insufficient_privilege then null; end;
end $$;

-- Titular reenvia.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000321","aal":"aal1"}',true);
select public.reenviar_cadastro_transportadora(current_setting('teste.org')::uuid, current_setting('teste.enviada')::timestamptz,
  'Papel Transportes','12ABC34501DE35','Titular','11966665555','Ibiúna','SP',array['SP'],array['granel']);
do $$
begin
 if not exists (select 1 from public.cadastros_transportadora where organizacao_id = current_setting('teste.org')::uuid
    and status = 'em_analise' and contato_telefone = '11966665555') then raise exception 'Titular não reenviou'; end if;
 if (select count(*) from public.veiculos where organizacao_id = current_setting('teste.org')::uuid) <> 1
    or (select count(*) from public.motoristas where organizacao_id = current_setting('teste.org')::uuid) <> 1 then raise exception 'Frota do membro não persistiu'; end if;
end $$;
reset role;
do $$
begin
 if has_function_privilege('anon','agrodireto_privado.e_titular(uuid)','execute')
    or not has_function_privilege('authenticated','agrodireto_privado.e_titular(uuid)','execute')
    or has_function_privilege('anon','public.reenviar_cadastro_transportadora(uuid,timestamptz,text,text,text,text,text,text,text[],text[])','execute')
    or not has_function_privilege('authenticated','public.reenviar_cadastro_transportadora(uuid,timestamptz,text,text,text,text,text,text,text[],text[])','execute')
    or (select provolatile from pg_proc where oid = 'agrodireto_privado.e_titular(uuid)'::regprocedure) <> 's'
    or not (select proconfig @> array['search_path=""'] from pg_proc where oid = 'agrodireto_privado.e_titular(uuid)'::regprocedure)
 then raise exception 'Privilégios ou atributos de e_titular/reenviar errados'; end if;
end $$;
rollback;
