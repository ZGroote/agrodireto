import type { CadastroTransportadora } from './transportadora';
import { supabase } from './supabase';

// Mesmo contrato do Agricultor (DOC 030 e 032), com o perfil transportadora e o status do cadastro da empresa.
export type Vinculo = {
  organizacao_id: string;
  nome: string;
  papel: 'titular' | 'membro';
  status_cadastro: CadastroTransportadora['status'] | null;
};

export const mensagemEscolherEmpresa = 'Escolha a empresa em uso para continuar.';

function cliente() {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  return supabase;
}

/** Vínculos do usuário com transportadoras. */
export async function listarVinculos(): Promise<Vinculo[]> {
  const { data, error } = await cliente().rpc('listar_meus_vinculos');
  if (error) throw error;
  return (data as (Vinculo & { perfil: string })[])
    .filter((v) => v.perfil === 'transportadora')
    .map(({ organizacao_id, nome, papel, status_cadastro }) => ({ organizacao_id, nome, papel, status_cadastro }));
}

/** Empresa escolhida pelo usuário (registro do servidor) ou null. */
export async function contextoAtual(): Promise<string | null> {
  const { data, error } = await cliente().rpc('contexto_atual', { p_perfil: 'transportadora' });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/**
 * Empresa em que o app lê e grava. Sem escolha e sem vínculo: null (o primeiro envio cria a empresa).
 * Sem escolha e com vínculo: pede a escolha; o servidor não escolhe pelo usuário.
 */
export async function organizacaoEmUso(): Promise<string | null> {
  const atual = await contextoAtual();
  if (atual) return atual;
  if ((await listarVinculos()).length > 0) throw new Error(mensagemEscolherEmpresa);
  return null;
}

export async function trocarContexto(organizacao: string) {
  const { error } = await cliente().rpc('trocar_contexto', { p_perfil: 'transportadora', p_organizacao: organizacao });
  if (error) throw new Error('Não foi possível trocar de empresa. Tente novamente.');
}

/** Resposta igual para conta existente ou não (DOC 027): o app não revela e-mails. */
export async function incluirMembro(organizacao: string, email: string) {
  const limpo = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) throw new Error('Confira o e-mail.');
  const { error } = await cliente().rpc('incluir_membro', { p_organizacao: organizacao, p_email: limpo });
  if (error) throw new Error('Não foi possível processar a inclusão. Tente novamente.');
}
