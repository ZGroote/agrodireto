begin;

-- Tipo da organização: o produtor não pode cair na empresa compradora (ou transportadora) de quem é as duas coisas.
alter table public.organizacoes
  add column tipo text not null default 'produtor' check (tipo in ('produtor', 'comprador', 'transportadora'));

-- CNPJ numérico ou alfanumérico (a partir de 07/2026): 12 posições [0-9A-Z] e 2 dígitos verificadores.
create function agrodireto_privado.cnpj_valido(p text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  v int[];
  pesos int[] := array[6,5,4,3,2,9,8,7,6,5,4,3,2];
  s int; r int; i int; n int;
begin
  if p is null or p !~ '^[0-9A-Z]{12}[0-9]{2}$' or p ~ '^(.)\1{13}$' then return false; end if;
  v := array(select ascii(substr(p, g, 1)) - 48 from generate_series(1, 14) g);
  for n in 12..13 loop
    s := 0;
    for i in 1..n loop s := s + v[i] * pesos[i + 13 - n]; end loop;
    r := s % 11;
    if (case when r < 2 then 0 else 11 - r end) <> v[n + 1] then return false; end if;
  end loop;
  return true;
end;
$$;

create table public.cadastros_comprador (
  organizacao_id uuid primary key references public.organizacoes (id) on delete cascade,
  enviado_por uuid not null references auth.users (id) on delete cascade,
  razao_social text not null check (char_length(razao_social) between 2 and 160),
  cnpj text not null unique check (agrodireto_privado.cnpj_valido(cnpj)),
  contato_nome text not null check (char_length(contato_nome) between 2 and 120),
  contato_telefone text not null check (contato_telefone ~ '^[0-9]{10,11}$'),
  cidade text not null check (char_length(cidade) between 2 and 100),
  uf text not null check (uf in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  endereco_entrega text not null check (char_length(endereco_entrega) between 5 and 300),
  status text not null default 'em_analise' check (status in ('em_analise', 'ajustes_solicitados', 'aprovada')),
  enviada_em timestamptz not null default now(),
  motivo_ajuste text check (char_length(motivo_ajuste) between 1 and 500),
  ajuste_solicitado_em timestamptz,
  ajuste_solicitado_por uuid references auth.users (id) on delete set null,
  aprovada_em timestamptz,
  aprovada_por uuid references auth.users (id) on delete set null
);

alter table public.cadastros_comprador enable row level security;
revoke all on public.cadastros_comprador from public, anon, authenticated;
grant select on public.cadastros_comprador to authenticated;
create policy cadastros_comprador_leitura on public.cadastros_comprador for select to authenticated using (
  agrodireto_privado.e_membro(organizacao_id) or (select public.acesso_equipe()) = 'autorizado'
);

-- Envio: cria a empresa compradora no primeiro envio; repetir não duplica.
create function public.enviar_cadastro_comprador(
  p_razao_social text, p_cnpj text, p_contato_nome text, p_contato_telefone text,
  p_cidade text, p_uf text, p_endereco_entrega text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare org uuid;
begin
  if auth.uid() is null or exists (
    select 1 from public.equipe_agrodireto where usuario_id = auth.uid()
  ) then
    raise insufficient_privilege using message = 'Envio não autorizado';
  end if;
  perform pg_advisory_xact_lock(hashtext('comprador:' || auth.uid()::text));
  select m.organizacao_id into org from public.membros_organizacao m
    join public.organizacoes o on o.id = m.organizacao_id
   where m.usuario_id = auth.uid() and m.papel = 'titular' and o.tipo = 'comprador'
   order by m.incluido_em, m.organizacao_id limit 1;
  if org is not null then return org; end if;

  insert into public.organizacoes (nome, tipo) values (trim(p_razao_social), 'comprador') returning id into org;
  insert into public.membros_organizacao (organizacao_id, usuario_id, papel) values (org, auth.uid(), 'titular');
  insert into public.cadastros_comprador (
    organizacao_id, enviado_por, razao_social, cnpj, contato_nome, contato_telefone, cidade, uf, endereco_entrega
  ) values (
    org, auth.uid(), trim(p_razao_social), upper(regexp_replace(p_cnpj, '[^0-9A-Za-z]', '', 'g')),
    trim(p_contato_nome), regexp_replace(p_contato_telefone, '[^0-9]', '', 'g'),
    trim(p_cidade), upper(trim(p_uf)), trim(p_endereco_entrega)
  );
  return org;
end;
$$;

create function public.reenviar_cadastro_comprador(
  p_organizacao_id uuid, p_enviada_em timestamptz,
  p_razao_social text, p_cnpj text, p_contato_nome text, p_contato_telefone text,
  p_cidade text, p_uf text, p_endereco_entrega text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.cadastros_comprador
     set razao_social = trim(p_razao_social), cnpj = upper(regexp_replace(p_cnpj, '[^0-9A-Za-z]', '', 'g')),
         contato_nome = trim(p_contato_nome), contato_telefone = regexp_replace(p_contato_telefone, '[^0-9]', '', 'g'),
         cidade = trim(p_cidade), uf = upper(trim(p_uf)), endereco_entrega = trim(p_endereco_entrega),
         status = 'em_analise', enviada_em = clock_timestamp(), motivo_ajuste = null,
         ajuste_solicitado_em = null, ajuste_solicitado_por = null
   where organizacao_id = p_organizacao_id and agrodireto_privado.e_membro(organizacao_id)
     and status = 'ajustes_solicitados' and enviada_em = p_enviada_em;
  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
  update public.organizacoes set nome = trim(p_razao_social) where id = p_organizacao_id;
end;
$$;

create function public.revisar_cadastro_comprador(p_organizacao_id uuid, p_enviada_em timestamptz, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.acesso_equipe() <> 'autorizado' then
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

revoke all on function public.enviar_cadastro_comprador(text, text, text, text, text, text, text),
  public.reenviar_cadastro_comprador(uuid, timestamptz, text, text, text, text, text, text, text),
  public.revisar_cadastro_comprador(uuid, timestamptz, text) from public, anon, authenticated;
grant execute on function public.enviar_cadastro_comprador(text, text, text, text, text, text, text),
  public.reenviar_cadastro_comprador(uuid, timestamptz, text, text, text, text, text, text, text),
  public.revisar_cadastro_comprador(uuid, timestamptz, text) to authenticated;

-- Quem compra: membro de empresa compradora aprovada. A lista manual da homologação continua valendo.
create function agrodireto_privado.comprador_autorizado()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from agrodireto_privado.compradores_catalogo where usuario_id = auth.uid())
      or exists (
        select 1 from public.membros_organizacao m
          join public.cadastros_comprador c on c.organizacao_id = m.organizacao_id
         where m.usuario_id = auth.uid() and c.status = 'aprovada'
      );
$$;
create function public.sou_comprador_autorizado()
returns boolean language sql stable security definer set search_path = '' as $$
  select agrodireto_privado.comprador_autorizado();
$$;
revoke all on function agrodireto_privado.comprador_autorizado(), public.sou_comprador_autorizado() from public, anon, authenticated;
grant execute on function agrodireto_privado.comprador_autorizado(), public.sou_comprador_autorizado() to authenticated;

-- Envio de propriedade: só usa organização de produtor.
create or replace function public.enviar_propriedade(p_nome text, p_cidade text, p_uf text, p_area numeric, p_culturas text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare org uuid; prop uuid;
begin
  if auth.uid() is null or exists (
    select 1 from public.equipe_agrodireto where usuario_id = auth.uid()
  ) then
    raise insufficient_privilege using message = 'Envio não autorizado';
  end if;
  perform pg_advisory_xact_lock(hashtext('organizacao:' || auth.uid()::text));
  select m.organizacao_id into org from public.membros_organizacao m
    join public.organizacoes o on o.id = m.organizacao_id
   where m.usuario_id = auth.uid() and m.papel = 'titular' and o.tipo = 'produtor'
   order by m.incluido_em, m.organizacao_id limit 1;
  if org is null then
    insert into public.organizacoes (nome, tipo) values (trim(p_nome), 'produtor') returning id into org;
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

-- Catálogo, fotos e inspeção passam a liberar o comprador aprovado.
create or replace function public.consultar_catalogo(p_id uuid default null, p_busca text default '', p_pagina integer default 0)
returns table (
  id uuid, produto text, fornecedor text, cidade text, uf text,
  quantidade numeric, unidade text, preco_centavos bigint, colheita date,
  retirada_inicio date, retirada_fim date, validade date,
  padrao text, calibre text, embalagem text, condicoes text
) language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from agrodireto_privado.catalogo_homologacao where unica and habilitado)
     or not agrodireto_privado.comprador_autorizado() then
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
     and agrodireto_privado.comprador_autorizado()
     and exists (
       select 1 from public.evidencias_lote e
       join public.ofertas_lote o on o.id = e.lote_id
       join public.propriedades p on p.id = o.propriedade_id
       where e.copia_catalogo = p_arquivo and e.revisao = 'aprovada' and e.autorizada_catalogo
         and o.retirada_em is null and p.status = 'aprovada'
         and least(o.validade, o.retirada_fim) >= (now() at time zone 'America/Sao_Paulo')::date
     );
$$;

create or replace function public.ler_resultado_inspecao_lote(p_lote uuid)
returns table (resultado text, inspecionada_em timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.ofertas_lote where id = p_lote and produtor_id = auth.uid()) then
    if not agrodireto_privado.comprador_autorizado() then return; end if;
    if not exists (select 1 from public.consultar_catalogo(p_lote, '', 0)) then return; end if;
  end if;
  return query select i.resultado, i.inspecionada_em from public.inspecoes_lote i where i.lote_id = p_lote;
end;
$$;

commit;
