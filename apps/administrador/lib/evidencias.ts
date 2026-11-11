import { Linking } from 'react-native';
import { supabase } from './supabase';

export type EvidenciaPendente = {
  lote_id: string;
  chave: string;
  arquivo: string;
  tipo: 'foto' | 'video';
  produto: string;
};

export async function listarPendentes(): Promise<EvidenciaPendente[]> {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.rpc('listar_evidencias_pendentes');
  if (error || !Array.isArray(data)) throw new Error();
  return data as EvidenciaPendente[];
}

export async function baixarOriginal(arquivo: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.storage.from('evidencias-lote').createSignedUrl(arquivo, 60, { download: true });
  if (error) throw error;
  await Linking.openURL(data.signedUrl);
}

export async function revisarEvidencia(item: EvidenciaPendente, aprovada: boolean, motivo: string) {
  if (!supabase) throw new Error();
  const { error } = await supabase.rpc('revisar_evidencia_lote', {
    p_lote: item.lote_id, p_chave: item.chave, p_aprovada: aprovada,
    p_motivo: aprovada ? null : motivo.trim(),
  });
  if (error?.code === 'PT409') throw new Error('A evidência já saiu da fila. Atualize a lista.');
  if (error) throw error;
}
