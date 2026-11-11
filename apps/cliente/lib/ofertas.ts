import type { OfertaCatalogo, ResultadoInspecao } from '@agrodireto/dominio';
import { supabase } from './supabase';

export async function consultarCatalogo(busca = '', pagina = 0, id?: string): Promise<OfertaCatalogo[]> {
  if (!supabase) throw new Error('Catálogo indisponível neste ambiente.');
  const { data, error } = await supabase.rpc('consultar_catalogo', {
    p_busca: busca.trim(), p_pagina: pagina, p_id: id ?? null,
  });
  if (error?.code === 'PT403') throw new Error(error.message);
  if (error) throw new Error('Não foi possível consultar o catálogo. Tente novamente.');
  if (!Array.isArray(data)) throw new Error('Resposta do catálogo indisponível.');
  return data as OfertaCatalogo[];
}

export async function lerResultadoInspecao(id: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.rpc('ler_resultado_inspecao_lote', { p_lote: id })
    .maybeSingle<ResultadoInspecao>();
  if (error) throw error;
  return data;
}
