import { formatarPeriodo, lerPeriodo } from '@agrodireto/ui';
import type { EtapaLote, LoteDraft, RascunhoSalvo, Unidade } from '@/lote/rascunhosLote';
import { lerDataColheita } from './culturas';
import { supabase } from './supabase';

function cliente() {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  return supabase;
}

function dataISO(texto: string) {
  if (!texto.trim()) return null;
  if (!lerDataColheita(texto.trim())) throw new Error('Confira as datas do lote.');
  return texto.trim().split('/').reverse().join('-');
}

/** Ausência é permitida no rascunho; valores preenchidos precisam ser válidos. */
export function validarRascunho(campos: LoteDraft) {
  const qtd = campos.quantidade.trim();
  const quantidade = qtd ? Number(qtd.replace(/\./g, '').replace(',', '.')) : null;
  if (qtd && (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(qtd) ||
    !Number.isFinite(quantidade) || quantidade! <= 0 || quantidade! > 1_000_000_000)) {
    throw new Error('Informe uma quantidade maior que zero, até 1 bilhão.');
  }
  const preco = campos.precoUnitario.trim();
  const centavos = preco ? Math.round(Number(preco.replace(',', '.')) * 100) : null;
  if (preco && (!/^\d+(?:[,.]\d{1,2})?$/.test(preco) || !Number.isSafeInteger(centavos) ||
    centavos! <= 0 || centavos! > 100_000_000_000)) throw new Error('Confira o preço: até duas casas decimais e maior que zero.');
  if (!['kg', 'cx', 't'].includes(campos.unidade)) throw new Error('Unidade inválida.');
  for (const campo of ['padrao', 'calibre', 'embalagem'] as const) {
    if ((campos[campo]?.trim().length ?? 0) > 120) throw new Error('Os campos de qualidade aceitam até 120 caracteres.');
  }
  if (campos.condicoes.trim().length > 2000) throw new Error('As condições aceitam até 2000 caracteres.');
  const retirada = campos.retirada.trim() ? lerPeriodo(campos.retirada.trim()) : null;
  if (campos.retirada.trim() && (!retirada || retirada[1] < retirada[0] || formatarPeriodo(...retirada) !== campos.retirada.trim())) {
    throw new Error('Confira o período de retirada.');
  }
  const iso = (data: Date) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
  return {
    p_quantidade: quantidade, p_unidade: campos.unidade, p_preco_centavos: centavos,
    p_padrao: campos.padrao ?? '', p_calibre: campos.calibre ?? '', p_embalagem: campos.embalagem ?? '',
    p_condicoes: campos.condicoes, p_colheita: dataISO(campos.dataColheita),
    p_retirada_inicio: retirada ? iso(retirada[0]) : null,
    p_retirada_fim: retirada ? iso(retirada[1]) : null, p_validade: dataISO(campos.validade),
  };
}

export async function enviarRascunho(id: string, etapa: EtapaLote, campos: LoteDraft) {
  if (!campos.culturaId || !campos.propriedadeId) throw new Error('Selecione uma cultura cadastrada para enviar o rascunho.');
  const { error } = await cliente().rpc('salvar_rascunho_lote', {
    p_rascunho_id: id, p_propriedade: campos.propriedadeId, p_cultura: campos.culturaId,
    p_etapa: etapa, ...validarRascunho(campos),
  });
  if (error?.code === 'PT422') throw new Error(error.message);
  if (error?.code === '42501') throw new Error('Você não tem acesso à organização desta propriedade.');
  if (error?.code === '23514') throw new Error('Confira os valores e limites dos campos do lote.');
  if (error) throw new Error('Não foi possível enviar. O rascunho permanece no dispositivo.');
}

type Linha = {
  rascunho_id: string; etapa: EtapaLote; cultura_id: string; propriedade_id: string;
  quantidade: number | null; unidade: Unidade; preco_centavos: number | null;
  padrao: string; calibre: string; embalagem: string; condicoes: string;
  colheita: string | null; retirada_inicio: string | null; retirada_fim: string | null; validade: string | null;
  propriedades: { nome: string } | null;
  culturas: { variedade: string; catalogo_culturas: { nome: string } | null } | null;
};

export async function lerRascunhosRemotos(): Promise<RascunhoSalvo[]> {
  const { data, error } = await cliente().from('rascunhos_lote').select(
    'rascunho_id,etapa,cultura_id,propriedade_id,quantidade,unidade,preco_centavos,padrao,calibre,embalagem,condicoes,colheita,retirada_inicio,retirada_fim,validade,propriedades(nome),culturas(variedade,catalogo_culturas(nome))',
  ).order('atualizado_em', { ascending: false }).returns<Linha[]>();
  if (error) throw error;
  const dataLocal = (texto: string) => new Date(`${texto}T12:00:00`);
  const dataBR = (texto: string | null) => texto?.split('-').reverse().join('/') ?? '';
  return data.map((r) => ({
    id: r.rascunho_id, etapa: r.etapa, campos: {
      culturaId: r.cultura_id, propriedadeId: r.propriedade_id,
      produto: [r.culturas?.catalogo_culturas?.nome, r.culturas?.variedade].filter(Boolean).join(' · '),
      origem: r.propriedades?.nome,
      quantidade: r.quantidade === null ? '' : String(r.quantidade).replace('.', ','), unidade: r.unidade,
      precoUnitario: r.preco_centavos === null ? '' : (Number(r.preco_centavos) / 100).toFixed(2).replace('.', ','),
      padrao: r.padrao, calibre: r.calibre, embalagem: r.embalagem, condicoes: r.condicoes,
      dataColheita: dataBR(r.colheita), validade: dataBR(r.validade),
      retirada: r.retirada_inicio && r.retirada_fim ? formatarPeriodo(dataLocal(r.retirada_inicio), dataLocal(r.retirada_fim)) : '',
      evidencias: [],
    },
  }));
}

export async function descartarRascunhoRemoto(id: string) {
  const { error } = await cliente().rpc('descartar_rascunho_lote', { p_rascunho_id: id });
  if (error) throw new Error(error.code === 'PT422' ? error.message : 'Conecte-se para confirmar o descarte do rascunho.');
}
