-- F01: cotação com empresa compradora explícita e aprovada, oferta vigente em SP, sem duplicar. Tudo desfeito no rollback.
begin;
insert into auth.users (id, aud, role, email) values
 ('66000000-0000-0000-0000-000000000001','authenticated','authenticated','cot-produtor@example.invalid'),
 ('66000000-0000-0000-0000-000000000002','authenticated','authenticated','cot-comprador@example.invalid'),
 ('66000000-0000-0000-0000-000000000003','authenticated','authenticated','cot-terceiro@example.invalid');
insert into public.organizacoes (id, nome, tipo) values
 ('66000000-0000-0000-0000-000000000010','Produtora Cotação','produtor'),
 ('66000000-0000-0000-0000-000000000011','Compradora Aprovada','comprador'),
 ('66000000-0000-0000-0000-000000000012','Compradora Em Análise','comprador'),
 ('66000000-0000-0000-0000-000000000013','Compradora Terceira','comprador');
insert into public.membros_organizacao (organizacao_id, usuario_id, papel) values
 ('66000000-0000-0000-0000-000000000010','66000000-0000-0000-0000-000000000001','titular'),
 ('66000000-0000-0000-0000-000000000011','66000000-0000-0000-0000-000000000002','membro'),
 ('66000000-0000-0000-0000-000000000012','66000000-0000-0000-0000-000000000002','titular'),
 ('66000000-0000-0000-0000-000000000013','66000000-0000-0000-0000-000000000003','titular');
insert into public.cadastros_comprador
  (organizacao_id, enviado_por, razao_social, cnpj, contato_nome, contato_telefone, cidade, uf, endereco_entrega, status) values
 ('66000000-0000-0000-0000-000000000011','66000000-0000-0000-0000-000000000002','Compradora Aprovada','11222333000181','Ana','11988887777','Campinas','SP','Rua A, 100','aprovada'),
 ('66000000-0000-0000-0000-000000000012','66000000-0000-0000-0000-000000000002','Compradora Em Análise','11444777000161','Ana','11988887777','Campinas','SP','Rua B, 200','em_analise'),
 ('66000000-0000-0000-0000-000000000013','66000000-0000-0000-0000-000000000003','Compradora Terceira','12ABC34501DE35','Rui','11977776666','Santos','SP','Rua C, 300','aprovada');
insert into public.propriedades (id, usuario_id, organizacao_id, nome, cidade, uf, area, culturas, status) values
 ('66000000-0000-0000-0000-000000000020','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000010','Sítio SP','Ibiúna','SP',1,'Tomate','aprovada'),
 ('66000000-0000-0000-0000-000000000021','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000010','Sítio PR','Londrina','PR',1,'Tomate','aprovada');
insert into public.ofertas_lote
  (id, produtor_id, propriedade_id, rascunho_id, produto, quantidade, unidade, preco_centavos,
   retirada_inicio, retirada_fim, validade, padrao, calibre, embalagem, condicoes, retirada_em) values
 ('66000000-0000-0000-0000-000000000030','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000020',
  'cot-vigente','Tomate',100,'kg',500,current_date,current_date+10,current_date+10,'','','','', null),
 ('66000000-0000-0000-0000-000000000031','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000020',
  'cot-retirada','Tomate',100,'kg',500,current_date,current_date+10,current_date+10,'','','','', now()),
 ('66000000-0000-0000-0000-000000000032','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000021',
  'cot-pr','Tomate',100,'kg',500,current_date,current_date+10,current_date+10,'','','','', null);
set local role authenticated;

