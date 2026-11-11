begin;

insert into auth.users(id, aud, role, email) values
('eec4d7f1-bd11-41c1-9087-000000000501','authenticated','authenticated','identidade-titular@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000502','authenticated','authenticated','identidade-membro@example.invalid'),
('eec4d7f1-bd11-41c1-9087-000000000503','authenticated','authenticated','identidade-fora@example.invalid');
insert into public.organizacoes(id, nome, tipo) values
('eec4d7f1-bd11-41c1-9087-000000000511','Produtor A','produtor'),
('eec4d7f1-bd11-41c1-9087-000000000512','Produtor B','produtor'),
('eec4d7f1-bd11-41c1-9087-000000000513','Comprador A','comprador'),
('eec4d7f1-bd11-41c1-9087-000000000514','Transportadora A','transportadora'),
('eec4d7f1-bd11-41c1-9087-000000000515','Organização alheia','produtor');
insert into public.membros_organizacao(organizacao_id, usuario_id, papel)
select id, 'eec4d7f1-bd11-41c1-9087-000000000501', 'titular' from public.organizacoes
 where id in ('eec4d7f1-bd11-41c1-9087-000000000511','eec4d7f1-bd11-41c1-9087-000000000512',
              'eec4d7f1-bd11-41c1-9087-000000000513','eec4d7f1-bd11-41c1-9087-000000000514');
insert into public.membros_organizacao(organizacao_id, usuario_id, papel)
values ('eec4d7f1-bd11-41c1-9087-000000000515','eec4d7f1-bd11-41c1-9087-000000000503','titular');
insert into public.cadastros_comprador(organizacao_id, enviado_por, razao_social, cnpj,
  contato_nome, contato_telefone, cidade, uf, endereco_entrega, status, motivo_ajuste)
values ('eec4d7f1-bd11-41c1-9087-000000000513','eec4d7f1-bd11-41c1-9087-000000000501',
  'Comprador A','12ABC34501DE35','Titular','11988887777','Ibiúna','SP','Rua Um, 100','ajustes_solicitados','Corrigir contato');
select set_config('teste.enviada', (select enviada_em::text from public.cadastros_comprador
 where organizacao_id = 'eec4d7f1-bd11-41c1-9087-000000000513'), true);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000501","aal":"aal1"}',true);
do $$
declare a text; b text;
begin
  a := public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000511',' IDENTIDADE-MEMBRO@example.invalid ')::text;
  b := public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000511','identidade-ausente@example.invalid')::text;
  if a is distinct from b then raise exception 'Resposta revela existência da conta'; end if;
  perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000511','identidade-membro@example.invalid');
  perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000511',null);
  perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000511','');
  perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000511','identidade-titular@example.invalid');
  if not agrodireto_privado.e_titular('eec4d7f1-bd11-41c1-9087-000000000511') then raise exception 'Repetição alterou titular'; end if;
  perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000512','identidade-membro@example.invalid');
  perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000513','identidade-membro@example.invalid');
  perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000514','identidade-membro@example.invalid');
  if (select count(*) from public.listar_meus_vinculos()) <> 4 then raise exception 'Listagem de vínculos incorreta'; end if;
  if not exists(select 1 from public.listar_meus_vinculos() where perfil = 'comprador'
    and status_cadastro = 'ajustes_solicitados' and papel = 'titular') then raise exception 'Estado/papel incorretos'; end if;
  begin perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000515','identidade-membro@example.invalid');
    raise exception 'Titular incluiu em organização alheia'; exception when insufficient_privilege then null; end;
  if exists(select 1 from public.organizacoes where id = 'eec4d7f1-bd11-41c1-9087-000000000515') then raise exception 'Leu organização alheia'; end if;
end $$;

