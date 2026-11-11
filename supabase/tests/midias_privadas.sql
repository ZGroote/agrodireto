-- D03: reserva, envio, confirmação, cota e visibilidade do bucket privado `midias`. Tudo é desfeito no rollback.
-- A cota sob concorrência real (duas conexões) depende do pg_advisory_xact_lock e não cabe numa transação só.
begin;
insert into auth.users (id, aud, role, email) values
 ('54000000-0000-0000-0000-000000000001','authenticated','authenticated','midia-titular@example.invalid'),
 ('54000000-0000-0000-0000-000000000002','authenticated','authenticated','midia-membro@example.invalid'),
 ('54000000-0000-0000-0000-000000000003','authenticated','authenticated','midia-comprador@example.invalid'),
 ('54000000-0000-0000-0000-000000000004','authenticated','authenticated','midia-equipe@example.invalid');
insert into public.equipe_agrodireto values ('54000000-0000-0000-0000-000000000004');
insert into agrodireto_privado.compradores_catalogo values ('54000000-0000-0000-0000-000000000003');
insert into public.organizacoes (id, nome) values
 ('54000000-0000-0000-0000-000000000010','Organização mídia'),
 ('54000000-0000-0000-0000-000000000011','Outra organização');
insert into public.membros_organizacao (organizacao_id, usuario_id, papel) values
 ('54000000-0000-0000-0000-000000000010','54000000-0000-0000-0000-000000000001','titular'),
 ('54000000-0000-0000-0000-000000000010','54000000-0000-0000-0000-000000000002','membro'),
 ('54000000-0000-0000-0000-000000000011','54000000-0000-0000-0000-000000000003','titular');
insert into public.propriedades (id, usuario_id, organizacao_id, nome, cidade, uf, area, culturas, status) values
 ('54000000-0000-0000-0000-000000000020','54000000-0000-0000-0000-000000000001','54000000-0000-0000-0000-000000000010',
  'Fazenda mídia','Cidade teste','SP',1,'Tomate','aprovada'),
 ('54000000-0000-0000-0000-000000000021','54000000-0000-0000-0000-000000000003','54000000-0000-0000-0000-000000000011',
  'Fazenda alheia','Cidade teste','SP',1,'Tomate','aprovada');
insert into public.ofertas_lote
  (id, produtor_id, propriedade_id, rascunho_id, produto, quantidade, unidade, preco_centavos,
   retirada_inicio, retirada_fim, validade, padrao, calibre, embalagem, condicoes, retirada_em) values
 ('54000000-0000-0000-0000-000000000030','54000000-0000-0000-0000-000000000001','54000000-0000-0000-0000-000000000020',
  'teste-midia','Tomate',1,'kg',100,current_date,current_date+2,current_date+2,'','','','', null),
 ('54000000-0000-0000-0000-000000000031','54000000-0000-0000-0000-000000000001','54000000-0000-0000-0000-000000000020',
  'teste-midia-retirada','Tomate',1,'kg',100,current_date,current_date+2,current_date+2,'','','','', now());

do $$
begin
  if has_function_privilege('anon','public.reservar_midia(uuid,uuid,text,text)','execute')
     or has_function_privilege('anon','public.confirmar_midia(text)','execute') then
    raise exception 'anon pode reservar ou confirmar mídia';
  end if;
  if (select public or file_size_limit is distinct from 52428800 from storage.buckets where id = 'midias') then
    raise exception 'Bucket midias público ou sem limite de tamanho';
  end if;
end $$;

