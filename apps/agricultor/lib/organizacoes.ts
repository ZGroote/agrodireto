import { supabase } from './supabase';

export type Vinculo = {
  organizacao_id: string;
  nome: string;
  papel: 'titular' | 'membro';
  propriedades_aprovadas: number;
};

export const mensagemEscolherOrganizacao = 'Escolha a organização em Perfil > Organização.';

function cliente() {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  return supabase;
}

/** Vínculos do usuário com organizações de produtor. */
export async function listarVinculos(): Promise<Vinculo[]> {
  const { data, error } = await cliente().rpc('listar_meus_vinculos');
  if (error) throw error;
  return (data as (Vinculo & { perfil: string })[])
    .filter((v) => v.perfil === 'produtor')
    .map(({ organizacao_id, nome, papel, propriedades_aprovadas }) => ({ organizacao_id, nome, papel, propriedades_aprovadas: Number(propriedades_aprovadas) }));
}

/** Organização escolhida pelo usuário (registro do servidor) ou null. */
export async function contextoAtual(): Promise<string | null> {
  const { data, error } = await cliente().rpc('contexto_atual', { p_perfil: 'produtor' });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/**
 * Organização em que o app lê e grava. Sem escolha e sem vínculo: null (o primeiro envio cria a organização).
 * Sem escolha e com vínculo: pede a escolha; o servidor não escolhe pelo usuário.
 */
export async function organizacaoEmUso(): Promise<string | null> {
  const atual = await contextoAtual();
  if (atual) return atual;
  if ((await listarVinculos()).length > 0) throw new Error(mensagemEscolherOrganizacao);
  return null;
}

export async function trocarContexto(organizacao: string) {
  const { error } = await cliente().rpc('trocar_contexto', { p_perfil: 'produtor', p_organizacao: organizacao });
  if (error) throw new Error('Não foi possível trocar de organização. Tente novamente.');
}

/** Resposta igual para conta existente ou não (DOC 027): o app não revela e-mails. */
export async function incluirMembro(organizacao: string, email: string) {
  const limpo = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) throw new Error('Confira o e-mail.');
  const { error } = await cliente().rpc('incluir_membro', { p_organizacao: organizacao, p_email: limpo });
  if (error) throw new Error('Não foi possível processar a inclusão. Tente novamente.');
}
