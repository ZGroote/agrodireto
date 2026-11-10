import type { StatusProcessamento } from '@agrodireto/dominio';

/** Resultado da otimização de um arquivo. */
export type Resultado = {
  /** pronta = gerou arquivo menor com a qualidade garantida · mantida = o original fica · falhou = erro */
  status: Extract<StatusProcessamento, 'pronta' | 'mantida' | 'falhou'>;
  tipo?: 'foto' | 'video';
  /** Caminho do arquivo otimizado (só quando status = pronta) */
  arquivoSaida?: string;
  formatoSaida?: string;
  bytesEntrada: number;
  bytesSaida?: number;
  largura?: number;
  altura?: number;
  /** Medidas de qualidade que justificaram o resultado */
  qualidade?: { psnrDb?: number; vmaf?: number; crf?: number; codec?: string };
  /** Por que o original foi mantido ou por que falhou */
  motivo?: string;
};
