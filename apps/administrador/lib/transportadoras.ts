import { supabase } from './supabase';
import type { DecisaoCadastro } from './compradores';

export type CadastroTransportadora = DecisaoCadastro & {
  organizacao_id: string;
  razao_social: string;
  cnpj: string;
  contato_nome: string;
  contato_telefone: string;
  cidade: string;
  uf: string;
  ufs_atendidas: string[];
  tipos_carga: ('carga_seca' | 'refrigerada' | 'granel' | 'animais_vivos')[];
  status: 'em_analise' | 'ajustes_solicitados' | 'aprovada';
  enviada_em: string;
  motivo_ajuste: string | null;
};

export const nomesTiposCarga = {
  carga_seca: 'Carga seca', refrigerada: 'Refrigerada', granel: 'Granel', animais_vivos: 'Animais vivos',
};

const campos = 'organizacao_id,razao_social,cnpj,contato_nome,contato_telefone,cidade,uf,ufs_atendidas,tipos_carga,status,enviada_em,motivo_ajuste,aprovada_por,aprovada_em,ajuste_solicitado_por,ajuste_solicitado_em';

export async function listarTransportadorasPendentes() {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('cadastros_transportadora').select(campos)
    .eq('status', 'em_analise').order('enviada_em').returns<CadastroTransportadora[]>();
  if (error) throw error;
  return data;
}

export async function lerTransportadora(organizacao: string) {
  if (!supabase) throw new Error();
  const { data, error } = await supabase.from('cadastros_transportadora').select(campos)
    .eq('organizacao_id', organizacao).maybeSingle<CadastroTransportadora>();
  if (error) throw error;
  return data;
}

export async function revisarTransportadora(cadastro: CadastroTransportadora, motivo: string | null) {
  if (!supabase) throw new Error();
  const { error } = await supabase.rpc('revisar_cadastro_transportadora', {
    p_organizacao_id: cadastro.organizacao_id,
    p_enviada_em: cadastro.enviada_em,
    p_motivo: motivo,
  });
  if (error?.code === 'PT409') throw new Error('O cadastro mudou. Volte à lista e abra a versão atual.');
  if (error) throw error;
}