-- Comprador: membro de uma empresa aprovada (11) e titular de uma em análise (12).
select set_config('request.jwt.claims','{"sub":"66000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
select set_config('teste.cot', public.solicitar_cotacao('66000000-0000-0000-0000-000000000011','66000000-0000-0000-0000-000000000030',
  40,' Campinas ','sp', current_date + 5,' Entrega pela manhã ')::text, true);
do $$
declare c uuid := current_setting('teste.cot')::uuid;
        a uuid := '66000000-0000-0000-0000-000000000011'; o uuid := '66000000-0000-0000-0000-000000000030';
begin
 if not exists (select 1 from public.cotacoes where id = c and organizacao_id = a and oferta_id = o
    and produtora_organizacao_id = '66000000-0000-0000-0000-000000000010' and quantidade = 40 and unidade = 'kg'
    and entrega_cidade = 'Campinas' and entrega_uf = 'SP' and mensagem = 'Entrega pela manhã'
    and status = 'solicitada' and solicitada_por = auth.uid()) then raise exception 'Cotação não persistida ou não normalizada'; end if;
 if public.solicitar_cotacao(a, o, 50, 'Campinas', 'SP', current_date + 6, null) <> c
    or (select count(*) from public.cotacoes where oferta_id = o) <> 1 then raise exception 'Nova tentativa duplicou'; end if;
 if (select count(*) from public.listar_cotacoes(a) where id = c and produto = 'Tomate' and fornecedor = 'Produtora Cotação') <> 1 then raise exception 'Comprador não reencontra a cotação'; end if;
 -- Regra DOC 032: vínculo com empresa aprovada não libera a empresa em análise.
 begin perform public.solicitar_cotacao('66000000-0000-0000-0000-000000000012', o, 1, 'Campinas','SP', current_date + 1, null); raise exception 'Empresa em análise cotou';
 exception when insufficient_privilege then null; end;
 begin perform public.solicitar_cotacao('66000000-0000-0000-0000-000000000013', o, 1, 'Campinas','SP', current_date + 1, null); raise exception 'Cotou por empresa alheia';
 exception when insufficient_privilege then null; end;
 begin perform public.solicitar_cotacao(a, o, 101, 'Campinas','SP', current_date + 1, null); raise exception 'Quantidade acima do disponível aceita';
 exception when sqlstate 'PT422' then null; end;
 begin perform public.solicitar_cotacao(a, o, 0, 'Campinas','SP', current_date + 1, null); raise exception 'Quantidade zero aceita';
 exception when sqlstate 'PT422' then null; end;
 begin perform public.solicitar_cotacao(a, o, 1, 'Campinas','SP', current_date - 1, null); raise exception 'Prazo no passado aceito';
 exception when sqlstate 'PT422' then null; end;
 begin perform public.solicitar_cotacao(a, '66000000-0000-0000-0000-000000000031', 1, 'Campinas','SP', current_date + 1, null); raise exception 'Oferta retirada cotada';
 exception when sqlstate 'PT404' then null; end;
 begin perform public.solicitar_cotacao(a, '66000000-0000-0000-0000-000000000032', 1, 'Campinas','SP', current_date + 1, null); raise exception 'Oferta fora de SP cotada';
 exception when sqlstate 'PT422' then null; end;
 begin perform public.solicitar_cotacao(a, '66000000-0000-0000-0000-000000000099', 1, 'Campinas','SP', current_date + 1, null); raise exception 'Oferta inexistente cotada';
 exception when sqlstate 'PT404' then null; end;
 begin perform public.solicitar_cotacao(a, o, 1, 'Belo Horizonte','MG', current_date + 1, null); raise exception 'Entrega fora de SP aceita';
 exception when check_violation then null; end;
 begin insert into public.cotacoes (oferta_id, organizacao_id, produtora_organizacao_id, quantidade, unidade, entrega_cidade, entrega_uf, prazo_entrega)
   values (o, a, '66000000-0000-0000-0000-000000000010', 1, 'kg', 'Campinas', 'SP', current_date); raise exception 'Insert direto permitido';
 exception when insufficient_privilege then null; end;
 begin update public.cotacoes set status = 'respondida'; raise exception 'Update direto permitido';
 exception when insufficient_privilege then null; end;
end $$;

-- Terceiro (outra compradora aprovada): não vê nada.
select set_config('request.jwt.claims','{"sub":"66000000-0000-0000-0000-000000000003","aal":"aal1"}',true);
do $$
begin
 if exists (select 1 from public.cotacoes)
    or exists (select 1 from public.listar_cotacoes('66000000-0000-0000-0000-000000000011'))
    or exists (select 1 from public.listar_cotacoes('66000000-0000-0000-0000-000000000010'))
    or exists (select 1 from public.listar_cotacoes('66000000-0000-0000-0000-000000000013')) then raise exception 'Terceiro viu cotação alheia'; end if;
end $$;

-- Produtor: reencontra a cotação recebida, com o nome da compradora.
select set_config('request.jwt.claims','{"sub":"66000000-0000-0000-0000-000000000001","aal":"aal1"}',true);
do $$
begin
 if not exists (select 1 from public.cotacoes where id = current_setting('teste.cot')::uuid) then raise exception 'Produtor não vê a cotação'; end if;
 if (select count(*) from public.listar_cotacoes('66000000-0000-0000-0000-000000000010')
      where id = current_setting('teste.cot')::uuid and comprador = 'Compradora Aprovada' and quantidade = 40) <> 1 then raise exception 'Produtor não reencontra a cotação'; end if;
 if exists (select 1 from public.listar_cotacoes('66000000-0000-0000-0000-000000000011')) then raise exception 'Produtor listou pela compradora'; end if;
 begin perform public.solicitar_cotacao('66000000-0000-0000-0000-000000000011','66000000-0000-0000-0000-000000000030', 1, 'Campinas','SP', current_date + 1, null); raise exception 'Produtor cotou pela compradora';
 exception when insufficient_privilege then null; end;
end $$;

-- Sem sessão.
select set_config('request.jwt.claims','{}',true);
do $$
begin
 begin perform public.solicitar_cotacao('66000000-0000-0000-0000-000000000011','66000000-0000-0000-0000-000000000030', 1, 'Campinas','SP', current_date + 1, null); raise exception 'Cotou sem sessão';
 exception when insufficient_privilege then null; end;
 if exists (select 1 from public.cotacoes) then raise exception 'Leu sem sessão'; end if;
end $$;
reset role;
do $$
begin
 if has_table_privilege('anon','public.cotacoes','select')
    or has_table_privilege('authenticated','public.cotacoes','insert')
    or has_function_privilege('anon','public.solicitar_cotacao(uuid,uuid,numeric,text,text,date,text)','execute')
    or has_function_privilege('anon','public.listar_cotacoes(uuid)','execute') then raise exception 'Privilégios abertos demais'; end if;
end $$;
rollback;