-- Múltiplos vínculos reais, nenhum contexto implícito, isolamento de usuário e perfil.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000502","aal":"aal1"}',true);
do $$
declare antes timestamptz := clock_timestamp();
begin
  if (select count(*) from public.membros_organizacao) <> 4 then raise exception 'Inclusão duplicou ou vazou membros'; end if;
  if exists(select 1 from public.listar_meus_vinculos() where papel <> 'membro') then raise exception 'Inclusão promoveu'; end if;
  if public.contexto_atual('produtor') is not null then raise exception 'Contexto escolhido implicitamente'; end if;
  perform public.trocar_contexto('produtor','eec4d7f1-bd11-41c1-9087-000000000511');
  perform public.trocar_contexto('produtor','eec4d7f1-bd11-41c1-9087-000000000511');
  if (select count(*) from public.trocas_contexto) <> 1 then raise exception 'Repetição duplicou evento'; end if;
  perform public.trocar_contexto('produtor','eec4d7f1-bd11-41c1-9087-000000000512');
  perform public.trocar_contexto('comprador','eec4d7f1-bd11-41c1-9087-000000000513');
  perform public.trocar_contexto('transportadora','eec4d7f1-bd11-41c1-9087-000000000514');
  if public.contexto_atual('produtor') is distinct from 'eec4d7f1-bd11-41c1-9087-000000000512'::uuid
    or public.contexto_atual('comprador') is distinct from 'eec4d7f1-bd11-41c1-9087-000000000513'::uuid
    or public.contexto_atual('transportadora') is distinct from 'eec4d7f1-bd11-41c1-9087-000000000514'::uuid then
    raise exception 'Contextos interferem entre perfis'; end if;
  if not exists(select 1 from public.trocas_contexto where perfil = 'produtor'
    and organizacao_origem = 'eec4d7f1-bd11-41c1-9087-000000000511'
    and organizacao_destino = 'eec4d7f1-bd11-41c1-9087-000000000512' and usuario = auth.uid() and em >= antes) then
    raise exception 'Auditoria incompleta'; end if;
  if not exists(select 1 from public.trocas_contexto where perfil = 'produtor' and organizacao_origem is null) then
    raise exception 'Primeira seleção sem origem nula'; end if;
  begin perform public.trocar_contexto('produtor','eec4d7f1-bd11-41c1-9087-000000000515');
    raise exception 'Selecionou organização alheia'; exception when insufficient_privilege then null; end;
  begin perform public.trocar_contexto('produtor','eec4d7f1-bd11-41c1-9087-000000000513');
    raise exception 'Selecionou perfil incompatível'; exception when insufficient_privilege then null; end;
  begin perform public.trocar_contexto('equipe','eec4d7f1-bd11-41c1-9087-000000000513');
    raise exception 'Aceitou perfil equipe'; exception when invalid_parameter_value then null; end;
  begin perform public.contexto_atual(null); raise exception 'Aceitou perfil nulo'; exception when invalid_parameter_value then null; end;
  begin perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000511','identidade-fora@example.invalid');
    raise exception 'Membro incluiu outro'; exception when insufficient_privilege then null; end;
  begin update public.membros_organizacao set papel = 'titular' where usuario_id = auth.uid();
    raise exception 'Membro se promoveu'; exception when insufficient_privilege then null; end;
  begin insert into public.equipe_agrodireto(usuario_id) values(auth.uid());
    raise exception 'Membro virou equipe'; exception when insufficient_privilege then null; end;
  begin insert into public.trocas_contexto values(auth.uid(),'produtor',null,'eec4d7f1-bd11-41c1-9087-000000000511',now());
    raise exception 'Inseriu evento diretamente'; exception when insufficient_privilege then null; end;
  begin update public.trocas_contexto set em = now(); raise exception 'Alterou evento'; exception when insufficient_privilege then null; end;
  begin delete from public.trocas_contexto; raise exception 'Apagou evento'; exception when insufficient_privilege then null; end;
  begin perform public.reenviar_cadastro_comprador('eec4d7f1-bd11-41c1-9087-000000000513',current_setting('teste.enviada')::timestamptz,
    'Comprador A','12ABC34501DE35','Membro','11988887777','Ibiúna','SP','Rua Um, 100');
    raise exception 'Membro reenviou comprador'; exception when insufficient_privilege then null; end;
  if (select count(*) from public.trocas_contexto) <> 4 then raise exception 'Tentativa recusada gerou evento'; end if;
end $$;

-- Titular não vê histórico pessoal do membro e pode reenviar o comprador.
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000501","aal":"aal1"}',true);
do $$
begin
  if exists(select 1 from public.trocas_contexto) or public.contexto_atual('produtor') is not null then
    raise exception 'Contexto vazou entre usuários'; end if;
  perform public.reenviar_cadastro_comprador('eec4d7f1-bd11-41c1-9087-000000000513',current_setting('teste.enviada')::timestamptz,
    'Comprador corrigido','12ABC34501DE35','Titular','11988887777','Ibiúna','SP','Rua Um, 100');
  if not exists(select 1 from public.cadastros_comprador where organizacao_id = 'eec4d7f1-bd11-41c1-9087-000000000513'
    and status = 'em_analise' and motivo_ajuste is null and enviada_em > current_setting('teste.enviada')::timestamptz) then
    raise exception 'Titular não reenviou'; end if;
  begin perform public.reenviar_cadastro_comprador('eec4d7f1-bd11-41c1-9087-000000000513',current_setting('teste.enviada')::timestamptz,
    'Comprador A','12ABC34501DE35','Titular','11988887777','Ibiúna','SP','Rua Um, 100');
    raise exception 'Versão antiga aceita'; exception when sqlstate 'PT409' then null; end;
