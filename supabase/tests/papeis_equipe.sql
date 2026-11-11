begin;
-- B05: papéis da equipe (matriz), concessão/revogação só por geral, MFA conforme exige_mfa.
update agrodireto_privado.seguranca_equipe set exige_mfa = true where unica;
insert into auth.users (id, aud, role, email) values
 ('53000000-0000-0000-0000-000000000001','authenticated','authenticated','papeis-geral@example.invalid'),
 ('53000000-0000-0000-0000-000000000002','authenticated','authenticated','papeis-cadastral@example.invalid'),
 ('53000000-0000-0000-0000-000000000003','authenticated','authenticated','papeis-comercial@example.invalid'),
 ('53000000-0000-0000-0000-000000000004','authenticated','authenticated','papeis-logistico@example.invalid'),
 ('53000000-0000-0000-0000-000000000005','authenticated','authenticated','papeis-financeiro@example.invalid'),
 ('53000000-0000-0000-0000-000000000006','authenticated','authenticated','papeis-auditor@example.invalid'),
 ('53000000-0000-0000-0000-000000000007','authenticated','authenticated','papeis-suporte@example.invalid'),
 ('53000000-0000-0000-0000-000000000008','authenticated','authenticated','papeis-produtor@example.invalid'),
 ('53000000-0000-0000-0000-000000000009','authenticated','authenticated','papeis-alvo@example.invalid'),
 ('53000000-0000-0000-0000-000000000010','authenticated','authenticated','papeis-padrao@example.invalid');
insert into public.equipe_agrodireto (usuario_id, papel) values
 ('53000000-0000-0000-0000-000000000001','geral'),
 ('53000000-0000-0000-0000-000000000002','cadastral'),
 ('53000000-0000-0000-0000-000000000003','comercial'),
 ('53000000-0000-0000-0000-000000000004','logistico'),
 ('53000000-0000-0000-0000-000000000005','financeiro'),
 ('53000000-0000-0000-0000-000000000006','auditor'),
 ('53000000-0000-0000-0000-000000000007','suporte');
-- Inserção antiga (sem papel) continua valendo e vira geral.
insert into public.equipe_agrodireto values ('53000000-0000-0000-0000-000000000010');
do $$
begin
 if (select papel from public.equipe_agrodireto where usuario_id = '53000000-0000-0000-0000-000000000010') <> 'geral' then raise exception 'Papel padrão não é geral'; end if;
end $$;
delete from public.equipe_agrodireto where usuario_id = '53000000-0000-0000-0000-000000000010';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000008","aal":"aal1"}',true);
select public.enviar_propriedade('Sítio papéis','Cidade','SP',1,'Milho');

-- Matriz papel x ação: permitido chega à regra de negócio (código esperado); negado recebe 42501.
do $$
declare
  matriz jsonb := '{
    "cadastral": ["escrever_cadastros","revisar_ofertas","ler_cadastros","ler_ofertas","ler_frota"],
    "comercial": ["ler_cadastros","ler_ofertas"],
    "logistico": ["ler_cadastros","ler_frota"],
    "financeiro": ["ler_cadastros"],
    "auditor": ["ler_cadastros","ler_ofertas","ler_frota","ler_equipe"],
    "suporte": ["ler_cadastros"]}';
  r record; c record; a text; pode boolean; obtido text; esperado text;
