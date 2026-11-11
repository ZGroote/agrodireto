export const rotulosInspecao = {
  aprovado: 'Aprovado',
  ressalvas: 'Aprovado com ressalvas',
  reprovado: 'Reprovado',
} as const;

export type ResultadoInspecao = {
  resultado: keyof typeof rotulosInspecao;
  inspecionada_em: string;
};

export type OfertaCatalogo = {
  id: string;
  produto: string;
  fornecedor: string;
  cidade: string;
  uf: string;
  quantidade: number;
  unidade: 'kg' | 'cx' | 't';
  preco_centavos: number;
  colheita: string | null;
  retirada_inicio: string;
  retirada_fim: string;
  validade: string;
  padrao: string;
  calibre: string;
  embalagem: string;
  condicoes: string;
};
