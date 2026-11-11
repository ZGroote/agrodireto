begin;

create table public.inspecoes_lote (
  lote_id uuid primary key references public.ofertas_lote(id) on delete cascade,
  inspetor_id uuid not null references auth.users(id),
  inspecionada_em timestamptz not null default now(),
  embalagem_conforme boolean not null,
  qualidade_conforme boolean not null,
  temperatura numeric(4,1) check (temperatura between -50 and 80),
  resultado text not null check (resultado in ('aprovado','ressalvas','reprovado')),
  evidencias_aprovadas text[] not null,
  check (resultado <> 'aprovado' or (embalagem_conforme and qualidade_conforme))
);

alter table public.inspecoes_lote enable row level security;
revoke all on public.inspecoes_lote from public, anon, authenticated;

create function public.listar_lotes_inspecao(p_lote uuid default null, p_pagina integer default 0)
returns table (
  lote_id uuid, produto text, quantidade numeric, unidade text, resultado text,
  inspecionada_em timestamptz, inspetor_id uuid, embalagem_conforme boolean, qualidade_conforme boolean,
  temperatura numeric, evidencias_aprovadas text[]
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.acesso_equipe() is distinct from 'autorizado' then raise insufficient_privilege; end if;

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

create function public.concluir_inspecao_lote(
  p_lote uuid, p_embalagem boolean, p_qualidade boolean, p_temperatura numeric, p_resultado text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.acesso_equipe() is distinct from 'autorizado' then raise insufficient_privilege; end if;
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

create function public.ler_resultado_inspecao_lote(p_lote uuid)
returns table (resultado text, inspecionada_em timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.ofertas_lote where id = p_lote and produtor_id = auth.uid()) then
    if not exists (select 1 from agrodireto_privado.compradores_catalogo where usuario_id = auth.uid()) then return; end if;
    if not exists (select 1 from public.consultar_catalogo(p_lote, '', 0)) then return; end if;
  end if;
  return query select i.resultado, i.inspecionada_em from public.inspecoes_lote i where i.lote_id = p_lote;
end;
$$;

revoke all on function public.listar_lotes_inspecao(uuid,integer),
  public.concluir_inspecao_lote(uuid,boolean,boolean,numeric,text),
  public.ler_resultado_inspecao_lote(uuid) from public, anon, authenticated;
grant execute on function public.listar_lotes_inspecao(uuid,integer),
  public.concluir_inspecao_lote(uuid,boolean,boolean,numeric,text),
  public.ler_resultado_inspecao_lote(uuid) to authenticated;

commit;
