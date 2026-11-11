import { camposCadastroComprador, cnpjValido, type CadastroComprador } from '@agrodireto/dominio';
import { supabase } from './supabase';

export type DadosEmpresa = Pick<CadastroComprador,
  'razao_social' | 'cnpj' | 'contato_nome' | 'contato_telefone' | 'cidade' | 'uf' | 'endereco_entrega'>;

/** Empresa aprovada ou conta liberada na homologação: quem decide é o servidor. Falha conta como "não". */
export async function compradorAutorizado() {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('sou_comprador_autorizado');
  return !error && data === true;
}

// ponytail: uma empresa por conta por enquanto; "Trocar empresa" vem quando houver membros.
export async function lerCadastroComprador(): Promise<CadastroComprador | null> {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const { data, error } = await supabase.from('cadastros_comprador').select(camposCadastroComprador)
    .order('enviada_em').limit(1).maybeSingle<CadastroComprador>();
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
  const { error } = atual
    ? await supabase.rpc('reenviar_cadastro_comprador', {
      ...campos, p_organizacao_id: atual.organizacao_id, p_enviada_em: atual.enviada_em,
    })
    : await supabase.rpc('enviar_cadastro_comprador', campos);
  if (error?.code === 'PT409') throw new Error('O cadastro mudou. Volte e abra a versão atual.');
  if (error?.code === '23505') throw new Error('Este CNPJ já está cadastrado. Fale com o suporte.');
  if (error?.code === '23514') throw new Error('Confira o CNPJ, a UF e os limites dos campos.');
  if (error) throw new Error('Não foi possível enviar o cadastro. Tente novamente.');
}
