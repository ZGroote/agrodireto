import { organizacaoEmUso } from './organizacoes';
import { supabase } from './supabase';

export type UnidadeDemanda = 'kg' | 'cx' | 't' | 'sc';

export type ItemCatalogoDemanda = {
  id: string;
  nome: string;
  segmento: string;
  unidades: UnidadeDemanda[];
};

export type DadosDemanda = {
  catalogoId: string;
  quantidade: string;
  unidade: UnidadeDemanda;
  /** dd/mm/aaaa */
  prazo: string;
  uf?: string;
  observacao: string;
};

export type DemandaCompra = {
  id: string;
  organizacaoId: string;
  catalogoId: string;
  cultura: string;
  unidadesCultura: UnidadeDemanda[];
  quantidade: number;
  unidade: UnidadeDemanda;
  /** dd/mm/aaaa */
  prazo: string;
  uf: string;
  observacao: string;
  status: 'aberta' | 'encerrada';
};

type LinhaDemanda = {
  id: string;
  organizacao_id: string;
  catalogo_id: string;
  quantidade: number;
  unidade: UnidadeDemanda;
  prazo: string;
  uf: string;
  observacao: string;
  status: 'aberta' | 'encerrada';
  catalogo_culturas: { nome: string; unidades: UnidadeDemanda[] } | null;
};

export function lerDataPrazo(texto: string): Date | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (data.getFullYear() !== Number(ano) || data.getMonth() !== Number(mes) - 1 || data.getDate() !== Number(dia)) {
    return null;
  }
  return data;
}

function paraISO(texto: string) {
  return lerDataPrazo(texto) ? texto.trim().split('/').reverse().join('-') : null;
}

function deISO(data: string | null) {
  return data ? data.split('-').reverse().join('/') : '';
}

export function quantidadeDemandaValida(texto: string) {
  const limpo = texto.trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(limpo)) return false;
  const numero = Number(limpo.replace(',', '.'));
  return Number.isFinite(numero) && numero > 0 && numero <= 1_000_000_000;
}

function cliente() {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  return supabase;
}

export async function lerCatalogoDemandas(): Promise<ItemCatalogoDemanda[]> {
  const { data, error } = await cliente()
    .from('catalogo_culturas')
    .select('id, nome, segmento, unidades')
    .eq('ativo', true)
    .order('nome')
    .returns<ItemCatalogoDemanda[]>();
  if (error) throw error;
  return data;
}

export async function listarMinhasDemandas(): Promise<{ organizacaoId: string; demandas: DemandaCompra[] }> {
  const organizacaoId = await organizacaoEmUso();
  if (!organizacaoId) {
    throw new Error('Cadastre e aprove sua empresa antes de publicar demandas.');
  }
  const { data, error } = await cliente()
    .from('demandas_compra')
    .select('id, organizacao_id, catalogo_id, quantidade, unidade, prazo, uf, observacao, status, catalogo_culturas(nome, unidades)')
    .eq('organizacao_id', organizacaoId)
    .order('criada_em', { ascending: false })
    .order('id')
    .returns<LinhaDemanda[]>();
  if (error) throw error;
  return {
    organizacaoId,
    demandas: data.map((l) => ({
      id: l.id,
      organizacaoId: l.organizacao_id,
      catalogoId: l.catalogo_id,
      cultura: l.catalogo_culturas?.nome ?? '',
      unidadesCultura: l.catalogo_culturas?.unidades ?? [l.unidade],
      quantidade: Number(l.quantidade),
      unidade: l.unidade,
      prazo: deISO(l.prazo),
      uf: l.uf,
      observacao: l.observacao,
      status: l.status,
    })),
  };
}

function mensagemErro(codigo: string | undefined, padrao: string) {
  if (codigo === 'PT403') return 'A empresa compradora selecionada precisa estar aprovada para gerir demandas.';
  if (codigo === 'PT404') return 'A demanda não está mais disponível para edição.';
  if (codigo === 'PT422') return 'Confira a cultura, a unidade do catálogo, o prazo vigente e a UF (SP).';
  if (codigo === '42501') return 'Esta empresa compradora não está autorizada na sua conta.';
  if (codigo === '23514') return 'Confira a quantidade, o limite da observação e os dados informados.';
  return padrao;
}

export async function salvarDemandaCompra(dados: DadosDemanda, id?: string) {
  const organizacaoId = await organizacaoEmUso();
  if (!organizacaoId) {
    throw new Error('Cadastre e escolha sua empresa compradora antes de publicar demandas.');
  }
  const prazoIso = paraISO(dados.prazo);
  const uf = (dados.uf ?? 'SP').trim().toUpperCase();
  if (!dados.catalogoId || !quantidadeDemandaValida(dados.quantidade) || !dados.unidade || !prazoIso || uf !== 'SP') {
    throw new Error('Escolha a cultura, a unidade válida, a quantidade maior que zero, o prazo válido e a UF SP.');
  }
  const { data, error } = await cliente().rpc('salvar_demanda_compra', {
    p_id: id ?? null,
    p_organizacao_id: organizacaoId,
    p_catalogo_id: dados.catalogoId,
    p_quantidade: Number(dados.quantidade.trim().replace(',', '.')),
    p_unidade: dados.unidade,
    p_prazo: prazoIso,
    p_uf: uf,
    p_observacao: dados.observacao.trim(),
  });
  if (error) throw new Error(mensagemErro(error.code, 'Não foi possível salvar a demanda. Tente novamente.'));
  return data as string;
}

export async function encerrarDemandaCompra(id: string) {
  const organizacaoId = await organizacaoEmUso();
  if (!organizacaoId) {
    throw new Error('Escolha a empresa compradora em uso.');
  }
  const { error } = await cliente().rpc('encerrar_demanda_compra', {
    p_id: id,
    p_organizacao_id: organizacaoId,
  });
  if (error) throw new Error(mensagemErro(error.code, 'Não foi possível encerrar a demanda. Tente novamente.'));
}
