import { supabase } from './supabase';

export const tiposCarga = [
  { value: 'carga_seca', label: 'Carga seca' },
  { value: 'refrigerada', label: 'Refrigerada' },
  { value: 'granel', label: 'Granel' },
  { value: 'animais_vivos', label: 'Animais vivos' },
] as const;
export type TipoCarga = (typeof tiposCarga)[number]['value'];

export type CadastroTransportadora = {
  organizacao_id: string;
  razao_social: string;
  cnpj: string;
  contato_nome: string;
  contato_telefone: string;
  cidade: string;
  uf: string;
  ufs_atendidas: string[];
  tipos_carga: TipoCarga[];
  status: 'em_analise' | 'ajustes_solicitados' | 'aprovada';
  enviada_em: string;
  motivo_ajuste: string | null;
};

export type FormTransportadora = {
  razaoSocial: string;
  cnpj: string;
  contatoNome: string;
  contatoTelefone: string;
  cidade: string;
  uf: string;
  ufsAtendidas: string;
  tiposCarga: TipoCarga[];
};

const campos = 'organizacao_id,razao_social,cnpj,contato_nome,contato_telefone,cidade,uf,ufs_atendidas,tipos_carga,status,enviada_em,motivo_ajuste';

/** "sp, MG / pr" → ['SP', 'MG', 'PR'] */
export const lerUfs = (texto: string) => texto.toUpperCase().split(/[^A-Z]+/).filter(Boolean);

// ponytail: mostra a primeira transportadora da conta; escolher entre várias vem com a troca de contexto (B01).
export async function lerCadastroTransportadora(): Promise<CadastroTransportadora | null> {
  if (!supabase) throw new Error();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error();
  // Filtra pelas organizações da conta: a equipe lê todos os cadastros pela RLS.
  const { data: membros, error: erroMembros } = await supabase.from('membros_organizacao')
    .select('organizacao_id').eq('usuario_id', session.user.id);
  if (erroMembros) throw erroMembros;
  if (!membros.length) return null;
  const { data, error } = await supabase.from('cadastros_transportadora').select(campos)
    .in('organizacao_id', membros.map((m) => m.organizacao_id))
    .order('enviada_em').order('organizacao_id').limit(1).maybeSingle<CadastroTransportadora>();
  if (error) throw error;
  return data;
}

export async function enviarCadastroTransportadora(form: FormTransportadora, atual: CadastroTransportadora | null) {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const cnpj = form.cnpj.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const telefone = form.contatoTelefone.replace(/\D/g, '');
  const ufs = lerUfs(form.ufsAtendidas);
  if (form.razaoSocial.trim().length < 2 || form.contatoNome.trim().length < 2 || form.cidade.trim().length < 2) {
    throw new Error('Preencha razão social, nome do contato e cidade.');
  }
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj)) throw new Error('Confira o CNPJ.');
  if (!/^\d{10,11}$/.test(telefone)) throw new Error('Informe o telefone com DDD.');
  if (!/^[A-Z]{2}$/i.test(form.uf.trim()) || !ufs.length || ufs.some((uf) => uf.length !== 2)) {
    throw new Error('Confira a UF e os estados atendidos (siglas, como SP, MG).');
  }
  if (!form.tiposCarga.length) throw new Error('Escolha ao menos um tipo de carga.');

  const dados = {
    p_razao_social: form.razaoSocial,
    p_cnpj: cnpj,
    p_contato_nome: form.contatoNome,
    p_contato_telefone: telefone,
    p_cidade: form.cidade,
    p_uf: form.uf,
    p_ufs_atendidas: ufs,
    p_tipos_carga: form.tiposCarga,
  };
  const { error } = atual
    ? await supabase.rpc('reenviar_cadastro_transportadora', { ...dados, p_organizacao_id: atual.organizacao_id, p_enviada_em: atual.enviada_em })
    : await supabase.rpc('enviar_cadastro_transportadora', dados);
  if (error?.code === 'PT409') throw new Error('O cadastro mudou. Saia e abra a versão atual.');
  if (error?.code === '23505') throw new Error('Este CNPJ já está cadastrado.');
  if (error?.code === '23514') throw new Error('Confira o CNPJ, a UF e os estados atendidos.');
  if (error?.code === '42501') throw new Error('Esta conta não pode enviar cadastro de transportadora.');
  if (error) throw new Error('Não foi possível enviar o cadastro. Tente novamente.');
}
