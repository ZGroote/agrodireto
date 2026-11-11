import { supabase } from './supabase';

export type StatusCotacao = 'solicitada' | 'respondida' | 'recusada' | 'expirada';

export type Cotacao = {
  id: string;
  oferta_id: string;
  produto: string;
  comprador: string;
  fornecedor: string;
  quantidade: number;
  unidade: 'kg' | 'cx' | 't';
  entrega_cidade: string;
  entrega_uf: string;
  prazo_entrega: string;
  mensagem: string | null;
  status: StatusCotacao;
  solicitada_em: string;
};

/** Cotações recebidas pela organização produtora (só leitura; responder é F02). */
export async function listarCotacoes(organizacao: string): Promise<Cotacao[]> {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const { data, error } = await supabase.rpc('listar_cotacoes', { p_organizacao_id: organizacao });
  if (error) throw new Error('Não foi possível carregar as cotações.');
  return data as Cotacao[];
}
