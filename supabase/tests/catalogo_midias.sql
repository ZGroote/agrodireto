-- D08: o comprador vê só foto/vídeo do lote aprovado pela equipe e autorizado pelo produtor, com a oferta vigente.
-- Pendente, rejeitada, não autorizada (ou revogada), oferta retirada ou vencida não vazam. Tudo desfeito no rollback.
begin;
insert into auth.users (id, aud, role, email) values
 ('55000000-0000-0000-0000-000000000001','authenticated','authenticated','cat-produtor@example.invalid'),
 ('55000000-0000-0000-0000-000000000002','authenticated','authenticated','cat-comprador@example.invalid'),
 ('55000000-0000-0000-0000-000000000003','authenticated','authenticated','cat-outro@example.invalid'),
 ('55000000-0000-0000-0000-000000000004','authenticated','authenticated','cat-cadastral@example.invalid'),
 ('55000000-0000-0000-0000-000000000005','authenticated','authenticated','cat-comercial@example.invalid');
insert into public.equipe_agrodireto (usuario_id, papel) values
 ('55000000-0000-0000-0000-000000000004','cadastral'),
 ('55000000-0000-0000-0000-000000000005','comercial');
insert into agrodireto_privado.compradores_catalogo values ('55000000-0000-0000-0000-000000000002');
update agrodireto_privado.catalogo_homologacao set habilitado = true where unica;
insert into public.organizacoes (id, nome) values ('55000000-0000-0000-0000-000000000010','Organização catálogo');
insert into public.membros_organizacao (organizacao_id, usuario_id, papel)
values ('55000000-0000-0000-0000-000000000010','55000000-0000-0000-0000-000000000001','titular');
insert into public.propriedades (id, usuario_id, organizacao_id, nome, cidade, uf, area, culturas, status)
values ('55000000-0000-0000-0000-000000000020','55000000-0000-0000-0000-000000000001','55000000-0000-0000-0000-000000000010',
        'Fazenda catálogo','Cidade teste','SP',1,'Tomate','aprovada');
insert into public.ofertas_lote
  (id, produtor_id, propriedade_id, rascunho_id, produto, quantidade, unidade, preco_centavos,
   retirada_inicio, retirada_fim, validade, padrao, calibre, embalagem, condicoes, retirada_em) values
 ('55000000-0000-0000-0000-000000000030','55000000-0000-0000-0000-000000000001','55000000-0000-0000-0000-000000000020',
  'cat-vigente','Tomate',1,'kg',100,current_date,current_date+2,current_date+2,'','','','', null),
 ('55000000-0000-0000-0000-000000000031','55000000-0000-0000-0000-000000000001','55000000-0000-0000-0000-000000000020',
  'cat-retirada','Tomate',1,'kg',100,current_date,current_date+2,current_date+2,'','','','', now());

-- O = oferta vigente, R = retirada. Caminhos: produtor/lote/chave.ext (original) e lote/chave.ext (cópia).
insert into public.evidencias_lote
  (lote_id, chave, arquivo, tipo, enviada_em, solicitada_em, revisao, motivo_rejeicao, autorizada_catalogo, copia_catalogo)
select l::uuid, c, '55000000-0000-0000-0000-000000000001/' || l || '/' || c || o, t, now(), now(), r, m, a,
       case when cp then l || '/' || c || case t when 'foto' then '.webp' else '.mp4' end end
  from (values
    ('55000000-0000-0000-0000-000000000030','f-ok','.jpg','foto','aprovada',null,true,true),
    ('55000000-0000-0000-0000-000000000030','v-ok','.mov','video','aprovada',null,true,true),
    ('55000000-0000-0000-0000-000000000030','f-pend','.jpg','foto',null,null,false,false),
    ('55000000-0000-0000-0000-000000000030','v-pend','.mp4','video',null,null,false,false),
    ('55000000-0000-0000-0000-000000000030','f-rej','.jpg','foto','rejeitada','Imagem de outro lote',false,false),
    ('55000000-0000-0000-0000-000000000030','f-priv','.jpg','foto','aprovada',null,false,true),
    ('55000000-0000-0000-0000-000000000031','f-ret','.jpg','foto','aprovada',null,true,true)
  ) as v(l, c, o, t, r, m, a, cp);
insert into storage.objects (bucket_id, name, metadata)
select 'fotos-catalogo', copia_catalogo, '{"size":100}' from public.evidencias_lote
 where copia_catalogo is not null and lote_id in ('55000000-0000-0000-0000-000000000030','55000000-0000-0000-0000-000000000031');

