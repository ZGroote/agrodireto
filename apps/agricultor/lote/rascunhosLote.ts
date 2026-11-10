import AsyncStorage from '@react-native-async-storage/async-storage';

export type Unidade = 'kg' | 'cx' | 't';
export type EtapaLote = 'novo' | 'padrao' | 'preco' | 'revisar';
export type EvidenciaDraft = { id: string; tipo: 'foto' | 'video'; uri: string; nome: string };

export type LoteDraft = {
  produto?: string;
  culturaId?: string;
  origem?: string;
  quantidade: string;
  unidade: Unidade;
  padrao?: string;
  calibre?: string;
  embalagem?: string;
  evidencias: EvidenciaDraft[];
  precoUnitario: string;
  dataColheita: string;
  retirada: string;
  condicoes: string;
  validade: string;
};

export type RascunhoSalvo = { id: string; etapa: EtapaLote; campos: LoteDraft };

export const loteVazio: LoteDraft = {
  quantidade: '', unidade: 'kg', evidencias: [], precoUnitario: '',
  dataColheita: '', retirada: '', condicoes: '', validade: '',
};

export const nomesEtapas: Record<EtapaLote, string> = {
  novo: 'Dados do lote', padrao: 'Padrão do lote', preco: 'Preço e retirada', revisar: 'Revisão da oferta',
};

const chave = '@agrodireto/agricultor/lotes-rascunhos/v2';
const chaveAnterior = '@agrodireto/agricultor/lote-rascunho/v1';
const camposObrigatorios = ['quantidade', 'precoUnitario', 'dataColheita', 'retirada', 'condicoes', 'validade'] as const;
const camposOpcionais = ['produto', 'culturaId', 'origem', 'padrao', 'calibre', 'embalagem'] as const;

export function criarIdLote() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function lerCampos(dados: unknown): LoteDraft {
  if (!dados || typeof dados !== 'object') throw new Error('Rascunho de lote inválido');

  const campos = { ...loteVazio };
  for (const campo of camposObrigatorios) {
    const valor: unknown = Reflect.get(dados, campo);
    if (typeof valor !== 'string') throw new Error('Rascunho de lote inválido');
    campos[campo] = valor;
  }
  for (const campo of camposOpcionais) {
    const valor: unknown = Reflect.get(dados, campo);
    if (valor === undefined) continue;
    if (typeof valor !== 'string') throw new Error('Rascunho de lote inválido');
    campos[campo] = valor;
  }
  const unidade: unknown = Reflect.get(dados, 'unidade');
  if (unidade !== 'kg' && unidade !== 'cx' && unidade !== 't') throw new Error('Unidade inválida');
  campos.unidade = unidade;
  return campos;
}

function lerRegistro(valor: unknown): RascunhoSalvo {
  if (!valor || typeof valor !== 'object') throw new Error('Rascunho inválido');
  const { id, etapa, campos } = valor as Record<string, unknown>;
  if (typeof id !== 'string' || !id || (etapa !== 'novo' && etapa !== 'padrao' && etapa !== 'preco' && etapa !== 'revisar')) {
    throw new Error('Rascunho inválido');
  }
  return { id, etapa, campos: lerCampos(campos) };
}

async function lerArmazenamento(): Promise<RascunhoSalvo[]> {
  const json = await AsyncStorage.getItem(chave);
  if (json !== null) {
    const registros: unknown = JSON.parse(json);
    if (!Array.isArray(registros)) throw new Error('Lista de rascunhos inválida');
    return registros.map(lerRegistro);
  }
  const antigo = await AsyncStorage.getItem(chaveAnterior);
  return antigo === null ? [] : [{ id: 'anterior', etapa: 'novo', campos: lerCampos(JSON.parse(antigo)) }];
}

let gravacao = Promise.resolve();

export async function lerRascunhosLote() {
  await gravacao;
  return lerArmazenamento();
}

function alterarRascunhos(alterar: (registros: RascunhoSalvo[]) => RascunhoSalvo[]) {
  const operacao = gravacao.then(async () => {
    const atualizados = alterar(await lerArmazenamento());
    await AsyncStorage.setItem(chave, JSON.stringify(atualizados));
  });
  gravacao = operacao.catch(() => {});
  return operacao;
}

export function salvarRascunhoLote(id: string, etapa: EtapaLote, campos: LoteDraft) {
  // As evidências podem estar em cache. Guarde apenas os campos recuperáveis.
  const registro = { id, etapa, campos: { ...campos, evidencias: [] } };
  return alterarRascunhos((registros) => [registro, ...registros.filter((item) => item.id !== id)]);
}

export function descartarRascunhoLote(id: string) {
  return alterarRascunhos((registros) => registros.filter((item) => item.id !== id));
}
