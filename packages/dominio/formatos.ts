/**
 * Formatos de imagem e vídeo aceitos pela plataforma (lista definida pelo negócio).
 * Valem para os 4 apps e devem ser repetidos no servidor (o app não é a barreira de segurança).
 */

/** Extensões de imagem aceitas (minúsculas, sem ponto). */
export const FORMATOS_IMAGEM = [
  'jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff', 'tif', 'svg', 'ico', 'icns', 'heic', 'heif',
  'raw', 'cr2', 'cr3', 'nef', 'nrw', 'arw', 'srf', 'sr2', 'dng', 'orf', 'rw2', 'raf', 'pef',
  'psd', 'psb', 'ai', 'eps', 'pdf', 'jp2', 'j2k', 'jpf', 'jxl', 'exr', 'hdr', 'tga', 'dds', 'pcx',
  'ppm', 'pgm', 'pbm', 'pnm', 'xbm', 'xpm', 'cur', 'apng', 'qoi', 'fits', 'wbmp',
] as const;

/** Extensões de contêiner de vídeo aceitas. */
export const FORMATOS_VIDEO = [
  'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', '3gp', '3g2',
  'ts', 'mts', 'm2ts', 'vob', 'ogv', 'ogg', 'asf', 'rm', 'rmvb', 'f4v', 'f4p', 'f4a', 'f4b',
  'dv', 'mxf', 'gxf', 'nut', 'nsv', 'dvr-ms', 'y4m', 'yuv', 'r3d', 'braw', 'ari', 'crm',
  // Fluxos brutos de codec (a lista do negócio cita codecs, que também chegam como arquivo próprio)
  'h264', '264', 'h265', '265', 'hevc', 'h266', 'vvc', 'av1', 'ivf', 'vp8', 'vp9',
  'm1v', 'm2v', 'mp4v', 'mjpeg', 'mjpg', 'xvid', 'divx',
] as const;

/** Codecs de vídeo aceitos dentro dos contêineres. */
export const CODECS_VIDEO = [
  'ProRes', 'H.264', 'H.265 (HEVC)', 'H.266 (VVC)', 'AV1', 'VP8', 'VP9', 'MPEG-1', 'MPEG-2', 'MPEG-4',
  'Theora', 'Xvid', 'DivX', 'MJPEG', 'CineForm', 'DNxHD', 'DNxHR', 'Hap', 'Animation', 'FFV1',
] as const;

export type FormatoImagem = (typeof FORMATOS_IMAGEM)[number];
export type FormatoVideo = (typeof FORMATOS_VIDEO)[number];

/** Subtipos de MIME que não coincidem com a extensão. */
const MIME_PARA_EXTENSAO: Record<string, string> = {
  quicktime: 'mov',
  'x-msvideo': 'avi',
  'x-matroska': 'mkv',
  'x-ms-wmv': 'wmv',
  'x-flv': 'flv',
  mpeg: 'mpeg',
  'svg+xml': 'svg',
  'vnd.microsoft.icon': 'ico',
  'x-icon': 'ico',
  'x-ms-bmp': 'bmp',
  'x-tga': 'tga',
  'vnd.adobe.photoshop': 'psd',
  'x-adobe-dng': 'dng',
  jp2: 'jp2',
  jxl: 'jxl',
  'heic-sequence': 'heic',
  'heif-sequence': 'heif',
};

const dasImagens: readonly string[] = FORMATOS_IMAGEM;
const dosVideos: readonly string[] = FORMATOS_VIDEO;

export type ArquivoParaClassificar = { nome: string; mime?: string };

/** Descobre se o arquivo é foto ou vídeo aceito. Usa a extensão e, na falta dela, o MIME. */
export function classificarArquivo(arquivo: ArquivoParaClassificar): 'foto' | 'video' | null {
  const partes = arquivo.nome.toLowerCase().split('.');
  const extensao = partes.length > 1 ? (partes[partes.length - 1] ?? '') : '';
  if (dasImagens.includes(extensao)) return 'foto';
  if (dosVideos.includes(extensao)) return 'video';

  // Sem extensão reconhecida (ex.: arquivo da galeria sem nome): usa o MIME.
  if (arquivo.mime) {
    const [grupo, subtipo = ''] = arquivo.mime.toLowerCase().split('/');
    const equivalente = MIME_PARA_EXTENSAO[subtipo] ?? subtipo;
    if (grupo === 'image' && dasImagens.includes(equivalente)) return 'foto';
    if (grupo === 'video' && dosVideos.includes(equivalente)) return 'video';
  }
  return null;
}

/** Texto para o usuário: "JPG, JPEG, PNG…" */
export const listaFormatos = (formatos: readonly string[]): string => formatos.map((f) => f.toUpperCase()).join(', ');
