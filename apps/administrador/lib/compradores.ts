import { camposCadastroComprador, type CadastroComprador } from '@agrodireto/dominio';
import { supabase } from './supabase';

export async function listarCompradoresPendentes() {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('cadastros_comprador').select(camposCadastroComprador)
    .eq('status', 'em_analise').order('enviada_em').returns<CadastroComprador[]>();
  if (error) throw error;
  return data;
}

export async function lerComprador(organizacao: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('cadastros_comprador').select(camposCadastroComprador)
    .eq('organizacao_id', organizacao).maybeSingle<CadastroComprador>();
  if (error) throw error;
  return data;
}

export async function revisarComprador(cadastro: CadastroComprador, motivo: string | null) {
  if (!supabase) throw new Error();
  const { error } = await supabase.rpc('revisar_cadastro_comprador', {
    p_organizacao_id: cadastro.organizacao_id,
    p_enviada_em: cadastro.enviada_em,
    p_motivo: motivo,
  });
  if (error?.code === 'PT409') throw new Error('O cadastro mudou. Volte à lista e abra a versão atual.');
  if (error) throw error;
}
