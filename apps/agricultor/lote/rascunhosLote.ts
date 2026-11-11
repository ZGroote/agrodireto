import AsyncStorage from '@react-native-async-storage/async-storage';
import { apagarEvidencia, armazenarEvidencia } from './arquivosEvidencia';
import { supabase } from '@/lib/supabase';

export type Unidade = 'kg' | 'cx' | 't';
export type EtapaLote = 'novo' | 'padrao' | 'preco' | 'revisar';
export type EvidenciaDraft = { id: string; tipo: 'foto' | 'video'; uri?: string; nome: string };

export type LoteDraft = {
  produto?: string;
  culturaId?: string;
  propriedadeId?: string;
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
const camposOpcionais = ['produto', 'culturaId', 'propriedadeId', 'origem', 'padrao', 'calibre', 'embalagem'] as const;

export function criarIdLote() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function idLoteValido(id: unknown): id is string {
  return typeof id === 'string' && /^[a-z0-9-]{1,80}$/.test(id);
}

export function chaveEvidencia(loteId: string, evidencia: EvidenciaDraft) {
  if (!idLoteValido(loteId) || !idLoteValido(evidencia.id)) throw new Error('Identificador de evidência inválido');
  const extensao = /\.[a-z\d]{1,10}$/i.exec(evidencia.nome)?.[0].toLowerCase() ?? '';
  return `${loteId}.${evidencia.id}${extensao}`;
}

function lerEvidencia(dado: unknown): EvidenciaDraft {
  if (!dado || typeof dado !== 'object') throw new Error('Evidência inválida');
  const { id, tipo, nome } = dado as Record<string, unknown>;
  if (!idLoteValido(id) || (tipo !== 'foto' && tipo !== 'video') || typeof nome !== 'string') {
    throw new Error('Evidência inválida');
  }
  return { id, tipo, nome };
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
  const evidencias: unknown = Reflect.get(dados, 'evidencias');
  if (Array.isArray(evidencias)) campos.evidencias = evidencias.map(lerEvidencia);
  return campos;
}

function lerRegistro(valor: unknown): RascunhoSalvo {
  if (!valor || typeof valor !== 'object') throw new Error('Rascunho inválido');
  const { id, etapa, campos } = valor as Record<string, unknown>;
  if (!idLoteValido(id) || (etapa !== 'novo' && etapa !== 'padrao' && etapa !== 'preco' && etapa !== 'revisar')) {
    throw new Error('Rascunho inválido');
  }
  return { id, etapa, campos: lerCampos(campos) };
}

async function chaveDaConta() {
  const resposta = await supabase?.auth.getSession();
  const id = resposta?.data.session?.user.id;
  if (!id) throw new Error('Sessão indisponível');
  return `${chave}/${id}`;
}

function lerLista(json: string): RascunhoSalvo[] {
  const registros: unknown = JSON.parse(json);
  if (!Array.isArray(registros)) throw new Error('Lista de rascunhos inválida');
  return registros.map(lerRegistro);
}

async function lerArmazenamento(chaveConta: string): Promise<RascunhoSalvo[]> {
  const json = await AsyncStorage.getItem(chaveConta);
  if (json !== null) {
    return lerLista(json);
  }
  const chaveDono = `${chave}/dono-legado`;
  const dono = await AsyncStorage.getItem(chaveDono);
  if (dono && dono !== chaveConta) return [];
  const legado = await AsyncStorage.getItem(chave);
  const antigo = await AsyncStorage.getItem(chaveAnterior);
  if (legado === null && antigo === null) return [];
  const registros: RascunhoSalvo[] = legado !== null ? lerLista(legado) : [
    { id: 'anterior', etapa: 'novo', campos: lerCampos(JSON.parse(antigo ?? 'null')) },
  ];
  await AsyncStorage.setItem(chaveDono, chaveConta);
  await AsyncStorage.setItem(chaveConta, JSON.stringify(registros));
  return registros;
}

let gravacao = Promise.resolve();

export function lerRascunhosLote() {
  const operacao = gravacao.then(async () => lerArmazenamento(await chaveDaConta()));
  gravacao = operacao.then(() => {}, () => {});
  return operacao;
}

function alterarRascunhos(id: string, etapa: EtapaLote | null, campos: LoteDraft) {
  const operacao = gravacao.then(async () => {
    const chaveConta = await chaveDaConta();
    const registros = await lerArmazenamento(chaveConta);
    const anterior = registros.find((item) => item.id === id);
    const outros = registros.filter((item) => item.id !== id);
    const evidencias: EvidenciaDraft[] = [];
    const anteriores = new Set(anterior?.campos.evidencias.map((item) => chaveEvidencia(id, item)));
    if (etapa !== null) {
      const arquivosNovos: string[] = [];
      try {
        for (const { uri, ...evidencia } of campos.evidencias) {
          if (uri) {
            const chaveArquivo = chaveEvidencia(id, evidencia);
            if (!anteriores.has(chaveArquivo)) arquivosNovos.push(chaveArquivo);
            await armazenarEvidencia(chaveArquivo, uri);
          }
          evidencias.push(evidencia);
        }
      } catch (erro) {
        await Promise.allSettled(arquivosNovos.map(apagarEvidencia));
        throw erro;
      }
    }

    const salvo = { ...campos, evidencias };
    const atualizados = etapa === null ? outros : [{ id, etapa, campos: salvo }, ...outros];
    await AsyncStorage.setItem(chaveConta, JSON.stringify(atualizados));
    const mantidas = new Set(evidencias.map((item) => chaveEvidencia(id, item)));
    for (const chaveArquivo of anteriores) {
      if (mantidas.has(chaveArquivo)) continue;
      try {
        await apagarEvidencia(chaveArquivo);
      } catch (erro) {
        console.warn('Não foi possível limpar uma evidência removida do rascunho.', erro);
      }
    }
    return salvo;
  });
  gravacao = operacao.then(() => {}, () => {});
  return operacao;
}

export function salvarRascunhoLote(id: string, etapa: EtapaLote, campos: LoteDraft) {
  return alterarRascunhos(id, etapa, campos);
}

export function descartarRascunhoLote(id: string) {
  return alterarRascunhos(id, null, loteVazio);
}