-- Reserva: caminho gerado no servidor, idempotente pela chave, formato e escopo validados.
set local role authenticated;
do $$
declare c text; prop uuid := '54000000-0000-0000-0000-000000000020';
begin
  perform set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000001","aal":"aal1"}',true);
  c := public.reservar_midia(null, prop, 'foto-1', 'JPG');
  if c <> '54000000-0000-0000-0000-000000000010/propriedade/54000000-0000-0000-0000-000000000020/foto-1.jpg' then
    raise exception 'Caminho inesperado: %', c;
  end if;
  if public.reservar_midia(null, prop, 'foto-1', 'jpg') <> c then raise exception 'Reserva repetida mudou o caminho'; end if;
  if (select count(*) from public.midias where propriedade_id = prop) <> 1 then raise exception 'Reserva repetida duplicou'; end if;
  begin perform public.reservar_midia(null, prop, 'foto-1', 'png'); raise exception 'Chave reutilizada com outro formato';
  exception when sqlstate 'PT409' then null; end;
  begin perform public.reservar_midia(null, prop, 'foto-x', 'exe'); raise exception 'Formato não aceito foi reservado';
  exception when sqlstate 'PT422' then null; end;
  begin perform public.reservar_midia(null, prop, 'Foto X', 'jpg'); raise exception 'Chave inválida foi aceita';
  exception when sqlstate 'PT422' then null; end;
  begin perform public.reservar_midia(null, null, 'foto-x', 'jpg'); raise exception 'Mídia sem escopo foi aceita';
  exception when sqlstate 'PT422' then null; end;
  begin perform public.reservar_midia('54000000-0000-0000-0000-000000000030', prop, 'foto-x', 'jpg');
    raise exception 'Mídia com dois escopos foi aceita';
  exception when sqlstate 'PT422' then null; end;

  c := public.reservar_midia('54000000-0000-0000-0000-000000000030', null, 'video-1', 'mov');
  if c not like '%/lote/54000000-0000-0000-0000-000000000030/video-1.mov'
     or (select tipo from public.midias where arquivo = c) <> 'video' then
    raise exception 'Reserva no lote errada: %', c;
  end if;
  begin perform public.reservar_midia('54000000-0000-0000-0000-000000000031', null, 'video-2', 'mp4');
    raise exception 'Reservou em lote retirado';
  exception when sqlstate 'PT403' then null; end;

  perform public.reservar_midia(null, prop, 'foto-2', 'jpg');
  perform public.reservar_midia(null, prop, 'foto-grande', 'jpg');

  -- Terceiro (outra organização, comprador) não reserva nem em propriedade nem em lote alheio.
  perform set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000003","aal":"aal1"}',true);
  begin perform public.reservar_midia(null, prop, 'intrusa', 'jpg'); raise exception 'Terceiro reservou na propriedade';
  exception when sqlstate 'PT403' then null; end;
  begin perform public.reservar_midia('54000000-0000-0000-0000-000000000030', null, 'intrusa', 'jpg');
    raise exception 'Terceiro reservou no lote';
  exception when sqlstate 'PT403' then null; end;
end $$;

-- Envio ao Storage: só o autor, só no caminho reservado e ainda não enviado.
do $$
declare base text := '54000000-0000-0000-0000-000000000010/propriedade/54000000-0000-0000-0000-000000000020/';
begin
  perform set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000003","aal":"aal1"}',true);
  begin
    insert into storage.objects (bucket_id, name, metadata) values ('midias', base || 'foto-2.jpg', '{"size":1000}');
    raise exception 'Terceiro enviou arquivo no caminho reservado';
  exception when insufficient_privilege then null; end;
  begin perform public.confirmar_midia(base || 'foto-1.jpg'); raise exception 'Terceiro confirmou mídia alheia';
  exception when sqlstate 'PT409' then null; end;

  perform set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000001","aal":"aal1"}',true);
  begin
    insert into storage.objects (bucket_id, name, metadata) values ('midias', base || 'sem-reserva.jpg', '{"size":1000}');
    raise exception 'Envio sem reserva foi aceito';
  exception when insufficient_privilege then null; end;
  begin perform public.confirmar_midia(base || 'foto-1.jpg'); raise exception 'Confirmou sem arquivo no Storage';
  exception when sqlstate 'PT409' then null; end;

  insert into storage.objects (bucket_id, name, metadata) values
    ('midias', base || 'foto-1.jpg', '{"size":1000}'),
    ('midias', base || 'foto-2.jpg', '{"size":2000}'),
    ('midias', base || 'foto-grande.jpg', '{"size":20971521}');
  if public.confirmar_midia(base || 'foto-1.jpg') <> 'enviada' or public.confirmar_midia(base || 'foto-1.jpg') <> 'enviada' then
    raise exception 'Confirmação não foi aceita ou não é idempotente';
  end if;
  if public.confirmar_midia(base || 'foto-grande.jpg') <> 'recusada' then raise exception 'Foto acima de 20 MiB aceita'; end if;
  begin perform public.reservar_midia(null, '54000000-0000-0000-0000-000000000020', 'foto-grande', 'jpg');
    raise exception 'Chave recusada foi reservada de novo';
  exception when sqlstate 'PT409' then null; end;
  if not exists (select from public.midias where arquivo = base || 'foto-1.jpg' and enviada_em is not null
                  and tamanho_original_bytes = 1000) then
    raise exception 'Confirmação não gravou envio e tamanho';
  end if;
  if not exists (select from public.midias where arquivo = base || 'foto-grande.jpg' and processamento = 'falhou'
                  and enviada_em is null and motivo_processamento = 'Foto acima de 20 MiB.') then
    raise exception 'Recusa sem registro';
  end if;
  -- Depois de confirmada, o caminho não aceita novo envio.
  perform public.confirmar_midia(base || 'foto-2.jpg');
  begin
    insert into storage.objects (bucket_id, name, metadata) values ('midias', base || 'foto-2.jpg', '{"size":1}');
    raise exception 'Arquivo já enviado foi enviado de novo';
  exception when insufficient_privilege or unique_violation then null; end;
end $$;

-- Escrita direta na tabela continua fechada.
do $$
begin
  begin update public.midias set processamento = 'pronta'; raise exception 'Usuário alterou mídia';
  exception when insufficient_privilege then null; end;
  begin insert into public.midias (autor_id, propriedade_id, tipo, arquivo)
        values ('54000000-0000-0000-0000-000000000001','54000000-0000-0000-0000-000000000020','foto','x.jpg');
    raise exception 'Usuário inseriu mídia direto';
  exception when insufficient_privilege then null; end;
