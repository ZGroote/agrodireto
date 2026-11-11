begin;

-- B05 etapa 1: papéis administrativos separados (DOC 034).
-- Cada papel só com o necessário; o segundo fator segue seguranca_equipe.exige_mfa (inalterada).

alter table public.equipe_agrodireto
  add column papel text not null default 'geral'
    check (papel in ('geral', 'cadastral', 'comercial', 'logistico', 'financeiro', 'auditor', 'suporte')),
  add column concedido_por uuid references auth.users (id) on delete set null,
  add column concedido_em timestamptz not null default now();

-- Histórico de concessões e revogações (papel nulo = revogado). Sem FK para manter o histórico.
create table public.concessoes_equipe (
  id bigint generated always as identity primary key,
  usuario_id uuid not null,
  papel text,
  por uuid not null,
  em timestamptz not null default now()
);
alter table public.concessoes_equipe enable row level security;
revoke all on public.concessoes_equipe from public, anon, authenticated;
grant select on public.concessoes_equipe to authenticated;

-- Matriz fixa: o que cada papel pode. Exige acesso_equipe() autorizado (vínculo + aal2 quando exige_mfa).
create function public.equipe_pode(p_acao text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.acesso_equipe() = 'autorizado' and coalesce((
    select case e.papel
      when 'geral' then true
      when 'cadastral' then p_acao in ('escrever_cadastros', 'revisar_ofertas', 'ler_cadastros', 'ler_ofertas', 'ler_frota')
      when 'comercial' then p_acao in ('ler_cadastros', 'ler_ofertas')
      when 'logistico' then p_acao in ('ler_cadastros', 'ler_frota')
      when 'financeiro' then p_acao in ('ler_cadastros')
      when 'auditor' then p_acao in ('ler_cadastros', 'ler_ofertas', 'ler_frota', 'ler_equipe')
      when 'suporte' then p_acao in ('ler_cadastros')
      else false
    end
    from public.equipe_agrodireto e where e.usuario_id = auth.uid()
  ), false);
$$;

create policy concessoes_equipe_leitura on public.concessoes_equipe for select to authenticated using (
  (select public.equipe_pode('ler_equipe'))
);

-- Papel do usuário para o app montar menus; nulo sem acesso autorizado.
create function public.papel_equipe()
returns text language sql stable security definer set search_path = '' as $$
  select case when public.acesso_equipe() = 'autorizado' then
    (select papel from public.equipe_agrodireto where usuario_id = auth.uid())
  end;
$$;

-- Concede ou troca o papel de uma conta pelo e-mail. Só geral; nunca a própria linha.
create function public.conceder_acesso_equipe(p_email text, p_papel text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare alvo uuid;
begin
  if not public.equipe_pode('gerir_equipe') then
    raise insufficient_privilege using message = 'Concessão não autorizada';
  end if;
  if p_papel is null or p_papel not in ('geral', 'cadastral', 'comercial', 'logistico', 'financeiro', 'auditor', 'suporte') then
    raise sqlstate 'PT422' using message = 'Papel inválido.';
  end if;
  select id into alvo from auth.users where lower(email) = lower(trim(p_email));
  if alvo is null then return false; end if;
  if alvo = auth.uid() then
    raise insufficient_privilege using message = 'Não é possível alterar o próprio acesso';
  end if;
  insert into public.equipe_agrodireto as e (usuario_id, papel, concedido_por, concedido_em)
  values (alvo, p_papel, auth.uid(), now())
  on conflict (usuario_id) do update
    set papel = excluded.papel, concedido_por = excluded.concedido_por, concedido_em = excluded.concedido_em
    where e.papel is distinct from excluded.papel;
  if found then
    insert into public.concessoes_equipe (usuario_id, papel, por) values (alvo, p_papel, auth.uid());
  end if;
  return true;
end;
$$;

-- Revoga o acesso (vale na próxima chamada; o JWT não importa). Só geral; nunca a si mesmo, então sempre resta um geral.
create function public.revogar_acesso_equipe(p_usuario uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.equipe_pode('gerir_equipe') then
    raise insufficient_privilege using message = 'Revogação não autorizada';
  end if;
  if p_usuario = auth.uid() then
    raise insufficient_privilege using message = 'Não é possível revogar o próprio acesso';
  end if;
  delete from public.equipe_agrodireto where usuario_id = p_usuario;
  if found then
    insert into public.concessoes_equipe (usuario_id, papel, por) values (p_usuario, null, auth.uid());
  end if;
end;
$$;

create function public.listar_equipe()
returns table (usuario_id uuid, email text, papel text, concedido_em timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.equipe_pode('ler_equipe') then raise insufficient_privilege; end if;
  return query
    select e.usuario_id, u.email::text, e.papel, e.concedido_em
      from public.equipe_agrodireto e join auth.users u on u.id = e.usuario_id
     order by u.email;
end;
$$;

revoke all on function public.equipe_pode(text), public.papel_equipe(), public.conceder_acesso_equipe(text, text),
  public.revogar_acesso_equipe(uuid), public.listar_equipe() from public, anon, authenticated;
grant execute on function public.equipe_pode(text), public.papel_equipe(), public.conceder_acesso_equipe(text, text),
  public.revogar_acesso_equipe(uuid), public.listar_equipe() to authenticated;

-- Funções e políticas da equipe passam a checar a ação. Cada bloco parte da versão mais recente
-- (migration indicada) e muda só a checagem; grants das funções são mantidos pelo create or replace.

-- aprovar_propriedade: copiada de 20261111080000_organizacoes.sql; só a checagem mudou (escrever_cadastros).
create or replace function public.aprovar_propriedade(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.equipe_pode('escrever_cadastros') then
    raise insufficient_privilege using message = 'Aprovação não autorizada';
  end if;
  update public.propriedades
     set status = 'aprovada', aprovada_em = now(), aprovada_por = auth.uid()
   where id = p_id and status = 'em_analise';
  if not found and not exists (select 1 from public.propriedades where id = p_id) then
    raise no_data_found using message = 'Propriedade não encontrada';
  end if;
end;
$$;

-- revisar_propriedade: copiada de 20261111080000_organizacoes.sql; só a checagem mudou (escrever_cadastros).
create or replace function public.revisar_propriedade(p_id uuid, p_enviada_em timestamptz, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.equipe_pode('escrever_cadastros') then
    raise insufficient_privilege using message = 'Revisão não autorizada';
  end if;
  update public.propriedades
     set status = case when p_motivo is null then 'aprovada' else 'ajustes_solicitados' end,
         aprovada_em = case when p_motivo is null then now() end,
         aprovada_por = case when p_motivo is null then auth.uid() end,
         motivo_ajuste = trim(p_motivo),
         ajuste_solicitado_em = case when p_motivo is not null then now() end,
         ajuste_solicitado_por = case when p_motivo is not null then auth.uid() end
   where id = p_id and status = 'em_analise' and enviada_em = p_enviada_em;
  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
end;
$$;

-- revisar_cadastro_comprador: copiada de 20261111085000_compradores.sql; só a checagem mudou (escrever_cadastros).
create or replace function public.revisar_cadastro_comprador(p_organizacao_id uuid, p_enviada_em timestamptz, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.equipe_pode('escrever_cadastros') then
    raise insufficient_privilege using message = 'Revisão não autorizada';
  end if;
  update public.cadastros_comprador
     set status = case when p_motivo is null then 'aprovada' else 'ajustes_solicitados' end,
         aprovada_em = case when p_motivo is null then now() end,
         aprovada_por = case when p_motivo is null then auth.uid() end,
         motivo_ajuste = trim(p_motivo),
         ajuste_solicitado_em = case when p_motivo is not null then now() end,
         ajuste_solicitado_por = case when p_motivo is not null then auth.uid() end
   where organizacao_id = p_organizacao_id and status = 'em_analise' and enviada_em = p_enviada_em;
  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
end;
$$;

-- revisar_cadastro_transportadora: copiada de 20261111087000_transportadoras.sql; só a checagem mudou (escrever_cadastros).
create or replace function public.revisar_cadastro_transportadora(p_organizacao_id uuid, p_enviada_em timestamptz, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.equipe_pode('escrever_cadastros') then
    raise insufficient_privilege using message = 'Revisão não autorizada';
  end if;
  update public.cadastros_transportadora
     set status = case when p_motivo is null then 'aprovada' else 'ajustes_solicitados' end,
         aprovada_em = case when p_motivo is null then now() end,
         aprovada_por = case when p_motivo is null then auth.uid() end,
         motivo_ajuste = trim(p_motivo),
         ajuste_solicitado_em = case when p_motivo is not null then now() end,
         ajuste_solicitado_por = case when p_motivo is not null then auth.uid() end
   where organizacao_id = p_organizacao_id and status = 'em_analise' and enviada_em = p_enviada_em;
  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
end;
$$;

-- listar_evidencias_pendentes: copiada de 20261111050000_revisar_evidencias_lote.sql; só a checagem mudou (revisar_ofertas).
create or replace function public.listar_evidencias_pendentes()
returns table (lote_id uuid, chave text, arquivo text, tipo text, produto text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.equipe_pode('revisar_ofertas') then raise insufficient_privilege; end if;
  return query
    select e.lote_id, e.chave, e.arquivo, e.tipo, o.produto
    from public.evidencias_lote e join public.ofertas_lote o on o.id = e.lote_id
    where e.enviada_em is not null and e.solicitada_em is not null and e.revisao is null
    order by e.solicitada_em, e.lote_id, e.chave limit 25;
end;
$$;

-- revisar_evidencia_lote: copiada de 20261111050000_revisar_evidencias_lote.sql; só a checagem mudou (revisar_ofertas).
create or replace function public.revisar_evidencia_lote(p_lote uuid, p_chave text, p_aprovada boolean, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.equipe_pode('revisar_ofertas') then raise insufficient_privilege; end if;
  if p_aprovada is null or (not p_aprovada and coalesce(char_length(trim(p_motivo)), 0) not between 1 and 500) then
    raise sqlstate 'PT422' using message = 'Informe um motivo para rejeitar a evidência.';
  end if;
  update public.evidencias_lote
  set revisao = case when p_aprovada then 'aprovada' else 'rejeitada' end,
      motivo_rejeicao = case when not p_aprovada then trim(p_motivo) end,
      revisada_em = now(), revisada_por = auth.uid()
  where lote_id = p_lote and chave = p_chave and enviada_em is not null
    and solicitada_em is not null and revisao is null;
  if not found then
    raise sqlstate 'PT409' using message = 'A evidência já foi revisada ou não está disponível.';
  end if;
end;
$$;

-- listar_lotes_inspecao: copiada de 20261111070000_inspecoes_lote.sql; só a checagem mudou (revisar_ofertas).
create or replace function public.listar_lotes_inspecao(p_lote uuid default null, p_pagina integer default 0)
returns table (
  lote_id uuid, produto text, quantidade numeric, unidade text, resultado text,
  inspecionada_em timestamptz, inspetor_id uuid, embalagem_conforme boolean, qualidade_conforme boolean,
  temperatura numeric, evidencias_aprovadas text[]
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.equipe_pode('revisar_ofertas') then raise insufficient_privilege; end if;

  return query
    select o.id, o.produto, o.quantidade, o.unidade, i.resultado, i.inspecionada_em, i.inspetor_id,
           i.embalagem_conforme, i.qualidade_conforme, i.temperatura,
           coalesce(i.evidencias_aprovadas, array(
             select e.chave from public.evidencias_lote e
              where e.lote_id = o.id and e.revisao = 'aprovada' order by e.chave))
      from public.ofertas_lote o left join public.inspecoes_lote i on i.lote_id = o.id
     where (p_lote is null or o.id = p_lote)
       and (i.lote_id is not null or (
         o.retirada_em is null and least(o.validade, o.retirada_fim) >= (now() at time zone 'America/Sao_Paulo')::date
       ))
     order by o.publicada_em desc, o.id
     limit 20 offset least(greatest(p_pagina, 0), 1000) * 20;
end;
$$;

-- concluir_inspecao_lote: copiada de 20261111070000_inspecoes_lote.sql; só a checagem mudou (revisar_ofertas).
create or replace function public.concluir_inspecao_lote(
  p_lote uuid, p_embalagem boolean, p_qualidade boolean, p_temperatura numeric, p_resultado text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.equipe_pode('revisar_ofertas') then raise insufficient_privilege; end if;
  if p_embalagem is null or p_qualidade is null or p_resultado is null
    or p_resultado not in ('aprovado','ressalvas','reprovado')
    or (p_resultado = 'aprovado' and not (p_embalagem and p_qualidade))
    or (p_temperatura is not null and (p_temperatura not between -50 and 80 or p_temperatura <> round(p_temperatura, 1))) then
    raise sqlstate 'PT422' using message = 'Confira os itens de conformidade, a temperatura e o resultado.';
  end if;

  perform 1 from public.ofertas_lote where id = p_lote and retirada_em is null
    and least(validade, retirada_fim) >= (now() at time zone 'America/Sao_Paulo')::date for update;
  if not found then raise sqlstate 'PT409' using message = 'O lote não está mais disponível para inspeção.'; end if;

  insert into public.inspecoes_lote
    (lote_id, inspetor_id, embalagem_conforme, qualidade_conforme, temperatura, resultado, evidencias_aprovadas)
  values (p_lote, auth.uid(), p_embalagem, p_qualidade, p_temperatura, p_resultado, array(
    select e.chave from public.evidencias_lote e
     where e.lote_id = p_lote and e.revisao = 'aprovada' order by e.chave
  )) on conflict (lote_id) do nothing;
  if not found then raise sqlstate 'PT409' using message = 'Este lote já tem uma inspeção concluída.'; end if;
end;
$$;

-- propriedades_leitura: copiada de 20261111080000_organizacoes.sql; trecho de membro/autor intacto (ler_cadastros).
alter policy propriedades_leitura on public.propriedades using (
  usuario_id = (select auth.uid())
  or agrodireto_privado.e_membro(organizacao_id)
  or (select public.equipe_pode('ler_cadastros'))
);

-- organizacoes_leitura: copiada de 20261111080000_organizacoes.sql; trecho de membro/autor intacto (ler_cadastros).
alter policy organizacoes_leitura on public.organizacoes using (
  agrodireto_privado.e_membro(id) or (select public.equipe_pode('ler_cadastros'))
);

-- membros_leitura: copiada de 20261111080000_organizacoes.sql; trecho de membro/autor intacto (ler_cadastros).
alter policy membros_leitura on public.membros_organizacao using (
  usuario_id = (select auth.uid()) or (select public.equipe_pode('ler_cadastros'))
);

-- cadastros_comprador_leitura: copiada de 20261111085000_compradores.sql; trecho de membro/autor intacto (ler_cadastros).
alter policy cadastros_comprador_leitura on public.cadastros_comprador using (
  agrodireto_privado.e_membro(organizacao_id) or (select public.equipe_pode('ler_cadastros'))
);

-- cadastros_transportadora_leitura: copiada de 20261111087000_transportadoras.sql; trecho de membro/autor intacto (ler_cadastros).
alter policy cadastros_transportadora_leitura on public.cadastros_transportadora using (
  agrodireto_privado.e_membro(organizacao_id) or (select public.equipe_pode('ler_cadastros'))
);

-- midias_leitura: copiada de 20261111170000_midias_privadas.sql; trecho de membro/autor intacto (ler_ofertas).
alter policy midias_leitura on public.midias using (
  agrodireto_privado.e_membro(agrodireto_privado.organizacao_da_midia(lote_id, propriedade_id))
  or (select public.equipe_pode('ler_ofertas'))
);

-- evidencias_lote_equipe_pendentes: copiada de 20261111050000_revisar_evidencias_lote.sql; trecho de membro/autor intacto (ler_ofertas).
alter policy evidencias_lote_equipe_pendentes on public.evidencias_lote using (
    enviada_em is not null and solicitada_em is not null and revisao is null
    and (select public.equipe_pode('ler_ofertas'))
  );

-- culturas_leitura: copiada de 20261111100000_culturas.sql; trecho de membro/autor intacto (ler_ofertas).
alter policy culturas_leitura on public.culturas using (
  exists (
    select 1 from public.propriedades p
     where p.id = propriedade_id and agrodireto_privado.e_membro(p.organizacao_id)
  ) or (select public.equipe_pode('ler_ofertas'))
);

-- veiculos_leitura: copiada de 20261111110000_veiculos_motoristas.sql; trecho de membro/autor intacto (ler_frota).
alter policy veiculos_leitura on public.veiculos using (
  agrodireto_privado.e_membro(organizacao_id) or (select public.equipe_pode('ler_frota'))
);

-- motoristas_leitura: copiada de 20261111110000_veiculos_motoristas.sql; trecho de membro/autor intacto (ler_frota).
alter policy motoristas_leitura on public.motoristas using (
  agrodireto_privado.e_membro(organizacao_id) or (select public.equipe_pode('ler_frota'))
);

commit;
