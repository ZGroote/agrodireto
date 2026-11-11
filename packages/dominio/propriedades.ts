export type PropriedadeEnviada = {
  id: string;
  organizacao_id: string;
  nome: string;
  cidade: string;
  uf: string;
  area: number;
  culturas: string;
  status: 'em_analise' | 'ajustes_solicitados' | 'aprovada';
  enviada_em: string;
  motivo_ajuste: string | null;
};

export const camposPropriedadeEnviada = 'id,organizacao_id,nome,cidade,uf,area,culturas,status,enviada_em,motivo_ajuste';
