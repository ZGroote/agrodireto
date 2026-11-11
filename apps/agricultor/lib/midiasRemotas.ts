import AsyncStorage from '@react-native-async-storage/async-storage';
import { abrirEvidencia, apagarEvidencia, armazenarEvidencia, enviarArquivoLocal } from '@/lote/arquivosEvidencia';
import { supabase } from './supabase';

/**
 * Mídias da propriedade no bucket privado `midias` (D03/D07).
 * O arquivo escolhido é copiado para o aparelho e entra numa fila local por conta ANTES da rede; o envio é
 * acionado pelo usuário: reservar_midia → (já confirmado? fim) → URL assinada → PUT do arquivo → confirmar_midia.
 * A mesma chave devolve o mesmo caminho, então repetir o envio nunca cria outra mídia.
 */

export type MidiaPendente = {
  chave: string;
  propriedadeId: string;
  tipo: 'foto' | 'video';
  nome: string;
  mime: string;
  criadaEm: string;
  tamanho?: number;
  duracaoSeg?: number;
};

export type MidiaRemota = {
  id: string;
  chave: string | null;
  tipo: 'foto' | 'video';
  arquivo: string;
  arquivo_publicado: string | null;
  processamento: 'aguardando' | 'otimizando' | 'pronta' | 'mantida' | 'falhou';
  motivo_processamento: string | null;
  enviada_em: string | null;
  tamanho_original_bytes: number | null;
  criada_em: string;
};

export type ArquivoNovo = { uri: string; nome: string; tipo: 'foto' | 'video'; mime?: string; tamanho?: number; duracaoSeg?: number };

function cliente() {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  return supabase;
}

async function conta() {
  const { data } = await cliente().auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Entre na sua conta para enviar mídias.');
  return id;
}

const chaveFila = (idConta: string) => `@agrodireto/agricultor/midias-pendentes/v1/${idConta}`;
export const extensao = (nome: string) => /\.([a-z0-9-]{1,10})$/i.exec(nome)?.[1]?.toLowerCase() ?? '';
const arquivoLocal = (m: Pick<MidiaPendente, 'chave' | 'nome'>) => `midia.${m.chave}.${extensao(m.nome)}`;
const criarChave = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function pendenteValida(dado: unknown): dado is MidiaPendente {
  if (!dado || typeof dado !== 'object') return false;
  const m = dado as Record<string, unknown>;
  return typeof m.chave === 'string' && /^[a-z0-9-]{1,80}$/.test(m.chave) && typeof m.propriedadeId === 'string'
    && (m.tipo === 'foto' || m.tipo === 'video') && typeof m.nome === 'string' && typeof m.mime === 'string'
    && typeof m.criadaEm === 'string';
}

async function lerFila(idConta: string): Promise<MidiaPendente[]> {
  const texto = await AsyncStorage.getItem(chaveFila(idConta));
  if (!texto) return [];
  try {
    const dados: unknown = JSON.parse(texto);
    return Array.isArray(dados) ? dados.filter(pendenteValida) : [];
  } catch {
    return [];
  }
}

// Gravações da fila uma de cada vez, para um envio que termina não apagar o que acabou de ser adicionado.
let ultima: Promise<unknown> = Promise.resolve();
function alterarFila(idConta: string, mudar: (fila: MidiaPendente[]) => MidiaPendente[]) {
  const proxima = ultima.then(async () => {
    await AsyncStorage.setItem(chaveFila(idConta), JSON.stringify(mudar(await lerFila(idConta))));
  });
  ultima = proxima.catch(() => undefined);
  return proxima;
}

export async function lerPendentes(propriedadeId: string) {
  return (await lerFila(await conta())).filter((m) => m.propriedadeId === propriedadeId);
}

