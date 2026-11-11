export type CadastroComprador = {
  organizacao_id: string;
  razao_social: string;
  cnpj: string;
  contato_nome: string;
  contato_telefone: string;
  cidade: string;
  uf: string;
  endereco_entrega: string;
  status: 'em_analise' | 'ajustes_solicitados' | 'aprovada';
  enviada_em: string;
  motivo_ajuste: string | null;
};

export const camposCadastroComprador =
  'organizacao_id,razao_social,cnpj,contato_nome,contato_telefone,cidade,uf,endereco_entrega,status,enviada_em,motivo_ajuste';

/** Remove pontuação e coloca em maiúsculas: "12.abc.345/01de-35" vira "12ABC34501DE35". */
export function normalizarCnpj(cnpj: string) {
  return cnpj.replace(/[^0-9a-z]/gi, '').toUpperCase();
}

/** CNPJ numérico ou alfanumérico (desde 07/2026): 12 posições [0-9A-Z] e 2 dígitos verificadores. Mesma regra do banco. */
export function cnpjValido(cnpj: string) {
  const c = normalizarCnpj(cnpj);
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c) || /^(.)\1{13}$/.test(c)) return false;
  const v = [...c].map((ch) => ch.charCodeAt(0) - 48);
  const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (const n of [12, 13]) {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += v[i] * pesos[i + 13 - n];
    const resto = soma % 11;
    if ((resto < 2 ? 0 : 11 - resto) !== v[n]) return false;
  }
  return true;
}
