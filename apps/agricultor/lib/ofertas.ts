import { formatarPeriodo, lerPeriodo } from '@agrodireto/ui';
import type { ResultadoInspecao } from '@agrodireto/dominio';
import { lerDataColheita } from '@/lib/culturas';
import { precoValido } from '@/lote/LoteDraftContext';
import type { LoteDraft } from '@/lote/rascunhosLote';
import { supabase } from './supabase';

type OfertaPropria = {
  id: string;
  rascunho_id: string;
  produto: string;
  quantidade: number;
  unidade: LoteDraft['unidade'];
  preco_centavos: number;
  retirada_em: string | null;
  validade: string;
};

const camposOferta = 'id,rascunho_id,produto,quantidade,unidade,preco_centavos,retirada_em,validade';

export async function listarOfertasProprias() {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('ofertas_lote').select(camposOferta)
    .order('publicada_em', { ascending: false }).returns<OfertaPropria[]>();
  if (error) throw error;
  return data;
}

export async function lerOfertaPropria(id: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('ofertas_lote').select(camposOferta)
    .eq('id', id).maybeSingle<OfertaPropria>();
  if (error) throw error;
  return data;
}

function dataISO(data: Date) {
  return [data.getFullYear(), String(data.getMonth() + 1).padStart(2, '0'), String(data.getDate()).padStart(2, '0')].join('-');
}

export async function lerPublicacao(rascunho: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('ofertas_lote')
    .select('id,retirada_em').eq('rascunho_id', rascunho).maybeSingle<{ id: string; retirada_em: string | null }>();
  if (error) throw error;
  return data;
}

export async function publicarOferta(id: string, lote: LoteDraft) {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const quantidade = lote.quantidade.trim();
  const retirada = lerPeriodo(lote.retirada);
  const validade = lerDataColheita(lote.validade);
  const colheita = lote.dataColheita ? lerDataColheita(lote.dataColheita) : null;
  if (!lote.produto?.trim() || !/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(quantidade) ||
    Number(quantidade.replace(/\./g, '')) <= 0 || !precoValido(lote.precoUnitario) ||
    !retirada || formatarPeriodo(...retirada) !== lote.retirada.trim() ||
    !validade || (lote.dataColheita && !colheita)) {
    throw new Error('Confira produto, quantidade, preço, datas de retirada e validade.');
  }
  const { error } = await supabase.rpc('publicar_oferta_lote', {
    p_rascunho_id: id,
    p_propriedade_id: lote.propriedadeId,
    p_produto: lote.produto,
    p_quantidade: Number(quantidade.replace(/\./g, '')),
    p_unidade: lote.unidade,
    p_preco_centavos: Math.round(Number(lote.precoUnitario.trim().replace(',', '.')) * 100),
    p_colheita: colheita ? dataISO(colheita) : null,
    p_retirada_inicio: dataISO(retirada[0]),
    p_retirada_fim: dataISO(retirada[1]),
    p_validade: dataISO(validade),
    p_padrao: lote.padrao ?? '',
    p_calibre: lote.calibre ?? '',
    p_embalagem: lote.embalagem ?? '',
    p_condicoes: lote.condicoes,
  });
  if (error?.code === 'PT403' || error?.code === 'PT422') throw new Error(error.message);
  if (error?.code === '23514') throw new Error('Confira os limites de preço, quantidade, datas e campos do lote.');
  if (error) throw new Error('Não foi possível confirmar a publicação. Tente novamente.');
}

export async function retirarOferta(id: string) {
  if (!supabase) throw new Error();
  const { error } = await supabase.rpc('retirar_oferta_lote', { p_id: id });
  if (error) throw error;
}

export async function lerResultadoInspecao(id: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.rpc('ler_resultado_inspecao_lote', { p_lote: id })
    .maybeSingle<ResultadoInspecao>();
  if (error) throw error;
  return data;
}
