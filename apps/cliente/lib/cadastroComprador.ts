import { camposCadastroComprador, cnpjValido, type CadastroComprador } from '@agrodireto/dominio';
import { mensagemEscolherEmpresa, organizacaoEmUso, trocarContexto } from './organizacoes';
import { supabase } from './supabase';

export type DadosEmpresa = Pick<CadastroComprador,
  'razao_social' | 'cnpj' | 'contato_nome' | 'contato_telefone' | 'cidade' | 'uf' | 'endereco_entrega'>;

/** Empresa aprovada ou conta liberada na homologação: quem decide é o servidor. Falha conta como "não". */
export async function compradorAutorizado() {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('sou_comprador_autorizado');
  return !error && data === true;
}

/** Cadastro da empresa em uso (B01). Sem empresa e sem vínculo: null (formulário de empresa nova). */
export async function lerCadastroComprador(): Promise<CadastroComprador | null> {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const organizacao = await organizacaoEmUso();
  if (!organizacao) return null;
  const { data, error } = await supabase.from('cadastros_comprador').select(camposCadastroComprador)
    .eq('organizacao_id', organizacao).maybeSingle<CadastroComprador>();
  if (error) throw error;
  return data;
}

export async function enviarCadastroComprador(dados: DadosEmpresa, atual?: CadastroComprador) {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const telefone = dados.contato_telefone.replace(/\D/g, '');
  if (dados.razao_social.trim().length < 2 || !cnpjValido(dados.cnpj) || dados.contato_nome.trim().length < 2 ||
    !/^\d{10,11}$/.test(telefone) || dados.cidade.trim().length < 2 || !/^[a-z]{2}$/i.test(dados.uf.trim()) ||
    dados.endereco_entrega.trim().length < 5) {
    throw new Error('Confira a razão social, o CNPJ, o telefone com DDD, a cidade, a UF e o endereço.');
  }
  const campos = {
    p_razao_social: dados.razao_social,
    p_cnpj: dados.cnpj,
    p_contato_nome: dados.contato_nome,
    p_contato_telefone: telefone,
    p_cidade: dados.cidade,
    p_uf: dados.uf,
    p_endereco_entrega: dados.endereco_entrega,
  };
  const { data: criada, error } = atual
    ? await supabase.rpc('reenviar_cadastro_comprador', {
      ...campos, p_organizacao_id: atual.organizacao_id, p_enviada_em: atual.enviada_em,
    })
    : await supabase.rpc('enviar_cadastro_comprador', campos);
  if (error?.code === '42501' && atual) throw new Error('Só o titular corrige o cadastro da empresa.');
  if (error?.code === 'PT409') throw new Error('O cadastro mudou. Volte e abra a versão atual.');
  if (error?.code === '23505') throw new Error('Este CNPJ já está cadastrado. Fale com o suporte.');
  if (error?.code === '23514') throw new Error('Confira o CNPJ, a UF e os limites dos campos.');
  if (error) throw new Error('Não foi possível enviar o cadastro. Tente novamente.');
  // Primeiro envio criou a empresa: o próprio envio é a escolha do usuário.
  if (!atual) await trocarContexto(criada as string).catch(() => { throw new Error(`Cadastro enviado. ${mensagemEscolherEmpresa}`); });
}
