begin;
update agrodireto_privado.catalogo_homologacao set habilitado = true where unica;
insert into auth.users (id, aud, role, email) values
 ('52000000-0000-0000-0000-000000000001','authenticated','authenticated','inspecao-produtor@example.invalid'),
 ('52000000-0000-0000-0000-000000000002','authenticated','authenticated','inspecao-equipe@example.invalid'),
 ('52000000-0000-0000-0000-000000000003','authenticated','authenticated','inspecao-comprador@example.invalid'),
 ('52000000-0000-0000-0000-000000000004','authenticated','authenticated','inspecao-fora@example.invalid');
insert into public.equipe_agrodireto values ('52000000-0000-0000-0000-000000000002');
insert into agrodireto_privado.compradores_catalogo values ('52000000-0000-0000-0000-000000000003');
insert into public.organizacoes (id,nome) values ('52000000-0000-0000-0000-000000000020','Fazenda teste');
insert into public.propriedades (id,organizacao_id,usuario_id,nome,cidade,uf,area,culturas,status)
values ('52000000-0000-0000-0000-000000000021','52000000-0000-0000-0000-000000000020',
        '52000000-0000-0000-0000-000000000001','Fazenda teste','Cidade teste','SP',1,'Tomate','aprovada');
insert into public.ofertas_lote
  (id,produtor_id,propriedade_id,rascunho_id,produto,quantidade,unidade,preco_centavos,retirada_inicio,retirada_fim,validade,padrao,calibre,embalagem,condicoes)
values ('52000000-0000-0000-0000-000000000010','52000000-0000-0000-0000-000000000001','52000000-0000-0000-0000-000000000021','teste-inspecao',
        'Tomate',1,'kg',100,current_date,current_date+2,current_date+2,'','','','');
insert into public.evidencias_lote (lote_id,chave,arquivo,tipo,enviada_em,revisao)
values ('52000000-0000-0000-0000-000000000010','foto-inspecao','teste-inspecao-foto.jpg','foto',now(),'aprovada');

set local role authenticated;
do $$
declare
  lote constant uuid := '52000000-0000-0000-0000-000000000010';
  produtor constant text := '{"sub":"52000000-0000-0000-0000-000000000001","aal":"aal1"}';
  equipe constant text := '{"sub":"52000000-0000-0000-0000-000000000002","aal":"aal2"}';
  comprador constant text := '{"sub":"52000000-0000-0000-0000-000000000003","aal":"aal1"}';
  visitante constant text := '{"sub":"52000000-0000-0000-0000-000000000004","aal":"aal1"}';
begin
  perform set_config('request.jwt.claims',produtor,true);
  begin
    perform public.concluir_inspecao_lote(lote,true,true,null,'aprovado');
    raise exception 'Produtor concluiu a própria inspeção';
  exception when insufficient_privilege then null;
  end;

  perform set_config('request.jwt.claims',equipe,true);
  if not exists (select from public.listar_lotes_inspecao(lote,0) where resultado is null) then
    raise exception 'Lote não apareceu na fila';
  end if;
  begin
    perform public.concluir_inspecao_lote(lote,true,false,null,'aprovado');
    raise exception 'Aprovação aceitou checklist inconsistente';
  exception when sqlstate 'PT422' then null;
  end;
  perform public.concluir_inspecao_lote(lote,true,false,12.5,'ressalvas');
  if not exists (
    select from public.listar_lotes_inspecao(lote,0)
    where resultado = 'ressalvas' and temperatura = 12.5 and inspecionada_em is not null
      and inspetor_id = auth.uid() and evidencias_aprovadas = array['foto-inspecao']
  ) then raise exception 'Inspeção não foi recuperada integralmente'; end if;
  begin
    perform public.concluir_inspecao_lote(lote,true,true,null,'aprovado');
    raise exception 'Inspeção existente foi sobrescrita';
  exception when sqlstate 'PT409' then null;
  end;

  perform set_config('request.jwt.claims',visitante,true);
  if exists (select from public.ler_resultado_inspecao_lote(lote)) then
    raise exception 'Terceiro viu o resultado';
  end if;
  perform set_config('request.jwt.claims',comprador,true);
  if not exists (select from public.ler_resultado_inspecao_lote(lote) where resultado = 'ressalvas') then
    raise exception 'Comprador não viu o resultado';
  end if;
  perform set_config('request.jwt.claims',produtor,true);
  perform public.retirar_oferta_lote(lote);
  if not exists (select from public.ler_resultado_inspecao_lote(lote) where resultado = 'ressalvas') then
    raise exception 'Produtor perdeu o histórico';
  end if;
  perform set_config('request.jwt.claims',comprador,true);
  if exists (select from public.ler_resultado_inspecao_lote(lote)) then
    raise exception 'Comprador viu inspeção de oferta retirada';
  end if;
end;
$$;
rollback;
select 'Inspeção, autoria, evidências, permissões e retirada verificadas' as resultado;
