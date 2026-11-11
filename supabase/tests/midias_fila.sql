begin;
insert into auth.users (id, aud, role, email) values
 ('53000000-0000-0000-0000-000000000001','authenticated','authenticated','midia-produtor@example.invalid'),
 ('53000000-0000-0000-0000-000000000002','authenticated','authenticated','midia-fora@example.invalid');
insert into public.organizacoes (id, nome) values ('53000000-0000-0000-0000-000000000010','Organização teste mídia');
insert into public.propriedades (id, usuario_id, organizacao_id, nome, cidade, uf, area, culturas)
values ('53000000-0000-0000-0000-000000000020','53000000-0000-0000-0000-000000000001',
        '53000000-0000-0000-0000-000000000010','Fazenda mídia','Cidade teste','SP',1,'Tomate');
insert into public.midias (id, autor_id, propriedade_id, tipo, arquivo, criada_em) values
 ('53000000-0000-0000-0000-0000000000a1','53000000-0000-0000-0000-000000000001','53000000-0000-0000-0000-000000000020',
  'foto','53000000-0000-0000-0000-000000000020/a.jpg', now() - interval '2 minutes'),
 ('53000000-0000-0000-0000-0000000000b2','53000000-0000-0000-0000-000000000001','53000000-0000-0000-0000-000000000020',
  'video','53000000-0000-0000-0000-000000000020/b.mov', now() - interval '1 minute');

do $$
begin
  begin
    insert into public.midias (autor_id, tipo, arquivo)
    values ('53000000-0000-0000-0000-000000000001','foto','sem-escopo.jpg');
    raise exception 'Mídia sem lote nem propriedade foi aceita';
  exception when check_violation then null;
  end;
  begin
    update public.midias set processamento = 'pronta' where id = '53000000-0000-0000-0000-0000000000a1';
    raise exception 'Mídia pronta sem cópia publicada foi aceita';
  exception when check_violation then null;
  end;
  if has_function_privilege('authenticated','public.assumir_proxima_midia(int)','execute')
     or has_function_privilege('anon','public.assumir_proxima_midia(int)','execute') then
    raise exception 'Fila acessível fora do worker';
  end if;
end $$;

set local role service_role;
do $$
declare r record;
begin
  -- Ordem de chegada, uma por chamada; a que está em andamento não é entregue de novo.
  select * into r from public.assumir_proxima_midia(3600);
  if r.midia_id is distinct from '53000000-0000-0000-0000-0000000000a1' or r.tentativa is distinct from 1 or r.caminho is distinct from '53000000-0000-0000-0000-000000000020/a.jpg' then
    raise exception 'Primeira mídia errada: %', r;
  end if;
  select * into r from public.assumir_proxima_midia(3600);
  if r.midia_id is distinct from '53000000-0000-0000-0000-0000000000b2' then raise exception 'Segunda mídia errada: %', r; end if;
  if exists (select from public.assumir_proxima_midia(3600)) then raise exception 'Mídia em andamento entregue de novo'; end if;
end $$;

-- Worker caiu: o prazo da mídia A venceu e ela volta para a fila na tentativa 2.
reset role;
update public.midias set processamento_iniciado_em = now() - interval '2 hours'
 where id = '53000000-0000-0000-0000-0000000000a1';
set local role service_role;
do $$
declare r record; n int;
begin
  select * into r from public.assumir_proxima_midia(3600);
  if r.midia_id is distinct from '53000000-0000-0000-0000-0000000000a1' or r.tentativa is distinct from 2 then
    raise exception 'Mídia travada não foi retomada: %', r;
  end if;

  -- A execução antiga (tentativa 1) não pode gravar por cima da nova.
  update public.midias set processamento = 'pronta', arquivo_publicado = 'velha.webp'
   where id = r.midia_id and processamento = 'otimizando' and tentativas_processamento = 1;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Execução antiga gravou o resultado'; end if;

  update public.midias set processamento = 'pronta', arquivo_publicado = r.caminho || '.webp',
         tamanho_original_bytes = 10, tamanho_final_bytes = 5, motivo_processamento = null
   where id = r.midia_id and processamento = 'otimizando' and tentativas_processamento = r.tentativa;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Worker não conseguiu gravar o resultado'; end if;
end $$;

-- Falha registrada volta depois de 5 minutos; tentativas esgotadas viram falha definitiva.
reset role;
update public.midias set processamento = 'falhou', processamento_iniciado_em = now() - interval '10 minutes'
 where id = '53000000-0000-0000-0000-0000000000b2';
set local role service_role;
do $$
declare r record;
begin
  select * into r from public.assumir_proxima_midia(3600);
  if r.midia_id is distinct from '53000000-0000-0000-0000-0000000000b2' or r.tentativa is distinct from 2 then
    raise exception 'Falha não foi tentada de novo: %', r;
  end if;
end $$;
reset role;
update public.midias set tentativas_processamento = 3, processamento_iniciado_em = now() - interval '2 hours'
 where id = '53000000-0000-0000-0000-0000000000b2';
set local role service_role;
do $$
begin
  if exists (select from public.assumir_proxima_midia(3600)) then raise exception 'Tentativas não foram limitadas'; end if;
end $$;
reset role;
do $$
begin
  if not exists (select from public.midias where id = '53000000-0000-0000-0000-0000000000b2'
                  and processamento = 'falhou' and motivo_processamento like 'Tentativas esgotadas%') then
    raise exception 'Mídia esgotada sem registro de falha';
  end if;
end $$;

set local role authenticated;
do $$
begin
  perform set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000001","aal":"aal1"}',true);
  if (select count(*) from public.midias) <> 2 then raise exception 'Dono não vê as próprias mídias'; end if;
  perform set_config('request.jwt.claims','{"sub":"53000000-0000-0000-0000-000000000002","aal":"aal1"}',true);
  if exists (select from public.midias) then raise exception 'Outro usuário viu mídia alheia'; end if;
  begin
    update public.midias set processamento = 'pronta';
    raise exception 'Usuário alterou o processamento';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
select 'Fila de mídias: ordem, retomada, cerca de tentativa, limite, falha e acesso verificados' as resultado;