end $$;

select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000503","aal":"aal1"}',true);
do $$
begin
  if exists(select 1 from public.cadastros_comprador) or exists(select 1 from public.trocas_contexto)
    or (select count(*) from public.listar_meus_vinculos()) <> 1 then raise exception 'Dados de outra empresa visíveis'; end if;
  begin perform public.reenviar_cadastro_comprador('eec4d7f1-bd11-41c1-9087-000000000513',current_setting('teste.enviada')::timestamptz,
    'Comprador A','12ABC34501DE35','Intruso','11988887777','Ibiúna','SP','Rua Um, 100');
    raise exception 'Terceiro reenviou'; exception when sqlstate 'PT409' then null; end;
end $$;

-- Revogação administrativa não deve fazer fallback para uma troca anterior.
reset role;
delete from public.membros_organizacao where organizacao_id = 'eec4d7f1-bd11-41c1-9087-000000000512'
  and usuario_id = 'eec4d7f1-bd11-41c1-9087-000000000502';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"eec4d7f1-bd11-41c1-9087-000000000502","aal":"aal1"}',true);
do $$
begin
  if public.contexto_atual('produtor') is not null then raise exception 'Revogação reativou contexto anterior'; end if;
  begin perform public.trocar_contexto('produtor','eec4d7f1-bd11-41c1-9087-000000000512');
    raise exception 'Vínculo revogado selecionável'; exception when insufficient_privilege then null; end;
  perform public.trocar_contexto('produtor','eec4d7f1-bd11-41c1-9087-000000000511');
  if public.contexto_atual('produtor') is distinct from 'eec4d7f1-bd11-41c1-9087-000000000511'::uuid then raise exception 'Troca explícita falhou'; end if;
end $$;

select set_config('request.jwt.claims','{}',true);
do $$
begin
  begin perform public.incluir_membro('eec4d7f1-bd11-41c1-9087-000000000511','identidade-membro@example.invalid');
    raise exception 'Incluiu sem sessão'; exception when insufficient_privilege then null; end;
  begin perform public.listar_meus_vinculos(); raise exception 'Listou sem sessão'; exception when insufficient_privilege then null; end;
  begin perform public.contexto_atual('produtor'); raise exception 'Consultou sem sessão'; exception when insufficient_privilege then null; end;
  begin perform public.trocar_contexto('produtor','eec4d7f1-bd11-41c1-9087-000000000511');
    raise exception 'Trocou sem sessão'; exception when insufficient_privilege then null; end;
  begin perform public.reenviar_cadastro_comprador('eec4d7f1-bd11-41c1-9087-000000000513',current_setting('teste.enviada')::timestamptz,
    'Comprador A','12ABC34501DE35','Sem sessão','11988887777','Ibiúna','SP','Rua Um, 100');
    raise exception 'Reenviou sem sessão'; exception when sqlstate 'PT409' then null; end;
  if exists(select 1 from public.trocas_contexto) then raise exception 'Leu histórico sem sessão'; end if;
end $$;

reset role;
do $$
declare f regprocedure;
begin
  foreach f in array array['public.incluir_membro(uuid,text)'::regprocedure, 'public.listar_meus_vinculos()'::regprocedure,
    'public.contexto_atual(text)'::regprocedure, 'public.trocar_contexto(text,uuid)'::regprocedure,
    'public.reenviar_cadastro_comprador(uuid,timestamptz,text,text,text,text,text,text,text)'::regprocedure] loop
    if has_function_privilege('anon',f,'execute') or not has_function_privilege('authenticated',f,'execute') then
      raise exception 'Grant de função incorreto: %', f; end if;
    if not exists(select 1 from pg_proc where oid = f and prosecdef and 'search_path=""' = any(proconfig)) then
      raise exception 'Função sem search_path fixo/security definer: %', f; end if;
  end loop;
  if has_table_privilege('anon','public.trocas_contexto','select')
    or has_table_privilege('authenticated','public.trocas_contexto','insert,update,delete')
    or has_table_privilege('authenticated','public.membros_organizacao','insert,update,delete') then
    raise exception 'Privilégios de tabela excessivos'; end if;
  if not exists(select 1 from pg_class where oid = 'public.trocas_contexto'::regclass and relrowsecurity) then
    raise exception 'RLS desativada'; end if;
end $$;
rollback;
select 'B01: inclusão neutra por e-mail, papéis, isolamento, contexto auditado e reenvio do titular OK; teste revertido' as resultado;
