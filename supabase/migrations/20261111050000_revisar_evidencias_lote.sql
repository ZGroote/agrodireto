begin;

alter table public.evidencias_lote
  add column solicitada_em timestamptz,
  add column revisada_em timestamptz,
  add column revisada_por uuid references auth.users(id) on delete set null,
  add column revisao text check (revisao in ('aprovada','rejeitada')),
  add column motivo_rejeicao text check (char_length(motivo_rejeicao) between 1 and 500),
  add constraint evidencias_revisao_motivo check (
    (revisao is not distinct from 'rejeitada') = (motivo_rejeicao is not null)
  );

create policy evidencias_lote_equipe_pendentes on public.evidencias_lote
  for select to authenticated using (
    enviada_em is not null and solicitada_em is not null and revisao is null
    and (select public.acesso_equipe()) = 'autorizado'
  );

create function public.solicitar_revisao_evidencia(p_lote uuid, p_chave text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.evidencias_lote e set solicitada_em = coalesce(e.solicitada_em, now())
  from public.ofertas_lote o
  where e.lote_id = p_lote and e.chave = p_chave and e.enviada_em is not null and e.revisao is null
    and o.id = e.lote_id and o.produtor_id = auth.uid() and o.retirada_em is null;
  if not found then
    raise sqlstate 'PT409' using message = 'A evidência não está disponível para revisão.';
  end if;
end;
$$;

create function public.listar_evidencias_pendentes()
returns table (lote_id uuid, chave text, arquivo text, tipo text, produto text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.acesso_equipe() <> 'autorizado' then raise insufficient_privilege; end if;
  return query
    select e.lote_id, e.chave, e.arquivo, e.tipo, o.produto
    from public.evidencias_lote e join public.ofertas_lote o on o.id = e.lote_id
    where e.enviada_em is not null and e.solicitada_em is not null and e.revisao is null
    order by e.solicitada_em, e.lote_id, e.chave limit 25;
end;
$$;

create function public.revisar_evidencia_lote(p_lote uuid, p_chave text, p_aprovada boolean, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.acesso_equipe() <> 'autorizado' then raise insufficient_privilege; end if;
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

revoke all on function public.solicitar_revisao_evidencia(uuid,text), public.listar_evidencias_pendentes(),
  public.revisar_evidencia_lote(uuid,text,boolean,text) from public, anon, authenticated;
grant execute on function public.solicitar_revisao_evidencia(uuid,text), public.listar_evidencias_pendentes(),
  public.revisar_evidencia_lote(uuid,text,boolean,text) to authenticated;

commit;
