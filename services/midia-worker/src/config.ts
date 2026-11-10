import { tmpdir } from 'node:os';

const numero = (valor: string | undefined, padrao: number): number => {
  if (valor === undefined || valor === '') return padrao;
  const n = Number(valor);
  return Number.isFinite(n) ? n : padrao;
};

/**
 * Parâmetros da otimização. Tudo pode ser ajustado por variável de ambiente, sem mexer no código.
 * Regra de ouro: NUNCA reduzir a resolução. O worker só troca a codificação e mede a qualidade.
 */
export const config = {
  /** hevc = H.265 (padrão: bem menor que H.264 e toca em quase todo celular) · av1 = SVT-AV1 (menor ainda, menos compatível) */
  codecVideo: (process.env.CODEC_VIDEO === 'av1' ? 'av1' : 'hevc') as 'hevc' | 'av1',
  /** Nota VMAF mínima (0 a 100). Abaixo disso o vídeo é recodificado com menos compressão. 95 = visualmente idêntico */
  vmafMinimo: numero(process.env.VMAF_MINIMO, 95),
  /** CRF de partida por codec (menor = mais qualidade e arquivo maior) */
  crfInicial: { hevc: 24, av1: 32 },
  /** Quanto o CRF baixa a cada tentativa que não atinge o VMAF mínimo, e quantas tentativas */
  passoCrf: 3,
  tentativasVideo: 3,
  /** Qualidade do WebP com perda (0 a 100) e PSNR mínimo (dB) entre original e otimizado */
  webpQualidade: numero(process.env.WEBP_QUALIDADE, 90),
  psnrMinimoDb: numero(process.env.PSNR_MINIMO_DB, 38),
  /** O WebP não passa de 16383 px por lado; acima disso o original é mantido (a resolução nunca diminui) */
  limiteWebpPx: 16383,
  ffmpeg: process.env.FFMPEG_PATH ?? 'ffmpeg',
  ffprobe: process.env.FFPROBE_PATH ?? 'ffprobe',
  pastaTemporaria: process.env.PASTA_TEMPORARIA ?? tmpdir(),
  /** Quantos arquivos processar ao mesmo tempo (vídeo é pesado: 1 por padrão) */
  concorrencia: numero(process.env.CONCORRENCIA, 1),
  /** Depois de otimizar com sucesso, apagar o original do Storage para não acumular volume */
  apagarOriginalAposOtimizar: process.env.APAGAR_ORIGINAL_APOS_OTIMIZAR !== 'false',
} as const;
