import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { armazenamentoSessao, acompanharSessao } from './armazenamentoSessao';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const chave = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && chave ? createClient(url, chave, {
  auth: {
    storage: armazenamentoSessao,
    persistSession: Platform.OS !== 'web',
    detectSessionInUrl: false,
    autoRefreshToken: true,
  },
}) : null;

if (supabase) acompanharSessao(supabase);

/**
 * Antes de gravar: renova o token se preciso. Sem sessão válida, o Auth emite SIGNED_OUT
 * e o layout (app) volta para Entrar; a gravação não sai.
 */
export async function exigirSessao() {
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  if (!data.session) throw new Error('Sua sessão expirou. Entre novamente.');
}
