begin;

-- F01: cotação real. A empresa compradora vem explícita e o servidor confere a aprovação DELA (DOC 032).
-- Depende de 20261111240000_inspecao_obrigatoria.sql (ofertas_lote.verificacao).
-- Piloto só em SP, dentro do estado (DOC 040). Datas conferidas na RPC, nunca em CHECK.

create table public.cotacoes (
  id uuid primary key default gen_random_uuid(),
  oferta_id uuid not null references public.ofertas_lote (id) on delete cascade,
  organizacao_id uuid not null references public.cadastros_comprador (organizacao_id) on delete cascade,
  -- Copiada da propriedade da oferta na solicitação: a RLS do produtor não depende de join.
  produtora_organizacao_id uuid not null references public.organizacoes (id) on delete cascade,
  quantidade numeric not null check (quantidade > 0 and quantidade <= 1000000000),
  unidade text not null check (unidade in ('kg', 'cx', 't')),
  entrega_cidade text not null check (char_length(entrega_cidade) between 2 and 100),
  entrega_uf text not null check (entrega_uf = 'SP'),
  prazo_entrega date not null,
  mensagem text check (char_length(mensagem) <= 500),
  status text not null default 'solicitada' check (status in ('solicitada', 'respondida', 'recusada', 'expirada')),
  solicitada_por uuid references auth.users (id) on delete set null,
  solicitada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);
-- Uma cotação aberta por empresa e oferta: nova tentativa não duplica.
create unique index cotacoes_aberta_unica on public.cotacoes (oferta_id, organizacao_id) where status = 'solicitada';
create index cotacoes_compradora on public.cotacoes (organizacao_id, solicitada_em desc);
create index cotacoes_produtora on public.cotacoes (produtora_organizacao_id, solicitada_em desc);

alter table public.cotacoes enable row level security;
revoke all on public.cotacoes from public, anon, authenticated;
grant select on public.cotacoes to authenticated;
create policy cotacoes_leitura on public.cotacoes for select to authenticated using (
  agrodireto_privado.e_membro(organizacao_id)
  or agrodireto_privado.e_membro(produtora_organizacao_id)
  or (select public.acesso_equipe()) = 'autorizado'
);

create function public.solicitar_cotacao(
  p_organizacao_id uuid, p_oferta_id uuid, p_quantidade numeric,
  p_entrega_cidade text, p_entrega_uf text, p_prazo_entrega date, p_mensagem text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  o record;
  c uuid;
begin
  -- Membro DESTA empresa e empresa aprovada; vínculo de outra empresa aprovada não serve.
  if auth.uid() is null or not agrodireto_privado.e_membro(p_organizacao_id) or not exists (
    select 1 from public.cadastros_comprador where organizacao_id = p_organizacao_id and status = 'aprovada'
  ) then
    raise insufficient_privilege using message = 'Empresa compradora não aprovada';
  end if;

  -- Mesmo critério de vigência do catálogo (20261111240000, E00): declarado ou inspeção aprovada.
  select ol.quantidade, ol.unidade, p.organizacao_id, p.uf into o
    from public.ofertas_lote ol join public.propriedades p on p.id = ol.propriedade_id
   where ol.id = p_oferta_id and ol.retirada_em is null and p.status = 'aprovada'
     and (ol.verificacao = 'declarado' or exists (
       select 1 from public.inspecoes_lote i where i.lote_id = ol.id and i.resultado = 'aprovado'))
     and least(ol.validade, ol.retirada_fim) >= hoje;
  if not found then raise sqlstate 'PT404' using message = 'Oferta indisponível'; end if;
  if o.uf <> 'SP' then raise sqlstate 'PT422' using message = 'Piloto só atende operações dentro de SP'; end if;
  if p_quantidade is null or p_quantidade <= 0 or p_quantidade > o.quantidade then
    raise sqlstate 'PT422' using message = 'Quantidade acima do disponível';
  end if;
  if p_prazo_entrega is null or p_prazo_entrega < hoje then
    raise sqlstate 'PT422' using message = 'Prazo de entrega no passado';
  end if;

  insert into public.cotacoes (
    oferta_id, organizacao_id, produtora_organizacao_id, quantidade, unidade,
    entrega_cidade, entrega_uf, prazo_entrega, mensagem, solicitada_por
  ) values (
    p_oferta_id, p_organizacao_id, o.organizacao_id, p_quantidade, o.unidade,
    trim(p_entrega_cidade), upper(trim(p_entrega_uf)), p_prazo_entrega, nullif(trim(p_mensagem), ''), auth.uid()
  )
  on conflict (oferta_id, organizacao_id) where status = 'solicitada' do nothing
  returning id into c;
  if c is null then
    select id into c from public.cotacoes
     where oferta_id = p_oferta_id and organizacao_id = p_organizacao_id and status = 'solicitada';
  end if;
  return c;
end;
$$;

-- Leitura com nomes (oferta, comprador, fornecedor) para as listas dos dois apps; a RLS da tabela decide o que aparece.
create function public.listar_cotacoes(p_organizacao_id uuid)
returns table (
  id uuid, oferta_id uuid, produto text, comprador text, fornecedor text,
  quantidade numeric, unidade text, entrega_cidade text, entrega_uf text,
  prazo_entrega date, mensagem text, status text, solicitada_em timestamptz
) language sql stable security definer set search_path = '' as $$
  select c.id, c.oferta_id, ol.produto, oc.nome, op.nome,
         c.quantidade, c.unidade, c.entrega_cidade, c.entrega_uf,
         c.prazo_entrega, c.mensagem, c.status, c.solicitada_em
    from public.cotacoes c
    join public.ofertas_lote ol on ol.id = c.oferta_id
    join public.organizacoes oc on oc.id = c.organizacao_id
    join public.organizacoes op on op.id = c.produtora_organizacao_id
   where agrodireto_privado.e_membro(p_organizacao_id)
     and p_organizacao_id in (c.organizacao_id, c.produtora_organizacao_id)
   order by c.solicitada_em desc, c.id
   limit 200;
$$;

revoke all on function public.solicitar_cotacao(uuid, uuid, numeric, text, text, date, text),
  public.listar_cotacoes(uuid) from public, anon, authenticated;
grant execute on function public.solicitar_cotacao(uuid, uuid, numeric, text, text, date, text),
  public.listar_cotacoes(uuid) to authenticated;

commit;