begin
 for r in select * from (values ('01','geral'),('02','cadastral'),('03','comercial'),('04','logistico'),
     ('05','financeiro'),('06','auditor'),('07','suporte')) v(n, papel) loop
  perform set_config('request.jwt.claims', json_build_object('sub', '53000000-0000-0000-0000-0000000000' || r.n, 'aal', 'aal2')::text, true);
  if public.papel_equipe() is distinct from r.papel then raise exception 'papel_equipe errado para %', r.papel; end if;
  foreach a in array array['escrever_cadastros','revisar_ofertas','ler_cadastros','ler_ofertas','ler_frota','ler_equipe','gerir_equipe'] loop
   pode := r.papel = 'geral' or coalesce(matriz -> r.papel ? a, false);
   if public.equipe_pode(a) <> pode then raise exception 'equipe_pode(%) errado para %', a, r.papel; end if;
  end loop;
  for c in select * from (values
     ('escrever_cadastros', 'select public.aprovar_propriedade(gen_random_uuid())', 'P0002'),
     ('escrever_cadastros', 'select public.revisar_propriedade(gen_random_uuid(), now(), null)', 'PT409'),
     ('escrever_cadastros', 'select public.revisar_cadastro_comprador(gen_random_uuid(), now(), null)', 'PT409'),
     ('escrever_cadastros', 'select public.revisar_cadastro_transportadora(gen_random_uuid(), now(), null)', 'PT409'),
     ('revisar_ofertas', 'select public.listar_evidencias_pendentes()', 'ok'),
     ('revisar_ofertas', 'select public.revisar_evidencia_lote(gen_random_uuid(), ''x'', true, null)', 'PT409'),
     ('revisar_ofertas', 'select public.listar_lotes_inspecao()', 'ok'),
     ('revisar_ofertas', 'select public.concluir_inspecao_lote(gen_random_uuid(), true, true, null, ''aprovado'')', 'PT409'),
     ('ler_equipe', 'select public.listar_equipe()', 'ok'),
     ('gerir_equipe', 'select public.revogar_acesso_equipe(gen_random_uuid())', 'ok'),
     ('gerir_equipe', 'select public.conceder_acesso_equipe(''ninguem@example.invalid'', ''suporte'')', 'ok')
   ) v(acao, sql, ok) loop
   pode := r.papel = 'geral' or coalesce(matriz -> r.papel ? c.acao, false);
   begin execute c.sql; obtido := 'ok'; exception when others then obtido := sqlstate; end;
   esperado := case when pode then c.ok else '42501' end;
   if obtido <> esperado then raise exception '% em "%": esperado %, obtido %', r.papel, c.sql, esperado, obtido; end if;
  end loop;
  -- Todos os papéis leem cadastros (ler_cadastros); a RLS usa equipe_pode.
  if not exists (select 1 from public.propriedades) or not exists (select 1 from public.organizacoes) then
   raise exception '% não lê cadastros', r.papel;
  end if;
 end loop;
end $$;

-- Segundo fator: com exige_mfa, aal1 não libera nada (seis dígitos inválidos nunca viram aal2).
select set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000001","aal":"aal1"}',true);
do $$
begin
 if public.papel_equipe() is not null or public.equipe_pode('ler_cadastros') then raise exception 'aal1 liberou a equipe'; end if;
 if exists (select 1 from public.propriedades) then raise exception 'aal1 leu cadastros'; end if;
 begin perform public.aprovar_propriedade(gen_random_uuid()); raise exception 'aal1 aprovou'; exception when insufficient_privilege then null; end;
 begin perform public.conceder_acesso_equipe('papeis-alvo@example.invalid', 'suporte'); raise exception 'aal1 concedeu'; exception when insufficient_privilege then null; end;
end $$;

-- Concessão pelo geral: por e-mail, idempotente, com histórico; nunca a si mesmo.
select set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000001","aal":"aal2"}',true);
do $$
declare alvo uuid := '53000000-0000-0000-0000-000000000009';
begin
 if not public.conceder_acesso_equipe(' PAPEIS-ALVO@example.invalid ', 'suporte') then raise exception 'Conta existente não encontrada'; end if;
 if (select papel from public.listar_equipe() where usuario_id = alvo) <> 'suporte' then raise exception 'Concessão não gravada'; end if;
 perform public.conceder_acesso_equipe('papeis-alvo@example.invalid', 'suporte');
 if (select count(*) from public.concessoes_equipe where usuario_id = alvo) <> 1 then raise exception 'Repetição gravou histórico'; end if;
 perform public.conceder_acesso_equipe('papeis-alvo@example.invalid', 'comercial');
 if (select count(*) from public.concessoes_equipe where usuario_id = alvo and papel = 'comercial' and por = auth.uid()) <> 1 then raise exception 'Troca de papel sem histórico'; end if;
 if public.conceder_acesso_equipe('nao-existe@example.invalid', 'suporte') then raise exception 'E-mail inexistente devolveu verdadeiro'; end if;
 begin perform public.conceder_acesso_equipe('papeis-geral@example.invalid', 'auditor'); raise exception 'Geral alterou o próprio acesso'; exception when insufficient_privilege then null; end;
 begin perform public.conceder_acesso_equipe('papeis-alvo@example.invalid', 'dono'); raise exception 'Papel inválido aceito'; exception when sqlstate 'PT422' then null; end;
 begin perform public.revogar_acesso_equipe(auth.uid()); raise exception 'Geral revogou a si mesmo'; exception when insufficient_privilege then null; end;
end $$;

-- O alvo usa o papel concedido; outros papéis não concedem nem se promovem.
select set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000009","aal":"aal2"}',true);
do $$
begin
 if public.papel_equipe() <> 'comercial' or not public.equipe_pode('ler_ofertas') or public.equipe_pode('escrever_cadastros') then raise exception 'Papel concedido não vale'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000002","aal":"aal2"}',true);
