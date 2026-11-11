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

export type FormCotacao = { quantidade: string; cidade: string; prazo: string; mensagem: string };

function cliente() {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  return supabase;
}

/** "05/03/2027" → "2027-03-05"; inválida → null. */
function dataIso(texto: string) {
  const m = texto.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return d.getDate() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** Empresa compradora explícita: o servidor confere vínculo e aprovação DELA (DOC 032). */
export async function solicitarCotacao(organizacao: string, oferta: string, form: FormCotacao) {
  const quantidade = Number(form.quantidade.replace(/\./g, '').replace(',', '.'));
  const prazo = dataIso(form.prazo);
  if (!(quantidade > 0)) throw new Error('Informe a quantidade.');
  if (form.cidade.trim().length < 2) throw new Error('Informe a cidade de entrega.');
  if (!prazo) throw new Error('Informe a data de entrega (dd/mm/aaaa).');
  const { data, error } = await cliente().rpc('solicitar_cotacao', {
    p_organizacao_id: organizacao, p_oferta_id: oferta, p_quantidade: quantidade,
    p_entrega_cidade: form.cidade, p_entrega_uf: 'SP', p_prazo_entrega: prazo, p_mensagem: form.mensagem,
  });
  if (error?.code === '42501') throw new Error('A empresa em uso precisa estar aprovada para pedir cotação.');
  if (error?.code === 'PT404') throw new Error('Esta oferta não está mais disponível.');
  if (error?.code === 'PT422') throw new Error(`${error.message}. Confira os dados.`);
  if (error) throw new Error('Não foi possível enviar a cotação. Tente novamente.');
  return data as string;
}

export async function listarCotacoes(organizacao: string): Promise<Cotacao[]> {
  const { data, error } = await cliente().rpc('listar_cotacoes', { p_organizacao_id: organizacao });
  if (error) throw new Error('Não foi possível carregar as cotações.');
  return data as Cotacao[];
}