do $$
begin
  -- Permissões recriadas de listar_fotos_catalogo iguais às de antes: só authenticated executa.
  if has_function_privilege('anon','public.listar_fotos_catalogo(uuid)','execute')
     or not has_function_privilege('authenticated','public.listar_fotos_catalogo(uuid)','execute')
     or exists (select 1 from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                 where p.oid = 'public.listar_fotos_catalogo(uuid)'::regprocedure and a.grantee = 0) then
    raise exception 'Permissões de listar_fotos_catalogo mudaram';
  end if;
  if not (select 'video/mp4' = any (allowed_mime_types) and 'image/webp' = any (allowed_mime_types) and not public
            from storage.buckets where id = 'fotos-catalogo') then
    raise exception 'Bucket fotos-catalogo não aceita vídeo ou ficou público';
  end if;
  -- Cópia de vídeo só .mp4; de foto só .webp.
  begin
    update public.evidencias_lote set copia_catalogo = lote_id || '/' || chave || '.webp' where chave = 'v-ok';
    raise exception 'Vídeo aceitou cópia .webp';
  exception when check_violation then null; end;
  begin
    update public.evidencias_lote set copia_catalogo = lote_id || '/' || chave || '.mp4' where chave = 'f-ok';
    raise exception 'Foto aceitou cópia .mp4';
  exception when check_violation then null; end;
end $$;

set local role authenticated;
do $$
declare o uuid := '55000000-0000-0000-0000-000000000030'; vistos text;
begin
  -- Comprador autorizado: só a foto e o vídeo aprovados e autorizados, com o tipo.
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
  select string_agg(tipo || ':' || arquivo, ',' order by arquivo) into vistos from public.listar_fotos_catalogo(o);
  if vistos is distinct from 'foto:' || o || '/f-ok.webp,video:' || o || '/v-ok.mp4' then
    raise exception 'Comprador viu: %', vistos;
  end if;
  if (select count(*) from storage.objects where bucket_id = 'fotos-catalogo' and name like '55000000-%') <> 2 then
    raise exception 'Comprador leu objeto fora do permitido';
  end if;
  if exists (select from public.listar_fotos_catalogo('55000000-0000-0000-0000-000000000031')) then
    raise exception 'Oferta retirada exibiu mídia';
  end if;

  -- Usuário sem cadastro de comprador não vê nada.
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000003","aal":"aal1"}',true);
  if exists (select from public.listar_fotos_catalogo(o))
     or exists (select from storage.objects where bucket_id = 'fotos-catalogo' and name like '55000000-%') then
    raise exception 'Não comprador viu o catálogo';
  end if;

  -- Produtor: vídeo agora é autorizável; pendente não; revogar tira do comprador.
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000001","aal":"aal1"}',true);
  begin perform public.autorizar_foto_catalogo(o, 'v-pend', true); raise exception 'Vídeo pendente autorizado';
  exception when sqlstate 'PT409' then null; end;
  begin perform public.autorizar_foto_catalogo(o, 'f-rej', true); raise exception 'Foto rejeitada autorizada';
  exception when sqlstate 'PT409' then null; end;
  perform public.autorizar_foto_catalogo(o, 'v-ok', false);
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
  if exists (select from public.listar_fotos_catalogo(o) where tipo = 'video')
     or exists (select from storage.objects where bucket_id = 'fotos-catalogo' and name = o || '/v-ok.mp4') then
    raise exception 'Vídeo revogado continuou visível';
  end if;
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000001","aal":"aal1"}',true);
  perform public.autorizar_foto_catalogo(o, 'v-ok', true);
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
  if not exists (select from public.listar_fotos_catalogo(o) where tipo = 'video') then
    raise exception 'Vídeo autorizado de novo não voltou';
  end if;

  -- Equipe: comercial não revisa; cadastral (revisar_ofertas) rejeita, e a rejeitada não aparece.
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000005","aal":"aal2"}',true);
  begin perform public.revisar_evidencia_lote(o, 'v-pend', true, null); raise exception 'Comercial revisou evidência';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000004","aal":"aal2"}',true);
  if not exists (select from public.listar_evidencias_pendentes() where chave = 'v-pend') then
    raise exception 'Vídeo pendente fora da fila da equipe';
  end if;
  perform public.revisar_evidencia_lote(o, 'v-pend', false, 'Vídeo de outra área');
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
  if exists (select from public.listar_fotos_catalogo(o) where arquivo like '%pend%') then
    raise exception 'Mídia pendente ou rejeitada apareceu';
  end if;
end $$;

-- Oferta vencida some do catálogo.
reset role;
update public.ofertas_lote set retirada_inicio = current_date - 3, retirada_fim = current_date - 1, validade = current_date - 1
 where id = '55000000-0000-0000-0000-000000000030';
set local role authenticated;
do $$
begin
  perform set_config('request.jwt.claims','{"sub":"55000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
  if exists (select from public.listar_fotos_catalogo('55000000-0000-0000-0000-000000000030'))
     or exists (select from storage.objects where bucket_id = 'fotos-catalogo' and name like '55000000-%') then
    raise exception 'Oferta vencida continuou exibindo mídia';
  end if;
end $$;

reset role;
do $$
begin
  if has_function_privilege('anon','public.autorizar_foto_catalogo(uuid,text,boolean)','execute') then
    raise exception 'anon pode autorizar mídia';
  end if;
end $$;
rollback;
select 'Catálogo de mídias: foto e vídeo aprovados e autorizados; pendente, rejeitada, revogada, retirada e vencida não vazam' as resultado;
