begin;

create schema agrodireto_privado;
revoke all on schema agrodireto_privado from public, anon, authenticated;

create table agrodireto_privado.seguranca_equipe (
  unica boolean primary key default true check (unica),
  exige_mfa boolean not null default true
);
alter table agrodireto_privado.seguranca_equipe enable row level security;
revoke all on agrodireto_privado.seguranca_equipe from public, anon, authenticated;
insert into agrodireto_privado.seguranca_equipe default values;

create function public.acesso_equipe()
returns text language sql stable security definer set search_path = '' as $$
  select case
    when not exists (
      select 1 from public.equipe_agrodireto where usuario_id = auth.uid()
    ) then 'sem_acesso'
    when (select exige_mfa from agrodireto_privado.seguranca_equipe where unica) is distinct from false
         and (auth.jwt()->>'aal') is distinct from 'aal2' then 'requer_mfa'
    else 'autorizado'
  end;
$$;

revoke all on function public.acesso_equipe() from public, anon, authenticated;
grant execute on function public.acesso_equipe() to authenticated;

alter policy propriedades_leitura on public.propriedades using (
  usuario_id = (select auth.uid()) or (select public.acesso_equipe()) = 'autorizado'
);

create or replace function public.aprovar_propriedade(p_usuario_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.acesso_equipe() <> 'autorizado' then
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

commit;
