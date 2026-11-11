import { formatarData, lerData } from '@agrodireto/ui';
import { exigirSessao, supabase } from './supabase';

export const tiposVeiculo = [
  { value: 'bau', label: 'Baú' },
  { value: 'refrigerado', label: 'Refrigerado' },
  { value: 'graneleiro', label: 'Graneleiro' },
  { value: 'boiadeiro', label: 'Boiadeiro' },
  { value: 'carroceria', label: 'Carroceria' },
] as const;
export type TipoVeiculo = (typeof tiposVeiculo)[number]['value'];

export const categoriasCnh = (['B', 'C', 'D', 'E'] as const).map((c) => ({ value: c, label: `Categoria ${c}` }));
export type CategoriaCnh = (typeof categoriasCnh)[number]['value'];

export type Veiculo = {
  id: string;
  placa: string;
  renavam: string;
  tipo: TipoVeiculo;
  capacidade_kg: number;
  seguro_validade: string;
};

export type Motorista = {
  id: string;
  nome: string;
  cpf: string;
  cnh_numero: string;
  cnh_categoria: CategoriaCnh;
  cnh_validade: string;
  veiculo_id: string | null;
};

export type FormVeiculo = { placa: string; renavam: string; tipo: TipoVeiculo | ''; capacidade: string; seguroValidade: string };
export type FormMotorista = {
  nome: string; cpf: string; cnhNumero: string; cnhCategoria: CategoriaCnh | ''; cnhValidade: string; veiculoId: string;
};

export const rotuloTipo = (tipo: TipoVeiculo) => tiposVeiculo.find((t) => t.value === tipo)?.label ?? tipo;

/** "2027-03-05" → "05/03/2027" */
export const dataBr = (iso: string) => iso.split('-').reverse().join('/');

/** Máscara de digitação: "05032027" → "05/03/2027". Calendário mês a mês é lento para validades de anos. */
export const mascaraData = (texto: string) =>
  texto.replace(/\D/g, '').slice(0, 8).replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');

/** Data do banco já passou? Compara só o dia, no fuso do aparelho. */
export const vencida = (iso: string) => iso < hojeIso();

const hojeIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** "05/03/2027" → "2027-03-05"; inválida → null. */
function dataIso(texto: string) {
  const d = lerData(texto.trim());
  return d ? formatarData(d).split('/').reverse().join('-') : null;
}

export async function lerFrota(organizacaoId: string) {
  if (!supabase) throw new Error();
  const [veiculos, motoristas] = await Promise.all([
    supabase.from('veiculos').select('id,placa,renavam,tipo,capacidade_kg,seguro_validade')
      .eq('organizacao_id', organizacaoId).order('placa').returns<Veiculo[]>(),
    supabase.from('motoristas').select('id,nome,cpf,cnh_numero,cnh_categoria,cnh_validade,veiculo_id')
      .eq('organizacao_id', organizacaoId).order('nome').returns<Motorista[]>(),
  ]);
  if (veiculos.error) throw veiculos.error;
  if (motoristas.error) throw motoristas.error;
  return { veiculos: veiculos.data, motoristas: motoristas.data };
}

function erroGravacao(error: { code?: string } | null, repetido: string) {
  if (!error) return;
  if (error.code === 'PT422') throw new Error('Documento vencido. Informe uma validade a partir de hoje.');
  if (error.code === '23505') throw new Error(repetido);
  if (error.code === '23503') throw new Error('Escolha um veículo da sua frota.');
  if (error.code === '23514') throw new Error('Confira os dados informados.');
  if (error.code === '42501') throw new Error('Esta conta não pode alterar a frota desta transportadora.');
  throw new Error('Não foi possível salvar. Tente novamente.');
}

export async function salvarVeiculo(organizacaoId: string, form: FormVeiculo, id: string | null) {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  await exigirSessao();
  const placa = form.placa.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const renavam = form.renavam.replace(/\D/g, '');
  const capacidade = Number(form.capacidade.replace(/\D/g, ''));
  const seguro = dataIso(form.seguroValidade);
  if (!/^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(placa)) throw new Error('Confira a placa (ex.: ABC1D23 ou ABC-1234).');
  if (!/^\d{11}$/.test(renavam)) throw new Error('O RENAVAM tem 11 dígitos.');
  if (!form.tipo) throw new Error('Escolha o tipo do veículo.');
  if (!capacidade || capacidade > 100000) throw new Error('Informe a capacidade em kg (até 100.000).');
  if (!seguro) throw new Error('Informe a validade do seguro (dd/mm/aaaa).');
  if (vencida(seguro)) throw new Error('Seguro vencido. Informe uma validade a partir de hoje.');
  const { error } = await supabase.rpc('salvar_veiculo', {
    p_id: id, p_organizacao_id: organizacaoId, p_placa: placa, p_renavam: renavam,
    p_tipo: form.tipo, p_capacidade_kg: capacidade, p_seguro_validade: seguro,
  });
  erroGravacao(error, 'Esta placa já está cadastrada.');
}

export async function salvarMotorista(organizacaoId: string, form: FormMotorista, id: string | null) {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  await exigirSessao();
  const cpf = form.cpf.replace(/\D/g, '');
  const cnh = form.cnhNumero.replace(/\D/g, '');
  const validade = dataIso(form.cnhValidade);
  if (form.nome.trim().length < 2) throw new Error('Informe o nome do motorista.');
  if (!/^\d{11}$/.test(cpf)) throw new Error('Confira o CPF.');
  if (!/^\d{11}$/.test(cnh)) throw new Error('O número da CNH tem 11 dígitos.');
  if (!form.cnhCategoria) throw new Error('Escolha a categoria da CNH.');
  if (!validade) throw new Error('Informe a validade da CNH (dd/mm/aaaa).');
  if (vencida(validade)) throw new Error('CNH vencida. Informe uma validade a partir de hoje.');
  const { error } = await supabase.rpc('salvar_motorista', {
    p_id: id, p_organizacao_id: organizacaoId, p_nome: form.nome, p_cpf: cpf, p_cnh_numero: cnh,
    p_cnh_categoria: form.cnhCategoria, p_cnh_validade: validade, p_veiculo_id: form.veiculoId || null,
  });
  // CPF inválido (dígito) cai no check do banco.
  erroGravacao(error, 'Este CPF já está cadastrado nesta transportadora.');
}
