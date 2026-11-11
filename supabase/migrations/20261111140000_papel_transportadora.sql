begin;

-- B04: ações por papel. e_titular é helper genérico (qualquer organização), reutilizado no B01.

create function agrodireto_privado.e_titular(p_organizacao uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.membros_organizacao
     where organizacao_id = p_organizacao and usuario_id = auth.uid() and papel = 'titular'
  );
$$;
revoke all on function agrodireto_privado.e_titular(uuid) from public, anon, authenticated;
grant execute on function agrodireto_privado.e_titular(uuid) to authenticated;

-- Só o titular reenvia o cadastro da transportadora. Mesma assinatura: grants preservados.
-- A frota (salvar_veiculo/salvar_motorista) continua aberta a qualquer membro.
create or replace function public.reenviar_cadastro_transportadora(
  p_organizacao_id uuid, p_enviada_em timestamptz,
  p_razao_social text, p_cnpj text, p_contato_nome text, p_contato_telefone text,
  p_cidade text, p_uf text, p_ufs_atendidas text[], p_tipos_carga text[]
) returns void language plpgsql security definer set search_path = '' as $$
begin
  -- Membro recebe recusa clara; quem é de fora segue recebendo PT409 (não revela a organização).
  if agrodireto_privado.e_membro(p_organizacao_id) and not agrodireto_privado.e_titular(p_organizacao_id) then
    raise insufficient_privilege using message = 'Só o titular reenvia o cadastro';
  end if;
  update public.cadastros_transportadora
     set razao_social = trim(p_razao_social), cnpj = upper(regexp_replace(p_cnpj, '[^0-9A-Za-z]', '', 'g')),
         contato_nome = trim(p_contato_nome), contato_telefone = regexp_replace(p_contato_telefone, '[^0-9]', '', 'g'),
         cidade = trim(p_cidade), uf = upper(trim(p_uf)),
         ufs_atendidas = agrodireto_privado.lista_normalizada(p_ufs_atendidas, true),
         tipos_carga = agrodireto_privado.lista_normalizada(p_tipos_carga, false),
         status = 'em_analise', enviada_em = clock_timestamp(), motivo_ajuste = null,
         ajuste_solicitado_em = null, ajuste_solicitado_por = null
   where organizacao_id = p_organizacao_id and agrodireto_privado.e_titular(organizacao_id)
     and status = 'ajustes_solicitados' and enviada_em = p_enviada_em;
  if not found then
    raise sqlstate 'PT409' using message = 'O cadastro mudou. Abra a versão atual.';
  end if;
  update public.organizacoes set nome = trim(p_razao_social) where id = p_organizacao_id;
end;
$$;

commit;
