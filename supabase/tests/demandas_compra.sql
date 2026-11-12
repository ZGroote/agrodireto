begin;

update agrodireto_privado.seguranca_equipe set exige_mfa = false where unica;

insert into auth.users (id, aud, role, email) values
  ('e0300000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'comprador-aprovado@example.invalid'),
  ('e0300000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'comprador-membro@example.invalid'),
  ('e0300000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'comprador-pendente@example.invalid'),
  ('e0300000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'produtor-aprovado@example.invalid'),
  ('e0300000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'produtor-pendente@example.invalid'),
  ('e0300000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'equipe-e03@example.invalid');

insert into public.equipe_agrodireto (usuario_id, papel) values
  ('e0300000-0000-4000-8000-000000000006', 'geral');

insert into public.catalogo_culturas (id, nome, segmento, unidades, ativo) values
  ('e0300000-0000-4000-8000-0000000000c1', 'Tomate E03', 'hortifruti', array['kg', 'cx'], true),
  ('e0300000-0000-4000-8000-0000000000c2', 'Soja E03', 'graos', array['kg', 't', 'sc'], true),
  ('e0300000-0000-4000-8000-0000000000c3', 'Inativa E03', 'graos', array['t'], false);

set local role authenticated;

-- Comprador 1 cria empresa A e inclui membro
select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000001","aal":"aal1"}', true);
select set_config('teste.org_a', public.enviar_cadastro_comprador(
  'Atacado Paulista', '11.222.333/0001-81', 'Carlos', '(11) 98888-7777', 'Campinas', 'SP', 'Av. Brasil, 500'
)::text, true);
select public.incluir_membro(current_setting('teste.org_a')::uuid, 'comprador-membro@example.invalid');

-- Comprador 3 cria empresa B (fica em_analise)
select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000003","aal":"aal1"}', true);
select set_config('teste.org_b', public.enviar_cadastro_comprador(
  'Mercado Pendente', '12.ABC.345/01DE-35', 'Bia', '(11) 97777-6666', 'Santos', 'SP', 'Rua do Porto, 10'
)::text, true);

-- Comprador 1 também é membro da empresa B (em análise)
select public.incluir_membro(current_setting('teste.org_b')::uuid, 'comprador-aprovado@example.invalid');

-- Produtor 4 cria propriedade aprovada; Produtor 5 cria propriedade em análise
select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000004","aal":"aal1"}', true);
select set_config('teste.prop_ok', public.enviar_propriedade('Sítio Sol', 'Ibiúna', 'SP', 12, 'Tomate')::text, true);

select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000005","aal":"aal1"}', true);
select set_config('teste.prop_pend', public.enviar_propriedade('Sítio Lua', 'Bauru', 'SP', 8, 'Soja')::text, true);

-- Equipe aprova apenas empresa A e propriedade do produtor 4
select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000006","aal":"aal2"}', true);
select public.revisar_cadastro_comprador(organizacao_id, enviada_em, null)
  from public.cadastros_comprador where organizacao_id = current_setting('teste.org_a')::uuid;
select public.aprovar_propriedade(current_setting('teste.prop_ok')::uuid);

-- Comprador 1 tenta publicar pela empresa B (em análise, mesmo sendo titular da A aprovada): deve falhar PT403
select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000001","aal":"aal1"}', true);
do $$
declare
  org_a uuid := current_setting('teste.org_a')::uuid;
  org_b uuid := current_setting('teste.org_b')::uuid;
  c_tomate uuid := 'e0300000-0000-4000-8000-0000000000c1';
  c_soja uuid := 'e0300000-0000-4000-8000-0000000000c2';
  c_inativa uuid := 'e0300000-0000-4000-8000-0000000000c3';
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  dem_id uuid;
  r public.demandas_compra;
begin
  -- Empresa B não aprovada é recusada mesmo para usuário que tem outra empresa aprovada
  begin
    perform public.salvar_demanda_compra(null, org_b, c_tomate, 100, 'kg', hoje + 7, 'SP', 'Teste');
    raise exception 'Aceitou empresa compradora em análise';
  exception when sqlstate 'PT403' then null;
  end;

  -- Validações de UF, prazo, cultura e unidade
  begin
    perform public.salvar_demanda_compra(null, org_a, c_tomate, 100, 'kg', hoje + 7, 'PR', 'Fora de SP');
    raise exception 'Aceitou UF fora de SP';
  exception when sqlstate 'PT422' then null;
  end;

  begin
    perform public.salvar_demanda_compra(null, org_a, c_tomate, 100, 'kg', hoje - 1, 'SP', 'Prazo vencido');
    raise exception 'Aceitou prazo no passado';
  exception when sqlstate 'PT422' then null;
  end;

  begin
    perform public.salvar_demanda_compra(null, org_a, c_inativa, 10, 't', hoje + 5, 'SP', '');
    raise exception 'Aceitou cultura inativa';
  exception when sqlstate 'PT422' then null;
  end;

  begin
    perform public.salvar_demanda_compra(null, org_a, c_tomate, 10, 't', hoje + 5, 'SP', '');
    raise exception 'Aceitou unidade incompatível com a cultura';
  exception when sqlstate 'PT422' then null;
  end;

  begin
    perform public.salvar_demanda_compra(null, org_a, c_tomate, 0, 'kg', hoje + 5, 'SP', '');
    raise exception 'Aceitou quantidade zero';
  exception when check_violation then null;
  end;

  -- Publicação válida na empresa A
  dem_id := public.salvar_demanda_compra(null, org_a, c_tomate, 500, 'cx', hoje + 10, 'sp', '  Caixas plásticas 20kg  ');
  Perform set_config('teste.dem_id', dem_id::text, true);

  select * into r from public.demandas_compra where id = dem_id;
  if r.organizacao_id <> org_a or r.catalogo_id <> c_tomate or r.quantidade <> 500 or r.unidade <> 'cx'
     or r.uf <> 'SP' or r.observacao <> 'Caixas plásticas 20kg' or r.status <> 'aberta'
     or r.criado_por <> auth.uid() then
    raise exception 'Demanda não persistiu corretamente';
  end if;

  -- Escrita direta negada
  begin
    insert into public.demandas_compra (organizacao_id, catalogo_id, quantidade, unidade, prazo, criado_por, atualizado_por)
    values (org_a, c_tomate, 10, 'kg', hoje + 1, auth.uid(), auth.uid());
    raise exception 'Inserção direta permitida';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Membro da empresa A lê e edita a demanda da empresa A
select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000002","aal":"aal1"}', true);
do $$
declare
  org_a uuid := current_setting('teste.org_a')::uuid;
  dem_id uuid := current_setting('teste.dem_id')::uuid;
  c_soja uuid := 'e0300000-0000-4000-8000-0000000000c2';
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if (select count(*) from public.demandas_compra where organizacao_id = org_a) <> 1 then
    raise exception 'Membro da empresa compradora não leu a demanda';
  end if;
  if public.salvar_demanda_compra(dem_id, org_a, c_soja, 25, 'sc', hoje + 15, 'SP', 'Grão tipo 1') <> dem_id then
    raise exception 'Edição não manteve o ID da demanda';
  end if;
  if (select unidade from public.demandas_compra where id = dem_id) <> 'sc'
     or (select atualizado_por from public.demandas_compra where id = dem_id) <> auth.uid() then
    raise exception 'Edição não atualizou os campos';
  end if;
end $$;

-- Terceiro (comprador 3) não lê nem edita nem encerra demanda da empresa A
select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000003","aal":"aal1"}', true);
do $$
declare
  org_a uuid := current_setting('teste.org_a')::uuid;
  dem_id uuid := current_setting('teste.dem_id')::uuid;
  c_soja uuid := 'e0300000-0000-4000-8000-0000000000c2';
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if (select count(*) from public.demandas_compra) <> 0 then
    raise exception 'Outra empresa leu demandas da empresa A';
  end if;
  begin
    perform public.salvar_demanda_compra(dem_id, org_a, c_soja, 10, 't', hoje + 5, 'SP', 'Invasão');
    raise exception 'Outra empresa editou demanda alheia';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.encerrar_demanda_compra(dem_id, org_a);
    raise exception 'Outra empresa encerrou demanda alheia';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Produtor pendente (5) não acessa listar_demandas_abertas; Produtor aprovado (4) lista demandas abertas
select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000005","aal":"aal1"}', true);
do $$
begin
  begin
    perform public.listar_demandas_abertas('', 0);
    raise exception 'Produtor sem propriedade aprovada listou demandas';
  exception when sqlstate 'PT403' then null;
  end;
end $$;

select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000004","aal":"aal1"}', true);
do $$
declare
  dem_id uuid := current_setting('teste.dem_id')::uuid;
begin
  if (select count(*) from public.demandas_compra) <> 0 then
    raise exception 'Produtor leu tabela direta demandas_compra sem passar pela RPC';
  end if;
  if not exists (
    select 1 from public.listar_demandas_abertas('Soja E03', 0)
     where id = dem_id and comprador = 'Atacado Paulista' and uf = 'SP' and quantidade = 25 and unidade = 'sc'
  ) then
    raise exception 'Produtor aprovado não encontrou a demanda aberta';
  end if;
end $$;

-- Encerrar demanda remove da listagem do produtor e bloqueia nova edição
select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000001","aal":"aal1"}', true);
do $$
declare
  org_a uuid := current_setting('teste.org_a')::uuid;
  dem_id uuid := current_setting('teste.dem_id')::uuid;
  c_soja uuid := 'e0300000-0000-4000-8000-0000000000c2';
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  perform public.encerrar_demanda_compra(dem_id, org_a);
  if (select status from public.demandas_compra where id = dem_id) <> 'encerrada' then
    raise exception 'Demanda não foi encerrada';
  end if;
  begin
    perform public.salvar_demanda_compra(dem_id, org_a, c_soja, 30, 't', hoje + 15, 'SP', 'Reabrir');
    raise exception 'Editou demanda encerrada';
  exception when sqlstate 'PT404' then null;
  end;
end $$;

select set_config('request.jwt.claims', '{"sub":"e0300000-0000-4000-8000-000000000004","aal":"aal1"}', true);
do $$
declare
  dem_id uuid := current_setting('teste.dem_id')::uuid;
begin
  if exists (select 1 from public.listar_demandas_abertas('', 0) where id = dem_id) then
    raise exception 'Demanda encerrada continuou visível ao produtor';
  end if;
end $$;

reset role;
do $$
begin
  if has_table_privilege('anon', 'public.demandas_compra', 'select')
     or has_function_privilege('anon', 'public.salvar_demanda_compra(uuid,uuid,uuid,numeric,text,date,text,text)', 'execute')
     or has_function_privilege('anon', 'public.encerrar_demanda_compra(uuid,uuid)', 'execute')
     or has_function_privilege('anon', 'public.listar_demandas_abertas(text,integer)', 'execute') then
    raise exception 'Privilégio indevido para anon';
  end if;
end $$;

rollback;
select 'E03 demandas_compra: publicação, edição, encerramento, empresa explícita aprovada, unidade do catálogo, UF SP, RLS e leitura do produtor OK; dados revertidos' as resultado;
