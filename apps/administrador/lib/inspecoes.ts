import type { ResultadoInspecao } from '@agrodireto/dominio';
import { supabase } from './supabase';

export type LoteInspecao = {
  lote_id: string;
  produto: string;
  quantidade: number;
  unidade: string;
  resultado: ResultadoInspecao['resultado'] | null;
  inspecionada_em: string | null;
  inspetor_id: string | null;
  embalagem_conforme: boolean | null;
  qualidade_conforme: boolean | null;
  temperatura: number | null;
  evidencias_aprovadas: string[];
};

export async function listarLotesInspecao(pagina: number, lote?: string): Promise<LoteInspecao[]> {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const { data, error } = await supabase.rpc('listar_lotes_inspecao', {
    p_lote: lote ?? null,
    p_pagina: pagina,
  });
  if (error || !Array.isArray(data)) throw new Error('Não foi possível consultar os lotes para inspeção.');
  return data as LoteInspecao[];
}

export async function concluirInspecao(lote: string, embalagem: boolean, qualidade: boolean, temperatura: string, resultado: ResultadoInspecao['resultado']) {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const valor = temperatura.trim();
  if (valor && !/^-?\d+(?:[.,]\d)?$/.test(valor)) throw new Error('Informe a temperatura com até uma casa decimal.');
  const { error } = await supabase.rpc('concluir_inspecao_lote', {
    p_lote: lote,
    p_embalagem: embalagem,
    p_qualidade: qualidade,
    p_temperatura: valor ? Number(valor.replace(',', '.')) : null,
    p_resultado: resultado,
  });
  if (error?.code === 'PT409' || error?.code === 'PT422') throw new Error(error.message);
  if (error) throw new Error('Não foi possível concluir a inspeção. Atualize a tela antes de tentar novamente.');
}
