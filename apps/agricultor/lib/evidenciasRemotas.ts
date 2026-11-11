import { Linking } from 'react-native';
import { lerBytesEvidencia } from '@/lote/arquivosEvidencia';
import { chaveEvidencia, type EvidenciaDraft } from '@/lote/rascunhosLote';
import { supabase } from './supabase';

const bucket = 'evidencias-lote';
const limiteBytes = 6 * 1024 * 1024;
const formatos = {
  jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  mp4: 'video/mp4', mov: 'video/quicktime',
} as const;

export type EvidenciaEnviada = {
  chave: string;
  arquivo: string;
  tipo: 'foto' | 'video';
  solicitada_em: string | null;
  revisao: 'aprovada' | 'rejeitada' | null;
  motivo_rejeicao: string | null;
  autorizada_catalogo: boolean;
  copia_catalogo: string | null;
};

export async function listarEvidencias(lote: string): Promise<EvidenciaEnviada[]> {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('evidencias_lote')
    .select('chave,arquivo,tipo,solicitada_em,revisao,motivo_rejeicao,autorizada_catalogo,copia_catalogo').eq('lote_id', lote).not('enviada_em', 'is', null)
    .order('enviada_em').returns<EvidenciaEnviada[]>();
  if (error) throw error;
  return data;
}

export async function autorizarFotoCatalogo(lote: string, chave: string, autorizar: boolean) {
  if (!supabase) throw new Error();
  const { error } = await supabase.rpc('autorizar_foto_catalogo', {
    p_lote: lote, p_chave: chave, p_autorizar: autorizar,
  });
  if (error) throw error;
}

export async function solicitarRevisao(lote: string, chave: string) {
  if (!supabase) throw new Error();
  const { error } = await supabase.rpc('solicitar_revisao_evidencia', { p_lote: lote, p_chave: chave });
  if (error) throw error;
}

export async function enviarEvidencia(lote: string, rascunho: string, evidencia: EvidenciaDraft) {
  if (!supabase) throw new Error('Ambiente indisponível.');
  const cliente = supabase;
  const sufixo = /\.([a-z0-9]+)$/i.exec(evidencia.nome)?.[1].toLowerCase();
  const extensao = sufixo === 'jpeg' ? 'jpg' : sufixo;
  if (!extensao || !Object.hasOwn(formatos, extensao)) {
    throw new Error('Use uma foto JPG, PNG ou WebP, ou um vídeo MP4 ou MOV.');
  }
  const mime = formatos[extensao as keyof typeof formatos];
  if (!mime.startsWith(evidencia.tipo === 'foto' ? 'image/' : 'video/')) {
    throw new Error('O formato não corresponde ao tipo de evidência selecionado.');
  }

  const bytes = await lerBytesEvidencia(chaveEvidencia(rascunho, evidencia), limiteBytes);
  const { data: caminho, error } = await cliente.rpc('reservar_evidencia_lote', {
    p_lote: lote, p_chave: evidencia.id, p_extensao: extensao,
  });
  if (error || typeof caminho !== 'string') throw new Error(error?.message ?? 'Não foi possível reservar o envio.');

  const storage = cliente.storage.from(bucket);
  const confirmacao = { p_lote: lote, p_chave: evidencia.id };
  const anterior = await cliente.rpc('confirmar_evidencia_lote', confirmacao);
  if (!anterior.error) return;
  if (anterior.error.code !== 'PT409') throw new Error('Não foi possível consultar o envio.');

  const enviado = await storage.upload(caminho, bytes, { contentType: mime, upsert: false });
  const confirmado = await cliente.rpc('confirmar_evidencia_lote', confirmacao);
  if (confirmado.error) throw new Error(enviado.error ? 'Não foi possível enviar. Tente novamente.' : 'Arquivo enviado. Tente novamente para confirmar.');
}

export async function baixarEvidencia(arquivo: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(arquivo, 60, { download: true });
  if (error) throw error;
  await Linking.openURL(data.signedUrl);
}
