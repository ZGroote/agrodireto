begin;

create table public.equipe_agrodireto (
  usuario_id uuid primary key references auth.users (id) on delete cascade
);

create table public.propriedades (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 120),
  cidade text not null check (char_length(cidade) between 2 and 100),
  uf text not null check (uf in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  area numeric not null check (area > 0 and area <= 10000000),
  culturas text not null check (char_length(culturas) between 1 and 500),
  status text not null default 'em_analise' check (status in ('em_analise','aprovada')),
  enviada_em timestamptz not null default now(),
  aprovada_em timestamptz,
  aprovada_por uuid references auth.users (id) on delete set null
);

alter table public.equipe_agrodireto enable row level security;
alter table public.propriedades enable row level security;
revoke all on public.equipe_agrodireto, public.propriedades from public, anon, authenticated;
grant select on public.equipe_agrodireto, public.propriedades to authenticated;

create policy equipe_le_proprio_vinculo on public.equipe_agrodireto
  for select to authenticated using (usuario_id = (select auth.uid()));

create policy propriedades_leitura on public.propriedades for select to authenticated using (
  usuario_id = (select auth.uid()) or (
    (select auth.jwt()->>'aal') = 'aal2'
    and exists (select 1 from public.equipe_agrodireto where usuario_id = (select auth.uid()))
  )
);

create function public.enviar_propriedade(p_nome text, p_cidade text, p_uf text, p_area numeric, p_culturas text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or exists (
    select 1 from public.equipe_agrodireto where usuario_id = auth.uid()
  ) then
    raise insufficient_privilege using message = 'Envio não autorizado';
  end if;
  insert into public.propriedades (usuario_id, nome, cidade, uf, area, culturas)
  values (auth.uid(), trim(p_nome), trim(p_cidade), upper(trim(p_uf)), p_area, trim(p_culturas))
  on conflict (usuario_id) do nothing;
end;
$$;

create function public.aprovar_propriedade(p_usuario_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or (auth.jwt()->>'aal') is distinct from 'aal2' or not exists (
    select 1 from public.equipe_agrodireto where usuario_id = auth.uid()
  ) then
    raise insufficient_privilege using message = 'Aprovação não autorizada';
  end if;
  update public.propriedades
     set status = 'aprovada', aprovada_em = now(), aprovada_por = auth.uid()
   where usuario_id = p_usuario_id and status = 'em_analise';
  if not found and not exists (select 1 from public.propriedades where usuario_id = p_usuario_id) then
    raise no_data_found using message = 'Propriedade não encontrada';
  end if;
end;
$$;

revoke all on function public.enviar_propriedade(text,text,text,numeric,text), public.aprovar_propriedade(uuid) from public, anon, authenticated;
grant execute on function public.enviar_propriedade(text,text,text,numeric,text), public.aprovar_propriedade(uuid) to authenticated;

commit;
