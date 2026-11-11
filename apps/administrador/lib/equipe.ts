import { supabase } from './supabase';

export const papeis = [
  { value: 'geral', label: 'Geral' },
  { value: 'cadastral', label: 'Cadastral' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'logistico', label: 'Logístico' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'suporte', label: 'Suporte' },
] as const;
export type Papel = (typeof papeis)[number]['value'];

export const acoes = [
  { value: 'escrever_cadastros', label: 'Aprovar e pedir ajustes em cadastros' },
  { value: 'revisar_ofertas', label: 'Revisar evidências e inspecionar lotes' },
  { value: 'ler_cadastros', label: 'Ver cadastros' },
  { value: 'ler_ofertas', label: 'Ver mídias e culturas' },
  { value: 'ler_frota', label: 'Ver veículos e motoristas' },
  { value: 'ler_equipe', label: 'Ver equipe e histórico de acessos' },
  { value: 'gerir_equipe', label: 'Conceder e revogar acessos' },
] as const;
/** 'sem_acao_no_servidor': tela que ainda não chama o servidor; como no equipe_pode, só o geral (menor privilégio). */
export type Acao = (typeof acoes)[number]['value'] | 'sem_acao_no_servidor';

/**
 * Cópia da matriz de public.equipe_pode (migration 20261111210000), só para esconder telas e mostrar a 18.
 * Quem decide é o servidor. O teste test/equipe.test.cjs falha se esta cópia divergir da migration.
 */
export const MATRIZ: Record<Exclude<Papel, 'geral'>, readonly Acao[]> = {
  cadastral: ['escrever_cadastros', 'revisar_ofertas', 'ler_cadastros', 'ler_ofertas', 'ler_frota'],
  comercial: ['ler_cadastros', 'ler_ofertas'],
  logistico: ['ler_cadastros', 'ler_frota'],
  financeiro: ['ler_cadastros'],
  auditor: ['ler_cadastros', 'ler_ofertas', 'ler_frota', 'ler_equipe'],
  suporte: ['ler_cadastros'],
};

export const pode = (papel: Papel | null, acao: Acao) =>
  papel === 'geral' || (!!papel && MATRIZ[papel].includes(acao));

function cliente() {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  return supabase;
}

/** Papel do usuário quando o acesso está autorizado (vínculo + segundo fator quando exigido); senão null. */
export async function papelEquipe(): Promise<Papel | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('papel_equipe');
  if (error) throw error;
  return papeis.some((p) => p.value === data) ? data as Papel : null;
}

export type MembroEquipe = { usuario_id: string; email: string; papel: Papel; concedido_em: string };

export async function listarEquipe(): Promise<MembroEquipe[]> {
  const { data, error } = await cliente().rpc('listar_equipe');
  if (error) throw new Error('Não foi possível consultar a equipe.');
  return data as MembroEquipe[];
}

function erroGestao(error: { code?: string }): never {
  if (error.code === '42501') throw new Error('Sem permissão para esta alteração. A própria conta não pode ser alterada.');
  if (error.code === 'PT422') throw new Error('Escolha um papel válido.');
  throw new Error('Não foi possível concluir. Tente novamente.');
}

/** Concede ou troca o papel pelo e-mail. A equipe geral pode saber se a conta existe. */
export async function concederAcesso(email: string, papel: Papel): Promise<string> {
  const limpo = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) throw new Error('Confira o e-mail.');
  const { data, error } = await cliente().rpc('conceder_acesso_equipe', { p_email: limpo, p_papel: papel });
  if (error) erroGestao(error);
  return data === true ? 'Acesso concedido.' : 'Nenhuma conta com este e-mail.';
}

export async function revogarAcesso(usuario: string) {
  const { error } = await cliente().rpc('revogar_acesso_equipe', { p_usuario: usuario });
  if (error) erroGestao(error);
}
