import { supabase } from './supabase';

export type Unidade = 'kg' | 'cx' | 't';

export type ItemCatalogo = { id: string; nome: string; unidades: Unidade[] };

export type Previsao = {
  unidade: Unidade;
  estimativa: number;
  /** dd/mm/aaaa */
  colheita: string;
  minimo?: number;
  maximo?: number;
};

export type DadosCultura = {
  propriedadeId: string;
  catalogoId: string;
  variedade: string;
  area: string;
  /** dd/mm/aaaa ou vazio */
  plantio: string;
  etapa: string;
};

export type Cultura = DadosCultura & {
  id: string;
  /** Nome no catálogo */
  cultura: string;
  unidades: Unidade[];
  previsao?: Previsao;
};

type Linha = {
  id: string; propriedade_id: string; catalogo_id: string; variedade: string; area_ha: number;
  plantio: string | null; etapa: string; unidade: Unidade | null; estimativa: number | null;
  minimo: number | null; maximo: number | null; colheita: string | null;
  catalogo_culturas: { nome: string; unidades: Unidade[] } | null;
};

export function lerDataColheita(texto: string): Date | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (data.getFullYear() !== Number(ano) || data.getMonth() !== Number(mes) - 1 || data.getDate() !== Number(dia)) {
    return null;
  }
  return data;
}

/** dd/mm/aaaa → aaaa-mm-dd; null se a data não existir. */
function paraISO(texto: string) {
  return lerDataColheita(texto) ? texto.split('/').reverse().join('-') : null;
}

/** aaaa-mm-dd → dd/mm/aaaa */
function deISO(data: string | null) {
  return data ? data.split('-').reverse().join('/') : '';
}

export function areaValida(area: string) {
  const texto = area.trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(texto)) return false;
  const numero = Number(texto.replace(',', '.'));
  return Number.isFinite(numero) && numero > 0 && numero <= 1_000_000;
}

const quantidadeValida = (valor: unknown): valor is number =>
  typeof valor === 'number' && Number.isSafeInteger(valor) && valor > 0 && valor <= 1_000_000_000;

/** Mesmas regras do banco (salvar_previsao). A unidade é conferida contra o catálogo. */
export function previsaoValida(previsao: Previsao, unidades: Unidade[]) {
  const { unidade, estimativa, colheita, minimo, maximo } = previsao;
  if (!unidades.includes(unidade) || !quantidadeValida(estimativa) || !lerDataColheita(colheita)) return false;
  if (minimo === undefined && maximo === undefined) return true;
  return quantidadeValida(minimo) && quantidadeValida(maximo) && minimo <= estimativa && estimativa <= maximo;
}

export function formatarQuantidade({ estimativa, unidade }: Previsao) {
  return `${estimativa.toLocaleString('pt-BR')} ${unidade}`;
}

function cliente() {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  return supabase;
}

export async function lerCatalogo(): Promise<ItemCatalogo[]> {
  const { data, error } = await cliente().from('catalogo_culturas')
    .select('id, nome, unidades').eq('ativo', true).order('nome').returns<ItemCatalogo[]>();
  if (error) throw error;
  return data;
}

export async function lerPropriedades(): Promise<{ id: string; nome: string }[]> {
  const { data, error } = await cliente().from('propriedades')
    .select('id, nome').order('enviada_em').order('id').returns<{ id: string; nome: string }[]>();
  if (error) throw error;
  return data;
}

export async function lerCulturas(): Promise<Cultura[]> {
  const { data, error } = await cliente().from('culturas')
    .select('id, propriedade_id, catalogo_id, variedade, area_ha, plantio, etapa, unidade, estimativa, minimo, maximo, colheita, catalogo_culturas(nome, unidades)')
    .order('criada_em').order('id').returns<Linha[]>();
  if (error) throw error;
  return data.map((l) => ({
    id: l.id,
    propriedadeId: l.propriedade_id,
    catalogoId: l.catalogo_id,
    cultura: l.catalogo_culturas?.nome ?? '',
    unidades: l.catalogo_culturas?.unidades ?? [],
    variedade: l.variedade,
    area: String(l.area_ha).replace('.', ','),
    plantio: deISO(l.plantio),
    etapa: l.etapa,
    previsao: l.unidade && l.estimativa !== null && l.colheita ? {
      unidade: l.unidade,
      estimativa: Number(l.estimativa),
      colheita: deISO(l.colheita),
      minimo: l.minimo ?? undefined,
      maximo: l.maximo ?? undefined,
    } : undefined,
  }));
}

function mensagem(codigo: string | undefined, padrao: string) {
  if (codigo === 'PT422') return 'Escolha uma cultura e uma unidade do catálogo.';
  if (codigo === 'PT404') return 'A cultura não está mais disponível. Volte e abra a lista de novo.';
  if (codigo === '42501') return 'Esta propriedade não está ligada à sua conta.';
  if (codigo === '23514') return 'Confira os valores informados.';
  return padrao;
}

export async function salvarCultura(dados: DadosCultura, id?: string) {
  if (!dados.propriedadeId || !dados.catalogoId || !areaValida(dados.area)) {
    throw new Error('Escolha a cultura e informe a área.');
  }
  const plantio = dados.plantio ? paraISO(dados.plantio) : null;
  if (dados.plantio && !plantio) throw new Error('Data de plantio inválida.');
  const { error } = await cliente().rpc('salvar_cultura', {
    p_id: id ?? null,
    p_propriedade: dados.propriedadeId,
    p_catalogo: dados.catalogoId,
    p_variedade: dados.variedade,
    p_area: Number(dados.area.trim().replace(',', '.')),
    p_plantio: plantio,
    p_etapa: dados.etapa,
  });
  if (error) throw new Error(mensagem(error.code, 'Não foi possível salvar a cultura. Tente novamente.'));
}

export async function salvarPrevisao(cultura: Cultura, previsao: Previsao) {
  if (!previsaoValida(previsao, cultura.unidades)) throw new Error('Previsão inválida.');
  const { error } = await cliente().rpc('salvar_previsao', {
    p_id: cultura.id,
    p_unidade: previsao.unidade,
    p_estimativa: previsao.estimativa,
    p_minimo: previsao.minimo ?? null,
    p_maximo: previsao.maximo ?? null,
    p_colheita: paraISO(previsao.colheita),
  });
  if (error) throw new Error(mensagem(error.code, 'Não foi possível salvar a previsão. Tente novamente.'));
}
