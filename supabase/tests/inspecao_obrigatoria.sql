begin;
-- E00: 1º lote da organização, valor > R$ 20.000 ou pecuária exigem inspeção aprovada para o catálogo; demais, declarado.
update agrodireto_privado.catalogo_homologacao set habilitado = true where unica;
insert into auth.users (id, aud, role, email) values
 ('54000000-0000-0000-0000-000000000001','authenticated','authenticated','e00-produtor@example.invalid'),
 ('54000000-0000-0000-0000-000000000002','authenticated','authenticated','e00-comprador@example.invalid'),
 ('54000000-0000-0000-0000-000000000003','authenticated','authenticated','e00-equipe@example.invalid');
insert into public.equipe_agrodireto (usuario_id, papel) values ('54000000-0000-0000-0000-000000000003', 'cadastral');
insert into agrodireto_privado.compradores_catalogo values ('54000000-0000-0000-0000-000000000002');
insert into public.organizacoes (id, nome, tipo) values ('54000000-0000-0000-0000-000000000020', 'Fazenda E00', 'produtor');
insert into public.membros_organizacao (organizacao_id, usuario_id, papel)
values ('54000000-0000-0000-0000-000000000020', '54000000-0000-0000-0000-000000000001', 'titular');
insert into public.propriedades (id, organizacao_id, usuario_id, nome, cidade, uf, area, culturas, status)
values ('54000000-0000-0000-0000-000000000021', '54000000-0000-0000-0000-000000000020',
        '54000000-0000-0000-0000-000000000001', 'Sítio E00', 'Ibiúna', 'SP', 1, 'Tomate', 'aprovada');
insert into public.catalogo_culturas (nome, segmento, unidades) values ('Queijo E00 teste', 'pecuaria', array['kg']);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000001","aal":"aal1"}',true);
do $$
declare primeiro uuid; declarado uuid; caro uuid; limite uuid; pecuaria uuid;
begin
 -- p_quantidade x p_preco_centavos; R$ 20.000 = 2.000.000 centavos.
 primeiro := public.publicar_oferta_lote('e00-a','Tomate',10,'kg',100,null,current_date,current_date+2,current_date+2,'','','','');
 declarado := public.publicar_oferta_lote('e00-b','Tomate',10,'kg',100,null,current_date,current_date+2,current_date+2,'','','','');
 caro := public.publicar_oferta_lote('e00-c','Tomate',100,'kg',20001,null,current_date,current_date+2,current_date+2,'','','','');
 limite := public.publicar_oferta_lote('e00-d','Tomate',100,'kg',20000,null,current_date,current_date+2,current_date+2,'','','','');
 pecuaria := public.publicar_oferta_lote('e00-e',' queijo e00 TESTE ',1,'kg',100,null,current_date,current_date+2,current_date+2,'','','','');
 if (select verificacao from public.ofertas_lote where id = primeiro) <> 'inspecao_obrigatoria' then raise exception '1º lote não exigiu inspeção'; end if;
 if (select verificacao from public.ofertas_lote where id = declarado) <> 'declarado' then raise exception 'Lote comum não ficou declarado'; end if;
 if (select verificacao from public.ofertas_lote where id = caro) <> 'inspecao_obrigatoria' then raise exception 'Lote acima de R$ 20.000 não exigiu inspeção'; end if;
 if (select verificacao from public.ofertas_lote where id = limite) <> 'declarado' then raise exception 'Exatamente R$ 20.000 exigiu inspeção'; end if;
 if (select verificacao from public.ofertas_lote where id = pecuaria) <> 'inspecao_obrigatoria' then raise exception 'Pecuária não exigiu inspeção'; end if;
 -- Republicar o mesmo rascunho devolve o mesmo lote e não muda a marcação.
 if public.publicar_oferta_lote('e00-a','Tomate',10,'kg',100,null,current_date,current_date+2,current_date+2,'','','','') <> primeiro
    or (select count(*) from public.ofertas_lote where rascunho_id = 'e00-a') <> 1 then raise exception 'Republicação duplicou'; end if;
 perform set_config('teste.primeiro', primeiro::text, true);
 perform set_config('teste.declarado', declarado::text, true);
 perform set_config('teste.caro', caro::text, true);
 perform set_config('teste.limite', limite::text, true);
 perform set_config('teste.pecuaria', pecuaria::text, true);
 -- O produtor não muda a marcação direto.
 begin update public.ofertas_lote set verificacao = 'declarado' where id = primeiro; raise exception 'Produtor alterou a verificação'; exception when insufficient_privilege then null; end;
end $$;

-- Comprador: só os declarados aparecem antes da inspeção.
select set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
do $$
declare vistos uuid[];
begin
 select array_agg(c.id order by c.id) into vistos from (
   select id from public.consultar_catalogo(null, '', 0) union all select id from public.consultar_catalogo(null, 'queijo', 0)) c
  where c.id = any(array[current_setting('teste.primeiro'), current_setting('teste.declarado'), current_setting('teste.caro'),
                         current_setting('teste.limite'), current_setting('teste.pecuaria')]::uuid[]);
 if vistos is distinct from (select array_agg(x order by x) from unnest(array[current_setting('teste.declarado'), current_setting('teste.limite')]::uuid[]) x) then
  raise exception 'Catálogo antes da inspeção fora do esperado: %', vistos;
 end if;
 if exists (select 1 from public.consultar_catalogo(current_setting('teste.primeiro')::uuid, '', 0)) then raise exception 'Lote sem inspeção visível por id'; end if;
end $$;

-- Equipe inspeciona: aprovado libera; ressalvas não libera.
select set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000003","aal":"aal2"}',true);
select public.concluir_inspecao_lote(current_setting('teste.primeiro')::uuid, true, true, null, 'aprovado');
select public.concluir_inspecao_lote(current_setting('teste.caro')::uuid, true, true, null, 'ressalvas');

select set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
do $$
begin
 if not exists (select 1 from public.consultar_catalogo(current_setting('teste.primeiro')::uuid, '', 0)) then raise exception 'Inspeção aprovada não liberou o lote'; end if;
 if exists (select 1 from public.consultar_catalogo(current_setting('teste.caro')::uuid, '', 0)) then raise exception 'Inspeção com ressalvas liberou o lote'; end if;
 if exists (select 1 from public.consultar_catalogo(current_setting('teste.pecuaria')::uuid, '', 0)) then raise exception 'Pecuária sem inspeção visível'; end if;
 if not exists (select 1 from public.consultar_catalogo(current_setting('teste.declarado')::uuid, '', 0)) then raise exception 'Declarado sumiu'; end if;
end $$;

reset role;
do $$
begin
 if exists (select 1 from public.ofertas_lote where verificacao not in ('declarado', 'inspecao_obrigatoria')) then raise exception 'Valor de verificação inválido'; end if;
end $$;
rollback;
select 'Inspeção obrigatória (1º lote, > R$ 20.000, pecuária), declarado e filtro do catálogo OK; dados de teste revertidos' as resultado;
