import { camposCadastroComprador, type CadastroComprador } from '@agrodireto/dominio';
import { supabase } from './supabase';

export type DecisaoCadastro = {
  aprovada_por: string | null;
  aprovada_em: string | null;
  ajuste_solicitado_por: string | null;
  ajuste_solicitado_em: string | null;
};

export type CompradorEmAnalise = CadastroComprador & DecisaoCadastro;
const campos = `${camposCadastroComprador},aprovada_por,aprovada_em,ajuste_solicitado_por,ajuste_solicitado_em`;

export async function listarCompradoresPendentes() {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('cadastros_comprador').select(campos)
    .eq('status', 'em_analise').order('enviada_em').returns<CadastroComprador[]>();
  if (error) throw error;
  return data;
}

export async function lerComprador(organizacao: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('cadastros_comprador').select(campos)
    .eq('organizacao_id', organizacao).maybeSingle<CompradorEmAnalise>();
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
