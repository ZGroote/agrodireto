import { execFile } from 'node:child_process';
import { rename, stat, unlink } from 'node:fs/promises';
import { promisify } from 'node:util';
import { config } from './config.ts';
import type { Resultado } from './tipos.ts';

const execFileAsync = promisify(execFile);

/** Roda um programa e devolve a saída. Injetável para testar a lógica sem o FFmpeg instalado. */
export type Executor = (programa: string, argumentos: string[]) => Promise<{ stdout: string; stderr: string }>;

export const executarReal: Executor = async (programa, argumentos) => {
  const { stdout, stderr } = await execFileAsync(programa, argumentos, { maxBuffer: 64 * 1024 * 1024 });
  return { stdout, stderr };
};

export type Sonda = {
  temVideo: boolean;
  largura: number;
  altura: number;
  /** A origem é de 10 bits (HDR, ProRes…): a saída também fica em 10 bits para não perder gradação */
  dezBits: boolean;
  duracaoSeg: number;
  codec?: string;
};

type SaidaFfprobe = {
  streams?: { codec_type?: string; width?: number; height?: number; pix_fmt?: string; codec_name?: string }[];
  format?: { duration?: string };
};

/** Lê as características do arquivo com o ffprobe. Falha se o worker não tiver decodificador (R3D, BRAW, ARI, CRM…). */
export async function sondar(entrada: string, executar: Executor = executarReal): Promise<Sonda> {
  const { stdout } = await executar(config.ffprobe, ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', entrada]);
  const dados = JSON.parse(stdout) as SaidaFfprobe;
  const v = dados.streams?.find((s) => s.codec_type === 'video');
  return {
    temVideo: !!v,
    largura: v?.width ?? 0,
    altura: v?.height ?? 0,
    dezBits: !!v?.pix_fmt && /10le|10be|12le|12be/.test(v.pix_fmt),
    duracaoSeg: Number(dados.format?.duration ?? 0),
    codec: v?.codec_name,
  };
}

/**
 * Argumentos do FFmpeg para recodificar SEM mudar resolução nem taxa de quadros.
 * Remove metadados (o GPS do celular entregaria o local exato da propriedade) e põe o índice no começo
 * do arquivo (+faststart) para o vídeo começar a tocar antes de baixar inteiro.
 */
export function argsCodificacao(entrada: string, saida: string, sonda: Sonda, crf: number, codec: 'hevc' | 'av1'): string[] {
  const pixFmt = sonda.dezBits ? 'yuv420p10le' : 'yuv420p';
  const video =
    codec === 'av1'
      ? ['-c:v', 'libsvtav1', '-crf', String(crf), '-preset', '6', '-pix_fmt', pixFmt]
      : ['-c:v', 'libx265', '-crf', String(crf), '-preset', 'medium', '-pix_fmt', pixFmt, '-tag:v', 'hvc1', '-x265-params', 'log-level=error'];
  return [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    entrada,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0?',
    '-map_metadata',
    '-1',
    ...video,
    '-fps_mode',
    'passthrough',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    saida,
  ];
}

/**
 * Reempacota sem recodificar: só a 1ª faixa de vídeo e a 1ª de áudio, sem metadados nem capítulos.
 * As faixas de dados e legenda ficam de fora (drones gravam o GPS nelas).
 */
export function argsCopiaSemMetadados(entrada: string, saida: string): string[] {
  return ['-y', '-hide_banner', '-loglevel', 'error', '-i', entrada, '-map', '0:v:0', '-map', '0:a:0?',
    '-map_metadata', '-1', '-map_chapters', '-1', '-c', 'copy', '-movflags', '+faststart', saida];
}

/** Extrai a nota do texto que o libvmaf imprime: "VMAF score: 96.21" */
export function lerVmaf(texto: string): number | undefined {
  const m = texto.match(/VMAF score:\s*([0-9]+(?:\.[0-9]+)?)/i);
  return m?.[1] ? Number(m[1]) : undefined;
}

/** Compara o vídeo otimizado com o original e devolve a nota VMAF (0 a 100). */
export async function medirVmaf(entrada: string, otimizado: string, executar: Executor = executarReal): Promise<number | undefined> {
  const { stderr } = await executar(config.ffmpeg, [
    '-hide_banner',
    '-loglevel',
    'info',
    '-i',
    otimizado,
    '-i',
    entrada,
    '-lavfi',
    '[0:v]setpts=PTS-STARTPTS[d];[1:v]setpts=PTS-STARTPTS[r];[d][r]libvmaf=n_subsample=5',
    '-f',
    'null',
    '-',
  ]);
  return lerVmaf(stderr);
}

const apagar = (caminho: string) => unlink(caminho).catch(() => undefined);

/**
 * Otimiza um vídeo. Começa com o CRF padrão do codec e mede o VMAF; se a nota ficar abaixo do mínimo, baixa o CRF
 * (menos compressão) e tenta de novo. Entrega o primeiro resultado que atinge o mínimo, desde que seja menor que o original.
 * Se nenhuma tentativa servir, entrega uma cópia sem metadados; se nem isso der, o original fica privado.
 */
export async function otimizarVideo(entrada: string, saida: string, executar: Executor = executarReal): Promise<Resultado> {
  const bytesEntrada = (await stat(entrada)).size;
  // mantida = sem cópia segura: o original pode ter GPS e fica privado.
  const mantida = (motivo: string): Resultado => ({ status: 'mantida', tipo: 'video', bytesEntrada, motivo: `${motivo} Fica privada.` });

  let sonda: Sonda;
  try {
    sonda = await sondar(entrada, executar);
  } catch {
    return mantida('Formato sem decodificador no worker (ex.: R3D, BRAW, ARI, CRM): original mantido sem tratar metadados.');
  }
  if (!sonda.temVideo) return { status: 'falhou', tipo: 'video', bytesEntrada, motivo: 'O arquivo não tem faixa de vídeo.' };

  const codec = config.codecVideo;
  const temporarios: string[] = [];
  let crf: number = config.crfInicial[codec];
  let ultimaNota: number | undefined;

  /** Sanitizar é obrigatório; comprimir, não. Sem compressão aceita, entrega a cópia sem metadados. */
  const semCompressao = async (porque: string): Promise<Resultado> => {
    try {
      await executar(config.ffmpeg, argsCopiaSemMetadados(entrada, saida));
    } catch {
      await apagar(saida);
      return mantida(`${porque} A cópia sem metadados falhou: original mantido.`);
    }
    return {
      status: 'pronta', tipo: 'video', arquivoSaida: saida, formatoSaida: 'mp4', bytesEntrada,
      bytesSaida: (await stat(saida)).size, largura: sonda.largura, altura: sonda.altura,
      qualidade: { codec: 'copia' }, motivo: `${porque} Entregue cópia sem recodificar e sem metadados.`,
    };
  };

  try {
    for (let tentativa = 0; tentativa < config.tentativasVideo; tentativa += 1) {
      const tmp = `${saida}.tentativa${tentativa}.mp4`;
      temporarios.push(tmp);
      await executar(config.ffmpeg, argsCodificacao(entrada, tmp, sonda, crf, codec));
      const nota = await medirVmaf(entrada, tmp, executar);
      ultimaNota = nota;

      if (nota !== undefined && nota >= config.vmafMinimo) {
        const bytesSaida = (await stat(tmp)).size;
        if (bytesSaida >= bytesEntrada) return await semCompressao('A compressão não ficou menor que o original.');
        await rename(tmp, saida);
        return {
          status: 'pronta',
          tipo: 'video',
          arquivoSaida: saida,
          formatoSaida: 'mp4',
          bytesEntrada,
          bytesSaida,
          largura: sonda.largura,
          altura: sonda.altura,
          qualidade: { vmaf: nota, crf, codec },
        };
      }
      crf = Math.max(0, crf - config.passoCrf);
    }
    return await semCompressao(
      `Nenhuma tentativa atingiu o VMAF mínimo de ${config.vmafMinimo}${ultimaNota !== undefined ? ` (última nota: ${ultimaNota.toFixed(1)})` : ''}.`,
    );
  } catch (e) {
    return { status: 'falhou', tipo: 'video', bytesEntrada, motivo: e instanceof Error ? e.message : 'Erro ao processar o vídeo.' };
  } finally {
    await Promise.all(temporarios.map(apagar));
  }
}