end $$;

-- Fila: o worker só assume mídia confirmada; a reservada sem envio e a recusada ficam de fora.
reset role;
insert into public.midias (autor_id, propriedade_id, tipo, arquivo, chave, enviada_em) values
 ('54000000-0000-0000-0000-000000000001','54000000-0000-0000-0000-000000000020','foto',
  '54000000-0000-0000-0000-000000000010/propriedade/54000000-0000-0000-0000-000000000020/so-reservada.jpg','so-reservada', null);
set local role service_role;
do $$
declare r record; vistas int := 0;
begin
  loop
    select * into r from public.assumir_proxima_midia(3600);
    exit when r.midia_id is null;
    vistas := vistas + 1;
    if r.caminho like '%/so-reservada.jpg' or r.caminho like '%/foto-grande.jpg' then
      raise exception 'Worker assumiu mídia não enviada: %', r.caminho;
    end if;
    exit when vistas > 1000;
  end loop;
  if vistas = 0 then raise exception 'Worker não assumiu a mídia enviada'; end if;
end $$;

-- Cota: 100 fotos por escopo; a recusada não conta; vídeo tem cota própria.
reset role;
insert into public.midias (autor_id, propriedade_id, tipo, arquivo, chave)
select '54000000-0000-0000-0000-000000000001','54000000-0000-0000-0000-000000000020','foto',
       'cota/' || i || '.jpg', 'cota-' || i
  from generate_series(1, 97) i;  -- + foto-1, foto-2 e so-reservada = 100 fotos ativas
set local role authenticated;
do $$
begin
  perform set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
  begin perform public.reservar_midia(null, '54000000-0000-0000-0000-000000000020', 'foto-101', 'jpg');
    raise exception 'A 101ª foto foi reservada';
  exception when sqlstate 'PT422' then null; end;
  -- Membro (não titular) também reserva.
  perform public.reservar_midia(null, '54000000-0000-0000-0000-000000000020', 'video-prop', 'mp4');
end $$;

-- Visibilidade: membro e equipe veem; comprador de outra organização não vê linha nem objeto,
-- nem a mídia recusada nem a pronta.
reset role;
update public.midias set processamento = 'pronta', arquivo_publicado = arquivo || '.webp'
 where chave = 'foto-2';
insert into storage.objects (bucket_id, name, metadata)
select 'midias', arquivo_publicado, '{"size":500}' from public.midias where chave = 'foto-2';
set local role authenticated;
do $$
begin
  perform set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
  if (select count(*) from public.midias where propriedade_id = '54000000-0000-0000-0000-000000000020') < 100 then
    raise exception 'Membro não vê as mídias da organização';
  end if;
  if (select count(*) from storage.objects where bucket_id = 'midias' and name like '54000000-0000-0000-0000-000000000010/%') <> 4 then
    raise exception 'Membro não lê os arquivos da organização';
  end if;

  perform set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000003","aal":"aal1"}',true);
  if exists (select from public.midias where propriedade_id = '54000000-0000-0000-0000-000000000020'
                or lote_id = '54000000-0000-0000-0000-000000000030') then
    raise exception 'Comprador viu mídia alheia';
  end if;
  if exists (select from storage.objects where bucket_id = 'midias' and name like '54000000-0000-0000-0000-000000000010/%') then
    raise exception 'Comprador leu arquivo do bucket midias';
  end if;

  perform set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000004","aal":"aal2"}',true);
  if not exists (select from public.midias where chave = 'foto-grande')
     or not exists (select from storage.objects where bucket_id = 'midias' and name like '%/foto-grande.jpg') then
    raise exception 'Equipe autorizada não vê a mídia';
  end if;
end $$;

-- Quem sai da organização perde o acesso, mesmo sendo autor.
reset role;
delete from public.membros_organizacao
 where organizacao_id = '54000000-0000-0000-0000-000000000010' and usuario_id = '54000000-0000-0000-0000-000000000002';
set local role authenticated;
do $$
begin
  perform set_config('request.jwt.claims','{"sub":"54000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
  if exists (select from public.midias where propriedade_id = '54000000-0000-0000-0000-000000000020')
     or exists (select from storage.objects where bucket_id = 'midias' and name like '54000000-0000-0000-0000-000000000010/%') then
    raise exception 'Ex-membro ainda vê as mídias';
  end if;
  begin perform public.reservar_midia(null, '54000000-0000-0000-0000-000000000020', 'depois', 'jpg');
    raise exception 'Ex-membro reservou';
  exception when sqlstate 'PT403' then null; end;
end $$;
rollback;
select 'Mídias privadas: reserva, envio, confirmação, limite de tamanho, cota, fila e visibilidade verificados' as resultado;
