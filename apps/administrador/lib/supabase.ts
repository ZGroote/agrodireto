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

export async function consultarAcessoEquipe() {
  if (!supabase) return 'sem_acesso';
  const { data, error } = await supabase.rpc('acesso_equipe');
  if (error) throw error;
  if (data === 'autorizado' || data === 'requer_mfa') return data;
  return 'sem_acesso';
}
