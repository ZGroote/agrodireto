/**
 * D09 Onda 1 (DOC 038 §4.2): campos do lote por segmento. O servidor (validar_atributos_lote) é a regra;
 * aqui só se mostra o que vale para o segmento e se converte o formulário para o formato do servidor.
 */
export type Segmento = 'hortifruti' | 'graos' | 'agroindustria' | 'pecuaria';

type Opcao = { label: string; value: string };
export type CampoSegmento = {
  chave: string;
  rotulo: string;
  tipo: 'lista' | 'texto' | 'numero';
  opcoes?: Opcao[];
  /** Obrigatório a partir da etapa de preço (o rascunho pode ser parcial). */
  obrigatorio: (unidade: string) => boolean;
  max?: number;
};

const sempre = () => true;
const nunca = () => false;

export const CAMPOS_SEGMENTO: Record<Segmento, CampoSegmento[]> = {
  hortifruti: [
    { chave: 'padrao_qualidade', rotulo: 'Padrão de qualidade', tipo: 'lista', obrigatorio: sempre, opcoes: [
      { label: 'Extra', value: 'extra' }, { label: 'Primeira (Cat. I)', value: 'primeira_cat1' },
      { label: 'Segunda (Cat. II)', value: 'segunda_cat2' }, { label: 'Indústria', value: 'industria' },
      { label: 'Sem classificação', value: 'sem_classificacao' },
    ] },
    { chave: 'calibre', rotulo: 'Calibre (ex.: Graúdo, 50-65 mm)', tipo: 'texto', obrigatorio: nunca },
    { chave: 'embalagem', rotulo: 'Embalagem', tipo: 'lista', obrigatorio: sempre, opcoes: [
      { label: 'Caixa plástica', value: 'caixa_plastica' }, { label: 'Caixa de madeira', value: 'caixa_madeira' },
      { label: 'Caixa de papelão', value: 'caixa_papelao' }, { label: 'Saco de rede', value: 'saco_rede' },
      { label: 'Granel', value: 'granel' },
    ] },
    { chave: 'peso_medio_embalagem_kg', rotulo: 'Peso médio da caixa (kg)', tipo: 'numero', max: 1000,
      obrigatorio: (unidade) => unidade === 'cx' },
  ],
  graos: [
    { chave: 'origem_classificacao', rotulo: 'Classificação', tipo: 'lista', obrigatorio: sempre, opcoes: [
      { label: 'Declarada pelo vendedor', value: 'declarada_vendedor' },
      { label: 'Certificada (CGC/MAPA)', value: 'certificada_cgc_mapa' },
    ] },
    { chave: 'tipo_grao', rotulo: 'Tipo', tipo: 'lista', obrigatorio: sempre, opcoes: [
      { label: 'Tipo 1', value: 'tipo_1' }, { label: 'Tipo 2', value: 'tipo_2' }, { label: 'Tipo 3', value: 'tipo_3' },
      { label: 'Fora de tipo', value: 'fora_de_tipo' }, { label: 'Padrão exportação', value: 'padrao_exportacao' },
    ] },
    { chave: 'umidade_max_pct', rotulo: 'Umidade máxima (%)', tipo: 'numero', max: 30, obrigatorio: sempre },
    { chave: 'impurezas_max_pct', rotulo: 'Impurezas máximas (%)', tipo: 'numero', max: 15, obrigatorio: sempre },
    { chave: 'acondicionamento', rotulo: 'Acondicionamento', tipo: 'lista', obrigatorio: sempre, opcoes: [
      { label: 'Granel', value: 'granel' }, { label: 'Big bag', value: 'big_bag' },
      { label: 'Sacaria de 60 kg', value: 'sacaria_60kg' },
    ] },
  ],
  // Estrutura pronta, sem campos na Onda 1.
  agroindustria: [],
  pecuaria: [],
};

export const ehSegmento = (valor: unknown): valor is Segmento =>
  valor === 'hortifruti' || valor === 'graos' || valor === 'agroindustria' || valor === 'pecuaria';

const rotulo = (campo: CampoSegmento | undefined, valor: string | undefined) =>
  campo?.opcoes?.find((o) => o.value === valor)?.label ?? '';

/** "14,5" → 14.5; vazio → undefined; inválido → erro. */
function numero(campo: CampoSegmento, texto: string) {
  const n = Number(texto.trim().replace(',', '.'));
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(texto.trim()) || !Number.isFinite(n) || n < 0 || n > (campo.max ?? Infinity)
      || (campo.chave === 'peso_medio_embalagem_kg' && n <= 0)) {
    throw new Error(`Confira o campo ${campo.rotulo}.`);
  }
  return n;
}

/**
 * Converte os atributos do formulário para o servidor: só as chaves do segmento, números como número.
 * Também monta os textos padrão/calibre/embalagem que a publicação e o catálogo já exibem.
 */
export function atributosParaServidor(segmento: Segmento | undefined, unidade: string, atributos: Record<string, string>) {
  const campos = segmento ? CAMPOS_SEGMENTO[segmento] : [];
  const json: Record<string, string | number> = {};
  for (const campo of campos) {
    const valor = atributos[campo.chave]?.trim();
    if (!valor) continue;
    if (campo.tipo === 'numero') json[campo.chave] = numero(campo, valor);
    else if (campo.tipo === 'lista' && !campo.opcoes?.some((o) => o.value === valor)) throw new Error(`Confira o campo ${campo.rotulo}.`);
    else if (campo.tipo === 'texto' && valor.length > 60) throw new Error(`O campo ${campo.rotulo} aceita até 60 caracteres.`);
    else json[campo.chave] = valor;
  }
  const campo = (chave: string) => campos.find((c) => c.chave === chave);
  const texto = (chave: string) => String(json[chave] ?? '').replace('.', ',');
  let padrao = '';
  let calibre = '';
  let embalagem = '';
  if (segmento === 'hortifruti') {
    padrao = rotulo(campo('padrao_qualidade'), atributos.padrao_qualidade);
    calibre = String(json.calibre ?? '');
    embalagem = [rotulo(campo('embalagem'), atributos.embalagem), json.peso_medio_embalagem_kg ? `${texto('peso_medio_embalagem_kg')} kg` : '']
      .filter(Boolean).join(' · ');
  } else if (segmento === 'graos') {
    padrao = [
      rotulo(campo('tipo_grao'), atributos.tipo_grao),
      json.umidade_max_pct !== undefined ? `umidade até ${texto('umidade_max_pct')}%` : '',
      json.impurezas_max_pct !== undefined ? `impurezas até ${texto('impurezas_max_pct')}%` : '',
      rotulo(campo('origem_classificacao'), atributos.origem_classificacao),
    ].filter(Boolean).join(' · ');
    embalagem = rotulo(campo('acondicionamento'), atributos.acondicionamento);
  }
  return { p_atributos: json, p_padrao: padrao, p_calibre: calibre, p_embalagem: embalagem };
}

/** Faltando algum obrigatório para avançar da etapa de padrão: devolve o rótulo do primeiro. */
export function faltandoObrigatorio(segmento: Segmento | undefined, unidade: string, atributos: Record<string, string>) {
  if (!segmento) return undefined;
  return CAMPOS_SEGMENTO[segmento].find((c) => c.obrigatorio(unidade) && !atributos[c.chave]?.trim())?.rotulo;
}