do $$
begin
 begin perform public.conceder_acesso_equipe('papeis-cadastral@example.invalid', 'geral'); raise exception 'Cadastral se promoveu'; exception when insufficient_privilege then null; end;
 begin update public.equipe_agrodireto set papel = 'geral' where usuario_id = auth.uid(); raise exception 'Promoção direta'; exception when insufficient_privilege then null; end;
 begin insert into public.equipe_agrodireto (usuario_id, papel) values ('53000000-0000-0000-0000-000000000008', 'geral'); raise exception 'Concessão direta'; exception when insufficient_privilege then null; end;
 begin insert into public.concessoes_equipe (usuario_id, papel, por) values (auth.uid(), 'geral', auth.uid()); raise exception 'Histórico escrito direto'; exception when insufficient_privilege then null; end;
 if exists (select 1 from public.concessoes_equipe) then raise exception 'Cadastral leu o histórico'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000006","aal":"aal2"}',true);
do $$
begin
 if (select count(*) from public.concessoes_equipe where usuario_id = '53000000-0000-0000-0000-000000000009') <> 2 then raise exception 'Auditor não lê o histórico'; end if;
end $$;

-- Revogação corta o acesso na hora, mesmo com o JWT antigo.
select set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000001","aal":"aal2"}',true);
select public.revogar_acesso_equipe('53000000-0000-0000-0000-000000000009');
do $$
begin
 if (select count(*) from public.concessoes_equipe where usuario_id = '53000000-0000-0000-0000-000000000009' and papel is null) <> 1 then raise exception 'Revogação sem histórico'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000009","aal":"aal2"}',true);
do $$
begin
 if public.acesso_equipe() <> 'sem_acesso' or public.papel_equipe() is not null or public.equipe_pode('ler_cadastros') then raise exception 'Revogado manteve acesso'; end if;
 if exists (select 1 from public.propriedades) then raise exception 'Revogado leu cadastros'; end if;
end $$;

reset role;
-- Políticas: só o trecho da equipe mudou; o de membro/autor continua.
do $$
declare r record;
begin
 for r in select * from (values
   ('propriedades', 'propriedades_leitura', 'ler_cadastros', 'e_membro('),
   ('organizacoes', 'organizacoes_leitura', 'ler_cadastros', 'e_membro('),
   ('membros_organizacao', 'membros_leitura', 'ler_cadastros', 'auth.uid()'),
   ('cadastros_comprador', 'cadastros_comprador_leitura', 'ler_cadastros', 'e_membro('),
   ('cadastros_transportadora', 'cadastros_transportadora_leitura', 'ler_cadastros', 'e_membro('),
   ('midias', 'midias_leitura', 'ler_ofertas', 'e_membro('),
   ('evidencias_lote', 'evidencias_lote_equipe_pendentes', 'ler_ofertas', 'solicitada_em'),
   ('culturas', 'culturas_leitura', 'ler_ofertas', 'e_membro('),
   ('veiculos', 'veiculos_leitura', 'ler_frota', 'e_membro('),
   ('motoristas', 'motoristas_leitura', 'ler_frota', 'e_membro(')
 ) v(tabela, politica, acao, resto) loop
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = r.tabela and policyname = r.politica
      and qual like '%equipe_pode(''' || r.acao || '''%' and qual like '%' || r.resto || '%' and qual not like '%acesso_equipe%') then
   raise exception 'Política % fora do esperado', r.politica;
  end if;
 end loop;
 if has_function_privilege('anon', 'public.equipe_pode(text)', 'execute')
    or has_function_privilege('anon', 'public.papel_equipe()', 'execute')
    or has_function_privilege('anon', 'public.conceder_acesso_equipe(text,text)', 'execute')
    or has_function_privilege('anon', 'public.revogar_acesso_equipe(uuid)', 'execute')
    or has_function_privilege('anon', 'public.listar_equipe()', 'execute')
    or has_table_privilege('anon', 'public.concessoes_equipe', 'select') then raise exception 'Acesso anônimo permitido'; end if;
 if exists (select 1 from pg_proc where proname in ('equipe_pode','papel_equipe','conceder_acesso_equipe','revogar_acesso_equipe','listar_equipe')
    and pronamespace = 'public'::regnamespace and (not prosecdef or proconfig is distinct from array['search_path=""'])) then
  raise exception 'Função nova sem security definer ou search_path vazio';
 end if;
end $$;
rollback;
select 'Papéis da equipe, matriz, MFA, concessão, revogação e histórico OK; dados de teste revertidos' as resultado;
