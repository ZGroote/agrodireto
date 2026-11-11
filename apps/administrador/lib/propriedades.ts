import { camposPropriedadeEnviada, type PropriedadeEnviada } from '@agrodireto/dominio';
import { supabase } from './supabase';

export async function listarPendencias() {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('propriedades').select(camposPropriedadeEnviada)
    .eq('status', 'em_analise').order('enviada_em').returns<PropriedadeEnviada[]>();
  if (error) throw error;
  return data;
}

export async function lerPropriedade(id: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('propriedades').select(camposPropriedadeEnviada)
    .eq('usuario_id', id).maybeSingle<PropriedadeEnviada>();
  if (error) throw error;
  return data;
}

export async function revisarPropriedade(cadastro: PropriedadeEnviada, motivo: string | null) {
  if (!supabase) throw new Error();
  const { error } = await supabase.rpc('revisar_propriedade', {
    p_usuario_id: cadastro.usuario_id,
    p_enviada_em: cadastro.enviada_em,
    p_motivo: motivo,
  });
  if (error?.code === 'PT409') throw new Error('O cadastro mudou. Volte à lista e abra a versão atual.');
  if (error) throw error;
}