/** Copia os arquivos para o aparelho e põe na fila. Nada vai para a rede aqui. */
export async function adicionarPendentes(propriedadeId: string, arquivos: ArquivoNovo[]) {
  const idConta = await conta();
  const adicionadas: MidiaPendente[] = [];
  const falhas: { nome: string; motivo: string }[] = [];
  for (const a of arquivos) {
    const m: MidiaPendente = {
      chave: criarChave(), propriedadeId, tipo: a.tipo, nome: a.nome, mime: a.mime || 'application/octet-stream',
      criadaEm: new Date().toISOString(), tamanho: a.tamanho, duracaoSeg: a.duracaoSeg,
    };
    try {
      await armazenarEvidencia(arquivoLocal(m), a.uri);
      adicionadas.push(m);
    } catch {
      falhas.push({ nome: a.nome, motivo: 'Não foi possível guardar o arquivo no aparelho.' });
    }
  }
  if (adicionadas.length > 0) await alterarFila(idConta, (fila) => [...fila, ...adicionadas]);
  return { adicionadas, falhas };
}

async function concluir(idConta: string, m: MidiaPendente) {
  await alterarFila(idConta, (fila) => fila.filter((item) => item.chave !== m.chave));
  await apagarEvidencia(arquivoLocal(m)).catch(() => undefined);
}

export async function descartarPendente(m: MidiaPendente) {
  await concluir(await conta(), m);
}

const mensagem = (erro: { code?: string; message?: string }, padrao: string) =>
  erro.code?.startsWith('PT4') && erro.message ? erro.message : padrao;

/** Envia uma mídia da fila. Devolve 'enviada' (entra no processamento) ou 'recusada' (acima do limite). */
export async function enviarPendente(m: MidiaPendente, onProgresso: (fracao: number) => void): Promise<'enviada' | 'recusada'> {
  const idConta = await conta();
  const cli = cliente();
  const reserva = await cli.rpc('reservar_midia', {
    p_lote: null, p_propriedade: m.propriedadeId, p_chave: m.chave, p_extensao: extensao(m.nome),
  });
  if (reserva.error || typeof reserva.data !== 'string') {
    throw new Error(reserva.error ? mensagem(reserva.error, 'Não foi possível reservar o envio. Tente novamente.') : 'Não foi possível reservar o envio.');
  }
  const caminho = reserva.data;
  const confirmar = () => cli.rpc('confirmar_midia', { p_arquivo: caminho });

  // Nova tentativa depois de o arquivo já ter subido: só falta confirmar.
  const anterior = await confirmar();
  if (!anterior.error) {
    await concluir(idConta, m);
    return anterior.data === 'recusada' ? 'recusada' : 'enviada';
  }
  if (anterior.error.code !== 'PT409') throw new Error('Não foi possível consultar o envio. Tente novamente.');

  const assinada = await cli.storage.from('midias').createSignedUploadUrl(caminho);
  if (assinada.error) throw new Error('Não foi possível iniciar o envio. Tente novamente.');
  const status = await enviarArquivoLocal(arquivoLocal(m), assinada.data.signedUrl, m.mime, onProgresso);

  const confirmado = await confirmar();
  if (confirmado.error) {
    throw new Error(status < 300 ? 'Arquivo enviado. Tente de novo para confirmar.' : 'Não foi possível enviar. Tente novamente.');
  }
  await concluir(idConta, m);
  return confirmado.data === 'recusada' ? 'recusada' : 'enviada';
}

export async function listarMidias(propriedadeId: string): Promise<MidiaRemota[]> {
  const { data, error } = await cliente().from('midias')
    .select('id,chave,tipo,arquivo,arquivo_publicado,processamento,motivo_processamento,enviada_em,tamanho_original_bytes,criada_em')
    .eq('propriedade_id', propriedadeId).order('criada_em').order('id').returns<MidiaRemota[]>();
  if (error) throw error;
  return data;
}

/** Links temporários (10 min) para as prévias; usa a cópia sem metadados quando existe. */
export async function linksTemporarios(midias: MidiaRemota[]): Promise<Record<string, string>> {
  const fotos = midias.filter((m) => m.tipo === 'foto' && m.enviada_em);
  if (fotos.length === 0) return {};
  const { data, error } = await cliente().storage.from('midias')
    .createSignedUrls(fotos.map((m) => m.arquivo_publicado ?? m.arquivo), 600);
  if (error) throw error;
  const links: Record<string, string> = {};
  fotos.forEach((m, i) => { const url = data[i]?.signedUrl; if (url) links[m.id] = url; });
  return links;
}

export async function uriLocal(m: MidiaPendente) {
  return (await abrirEvidencia(arquivoLocal(m))).uri;
}
