begin;

-- Organizações com membros; propriedade passa a ter id próprio e pertencer a uma organização.

create table public.organizacoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 120),
  criada_em timestamptz not null default now()
);

create table public.membros_organizacao (
  organizacao_id uuid not null references public.organizacoes (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  papel text not null default 'membro' check (papel in ('titular', 'membro')),
  incluido_em timestamptz not null default now(),
  primary key (organizacao_id, usuario_id)
);
create index membros_organizacao_usuario on public.membros_organizacao (usuario_id);

alter table public.organizacoes enable row level security;
alter table public.membros_organizacao enable row level security;
revoke all on public.organizacoes, public.membros_organizacao from public, anon, authenticated;
grant select on public.organizacoes, public.membros_organizacao to authenticated;

create function agrodireto_privado.e_membro(p_organizacao uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.membros_organizacao
     where organizacao_id = p_organizacao and usuario_id = auth.uid()
  );
$$;
revoke all on function agrodireto_privado.e_membro(uuid) from public, anon, authenticated;
grant execute on function agrodireto_privado.e_membro(uuid) to authenticated;

create policy organizacoes_leitura on public.organizacoes for select to authenticated using (
  agrodireto_privado.e_membro(id) or (select public.acesso_equipe()) = 'autorizado'
);
create policy membros_leitura on public.membros_organizacao for select to authenticated using (
  usuario_id = (select auth.uid()) or (select public.acesso_equipe()) = 'autorizado'
);

-- Propriedades: id próprio, organização dona e várias por organização.

alter table public.ofertas_lote drop constraint ofertas_lote_produtor_id_fkey;

alter table public.propriedades
  add column id uuid not null default gen_random_uuid(),
  add column organizacao_id uuid references public.organizacoes (id) on delete cascade;

-- Cada propriedade já existente ganha uma organização com quem a enviou como titular.
do $$
declare r record; org uuid;
begin
  for r in select usuario_id, nome from public.propriedades loop
    insert into public.organizacoes (nome) values (r.nome) returning id into org;
    insert into public.membros_organizacao (organizacao_id, usuario_id, papel)
      values (org, r.usuario_id, 'titular');
    update public.propriedades set organizacao_id = org where usuario_id = r.usuario_id;
  end loop;
end $$;

alter table public.propriedades
  alter column organizacao_id set not null,
  drop constraint propriedades_pkey,
  add primary key (id);
create index propriedades_usuario on public.propriedades (usuario_id);
create unique index propriedades_nome_por_organizacao on public.propriedades (organizacao_id, lower(nome));

alter policy propriedades_leitura on public.propriedades using (
  usuario_id = (select auth.uid())
  or agrodireto_privado.e_membro(organizacao_id)
  or (select public.acesso_equipe()) = 'autorizado'
);

-- Ofertas: ligadas à propriedade; produtor_id continua sendo quem publicou.

alter table public.ofertas_lote
  add column propriedade_id uuid references public.propriedades (id) on delete cascade,
  add constraint ofertas_lote_produtor_id_fkey foreign key (produtor_id) references auth.users (id) on delete cascade;
update public.ofertas_lote o set propriedade_id = p.id
  from public.propriedades p where p.usuario_id = o.produtor_id;
alter table public.ofertas_lote alter column propriedade_id set not null;
create index ofertas_lote_propriedade on public.ofertas_lote (propriedade_id);

-- Envio, reenvio e revisão passam a usar o id da propriedade.

drop function public.enviar_propriedade(text, text, text, numeric, text);
drop function public.reenviar_propriedade(timestamptz, text, text, text, numeric, text);
drop function public.revisar_propriedade(uuid, timestamptz, text);
drop function public.aprovar_propriedade(uuid);

create function public.enviar_propriedade(p_nome text, p_cidade text, p_uf text, p_area numeric, p_culturas text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare org uuid; prop uuid;
begin
  if auth.uid() is null or exists (
    select 1 from public.equipe_agrodireto where usuario_id = auth.uid()
  ) then
    raise insufficient_privilege using message = 'Envio não autorizado';
  end if;
  -- Evita duas organizações quando o primeiro envio é repetido ao mesmo tempo.
  perform pg_advisory_xact_lock(hashtext('organizacao:' || auth.uid()::text));
  select organizacao_id into org from public.membros_organizacao
   where usuario_id = auth.uid() and papel = 'titular'
   order by incluido_em, organizacao_id limit 1;
  if org is null then
    insert into public.organizacoes (nome) values (trim(p_nome)) returning id into org;
    insert into public.membros_organizacao (organizacao_id, usuario_id, papel)
      values (org, auth.uid(), 'titular');
  end if;
  insert into public.propriedades (usuario_id, organizacao_id, nome, cidade, uf, area, culturas)
  values (auth.uid(), org, trim(p_nome), trim(p_cidade), upper(trim(p_uf)), p_area, trim(p_culturas))
  on conflict (organizacao_id, lower(nome)) do nothing
  returning id into prop;
  if prop is null then
    select id into prop from public.propriedades
     where organizacao_id = org and lower(nome) = lower(trim(p_nome));
  end if;
  return prop;
end;
$$;

create function public.reenviar_propriedade(p_id uuid, p_enviada_em timestamptz, p_nome text, p_cidade text, p_uf text, p_area numeric, p_culturas text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.propriedades
     set nome = trim(p_nome), cidade = trim(p_cidade), uf = upper(trim(p_uf)),
         area = p_area, culturas = trim(p_culturas), status = 'em_analise',
         enviada_em = clock_timestamp(), motivo_ajuste = null,
         ajuste_solicitado_em = null, ajuste_solicitado_por = null
   where id = p_id and agrodireto_privado.e_membro(organizacao_id)
     and status = 'ajustes_solicitados' and enviada_em = p_enviada_em;
  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
end;
$$;

create function public.revisar_propriedade(p_id uuid, p_enviada_em timestamptz, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.acesso_equipe() <> 'autorizado' then
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

create function public.aprovar_propriedade(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.acesso_equipe() <> 'autorizado' then
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

revoke all on function public.enviar_propriedade(text, text, text, numeric, text),
  public.reenviar_propriedade(uuid, timestamptz, text, text, text, numeric, text),
  public.revisar_propriedade(uuid, timestamptz, text),
  public.aprovar_propriedade(uuid) from public, anon, authenticated;
grant execute on function public.enviar_propriedade(text, text, text, numeric, text),
  public.reenviar_propriedade(uuid, timestamptz, text, text, text, numeric, text),
  public.revisar_propriedade(uuid, timestamptz, text),
  public.aprovar_propriedade(uuid) to authenticated;

-- Publicação: o lote precisa de uma propriedade aprovada da organização.
-- Sem p_propriedade_id, vale a única propriedade aprovada; com mais de uma, o app precisa escolher.

drop function public.publicar_oferta_lote(text, text, numeric, text, bigint, date, date, date, date, text, text, text, text);

create function public.publicar_oferta_lote(
  p_rascunho_id text, p_produto text, p_quantidade numeric, p_unidade text, p_preco_centavos bigint,
  p_colheita date, p_retirada_inicio date, p_retirada_fim date, p_validade date,
  p_padrao text, p_calibre text, p_embalagem text, p_condicoes text, p_propriedade_id uuid default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare oferta_id uuid; prop uuid; total integer;
begin
  if not exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado) then
    raise sqlstate 'PT403' using message = 'Publicação de homologação indisponível.';
  end if;
  select count(*), min(p.id::text)::uuid into total, prop from public.propriedades p
   where p.status = 'aprovada' and agrodireto_privado.e_membro(p.organizacao_id)
     and (p_propriedade_id is null or p.id = p_propriedade_id);
  if total = 0 then
    raise sqlstate 'PT403' using message = 'A propriedade precisa estar aprovada para publicar.';
  end if;
  if total > 1 then
    raise sqlstate 'PT422' using message = 'Escolha a propriedade do lote.';
  end if;
  perform 1 from public.propriedades where id = prop and status = 'aprovada' for share;
  if not found then
    raise sqlstate 'PT403' using message = 'A propriedade precisa estar aprovada para publicar.';
  end if;

  select id into oferta_id from public.ofertas_lote
    where produtor_id = auth.uid() and rascunho_id = p_rascunho_id;
  if found then return oferta_id; end if;

  if p_validade < (now() at time zone 'America/Sao_Paulo')::date or
     p_retirada_fim < (now() at time zone 'America/Sao_Paulo')::date then
    raise sqlstate 'PT422' using message = 'A validade e a retirada precisam estar vigentes.';
  end if;

  insert into public.ofertas_lote (
    produtor_id, propriedade_id, rascunho_id, produto, quantidade, unidade, preco_centavos,
    colheita, retirada_inicio, retirada_fim, validade, padrao, calibre, embalagem, condicoes
  ) values (
    auth.uid(), prop, p_rascunho_id, trim(p_produto), p_quantidade, p_unidade, p_preco_centavos,
    p_colheita, p_retirada_inicio, p_retirada_fim, p_validade, trim(p_padrao),
    trim(p_calibre), trim(p_embalagem), trim(p_condicoes)
  )
  on conflict (produtor_id, rascunho_id) do nothing
  returning id into oferta_id;
  if oferta_id is null then
    select id into oferta_id from public.ofertas_lote
      where produtor_id = auth.uid() and rascunho_id = p_rascunho_id;
  end if;
  return oferta_id;
end;
$$;

revoke all on function public.publicar_oferta_lote(text, text, numeric, text, bigint, date, date, date, date, text, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.publicar_oferta_lote(text, text, numeric, text, bigint, date, date, date, date, text, text, text, text, uuid)
  to authenticated;

-- Catálogo e fotos: a junção com a propriedade passa a ser pelo id (usuario_id deixou de ser único).

create or replace function public.consultar_catalogo(p_id uuid default null, p_busca text default '', p_pagina integer default 0)
returns table (
  id uuid, produto text, fornecedor text, cidade text, uf text,
  quantidade numeric, unidade text, preco_centavos bigint, colheita date,
  retirada_inicio date, retirada_fim date, validade date,
  padrao text, calibre text, embalagem text, condicoes text
) language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado)
     or not exists (select 1 from agrodireto_privado.compradores_catalogo where usuario_id = auth.uid()) then
    raise sqlstate 'PT403' using message = 'Catálogo disponível para compradores autorizados.';
  end if;
  return query
    select o.id, o.produto, p.nome, p.cidade, p.uf, o.quantidade, o.unidade,
           o.preco_centavos, o.colheita, o.retirada_inicio, o.retirada_fim, o.validade,
           o.padrao, o.calibre, o.embalagem, o.condicoes
      from public.ofertas_lote o join public.propriedades p on p.id = o.propriedade_id
     where o.retirada_em is null and p.status = 'aprovada'
       and least(o.validade, o.retirada_fim) >= (now() at time zone 'America/Sao_Paulo')::date
       and (p_id is null or o.id = p_id)
       and (coalesce(p_busca, '') = '' or position(lower(left(p_busca, 120)) in lower(o.produto)) > 0)
     order by o.publicada_em desc, o.id
     limit 20 offset least(greatest(p_pagina, 0), 1000) * 20;
end;
$$;

create or replace function agrodireto_privado.pode_ver_foto_catalogo(p_arquivo text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado)
     and exists (select 1 from agrodireto_privado.compradores_catalogo where usuario_id = auth.uid())
     and exists (
       select 1 from public.evidencias_lote e
       join public.ofertas_lote o on o.id = e.lote_id
       join public.propriedades p on p.id = o.propriedade_id
       where e.copia_catalogo = p_arquivo and e.revisao = 'aprovada' and e.autorizada_catalogo
         and o.retirada_em is null and p.status = 'aprovada'
         and least(o.validade, o.retirada_fim) >= (now() at time zone 'America/Sao_Paulo')::date
     );
$$;

-- Evidências: a propriedade aprovada exigida é a do lote, não "alguma" do usuário.

alter policy evidencias_lote_storage_envio on storage.objects with check (
  bucket_id = 'evidencias-lote'
  and exists (
    select 1 from public.evidencias_lote e
    join public.ofertas_lote o on o.id = e.lote_id
    join public.propriedades p on p.id = o.propriedade_id
    where e.arquivo = name and e.enviada_em is null
      and o.produtor_id = (select auth.uid()) and o.retirada_em is null and p.status = 'aprovada'
  )
);

create or replace function public.reservar_evidencia_lote(p_lote uuid, p_chave text, p_extensao text)
returns text language plpgsql security definer set search_path = '' as $$
declare caminho text;
begin
  if not exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado) then
    raise sqlstate 'PT403' using message = 'Envio de evidências indisponível.';
  end if;
  -- Serializa as reservas do mesmo produtor para o limite total não ser ultrapassado.
  perform pg_advisory_xact_lock(hashtext('evidencias:' || auth.uid()::text));
  if not exists (
    select 1 from public.ofertas_lote o join public.propriedades p on p.id = o.propriedade_id
     where o.id = p_lote and o.produtor_id = auth.uid() and o.retirada_em is null and p.status = 'aprovada'
  ) then
    raise sqlstate 'PT403' using message = 'A oferta precisa estar publicada pela sua conta.';
  end if;
  if p_chave is null or p_chave !~ '^[a-z0-9-]{1,80}$' or p_extensao is null
     or p_extensao not in ('jpg','png','webp','mp4','mov') then
    raise sqlstate 'PT422' using message = 'Formato de evidência não aceito.';
  end if;
  caminho := auth.uid()::text || '/' || p_lote::text || '/' || p_chave || '.' || p_extensao;
  if exists (select 1 from public.evidencias_lote where arquivo = caminho) then return caminho; end if;
  if exists (select 1 from public.evidencias_lote where lote_id = p_lote and chave = p_chave) then
    raise sqlstate 'PT409' using message = 'A evidência já foi reservada com outro formato.';
  end if;
  if (select count(*) from public.evidencias_lote where lote_id = p_lote) >= 10 or (
    select count(*) from public.evidencias_lote e join public.ofertas_lote o on o.id = e.lote_id
    where o.produtor_id = auth.uid()
  ) >= 30 then
    raise sqlstate 'PT422' using message = 'Limite de evidências da homologação atingido.';
  end if;
  insert into public.evidencias_lote (lote_id, chave, arquivo, tipo)
  values (p_lote, p_chave, caminho, case when p_extensao in ('mp4','mov') then 'video' else 'foto' end);
  return caminho;
end;
$$;

commit;
