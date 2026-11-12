import { supabase } from './supabase';

export type DemandaAberta = {
  id: string;
  catalogoId: string;
  cultura: string;
  segmento: string;
  comprador: string;
  cidade: string;
  uf: string;
  quantidade: number;
  unidade: string;
  /** dd/mm/aaaa */
  prazo: string;
  observacao: string;
};

type LinhaDemandaAberta = {
  id: string;
  catalogo_id: string;
  cultura: string;
  segmento: string;
  comprador: string;
  cidade: string;
  uf: string;
  quantidade: number;
  unidade: string;
  prazo: string;
  observacao: string;
};

function deISO(data: string | null) {
  return data ? data.split('-').reverse().join('/') : '';
}

export async function listarDemandasAbertas(busca = '', pagina = 0): Promise<DemandaAberta[]> {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const { data, error } = await supabase.rpc('listar_demandas_abertas', {
    p_busca: busca.trim(),
    p_pagina: pagina,
  });
  if (error?.code === 'PT403') {
    throw new Error('As demandas ficam disponíveis quando sua propriedade é aprovada.');
  }
  if (error) {
    throw new Error('Não foi possível carregar as demandas abertas.');
  }
  return ((data as LinhaDemandaAberta[] | null) ?? []).map((l) => ({
    id: l.id,
    catalogoId: l.catalogo_id,
    cultura: l.cultura,
    segmento: l.segmento,
    comprador: l.comprador,
    cidade: l.cidade,
    uf: l.uf,
    quantidade: Number(l.quantidade),
    unidade: l.unidade,
    prazo: deISO(l.prazo),
    observacao: l.observacao,
  }));
}
