import { stat, writeFile } from 'node:fs/promises';
import sharp, { type Metadata, type Sharp } from 'sharp';
import { config } from './config.ts';
import type { Resultado } from './tipos.ts';

/** Formatos cuja origem já não tem perda (só o WebP sem perda não degrada nada). */
const ORIGEM_SEM_PERDA = new Set(['png', 'gif', 'tiff', 'ppm', 'fits', 'magick', 'vips', 'raw']);
/** Vetoriais e documentos: não viram pixel (seria perder resolução). */
const VETORIAL = new Set(['svg', 'pdf']);

/** PSNR (dB) entre dois buffers de pixels do mesmo tamanho. Infinito = idênticos. */
export function psnr(a: Buffer, b: Buffer): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let soma = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    soma += d * d;
  }
  const mse = soma / a.length;
  return mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);
}

/**
 * Pixels para comparar. A transparência é composta sobre fundo branco nos dois lados: as cores que ficam
 * escondidas debaixo de pixels transparentes não aparecem e o WebP as descarta de propósito.
 */
const pixels = (img: Sharp) => img.toColourspace('srgb').flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });

type Candidato = { buffer: Buffer; psnrDb?: number; rotulo: string };

/**
 * Otimiza uma imagem para WebP SEM mudar a resolução.
 * Tenta WebP com perda em qualidade alta e confere o PSNR contra o original; se não passar, sobe a qualidade
 * e, por fim, usa WebP sem perda. Se nada ficar menor, entrega o WebP sem perda mesmo assim: sem metadados é obrigatório.
 * Metadados (incluindo o GPS do celular) são removidos de propósito: o local exato da propriedade não pode vazar.
 */
export async function otimizarImagem(entrada: string, saida: string): Promise<Resultado> {
  const bytesEntrada = (await stat(entrada)).size;
  // mantida = sem cópia segura: o original pode ter EXIF/GPS e fica privado.
  const mantida = (motivo: string): Resultado => ({ status: 'mantida', tipo: 'foto', bytesEntrada, motivo: `${motivo} Fica privada.` });

  let meta: Metadata;
  try {
    meta = await sharp(entrada, { animated: true, failOn: 'none' }).metadata();
  } catch (e) {
    return mantida(`Formato sem leitor de imagem no worker: original mantido sem tratar metadados. (${e instanceof Error ? e.message : 'erro'})`);
  }

  const formato = meta.format ?? '';
  if (VETORIAL.has(formato)) return mantida('Formato vetorial ou documento: original mantido sem tratar metadados.');

  const largura = meta.width ?? 0;
  const altura = meta.pageHeight ?? meta.height ?? 0;
  if (largura > config.limiteWebpPx || altura > config.limiteWebpPx) {
    return mantida(`Dimensão acima do limite do WebP (${config.limiteWebpPx} px): original mantido para não reduzir a resolução.`);
  }

  const animada = (meta.pages ?? 1) > 1;
  const base = () => sharp(entrada, { animated: animada, failOn: 'none' }).rotate();

  const candidatos: Candidato[] = [];

  if (animada) {
    // Animação (GIF, APNG, WebP animado): sem PSNR por quadro; só garante que ficou menor.
    candidatos.push({ buffer: await base().webp({ quality: config.webpQualidade, effort: 5 }).toBuffer(), rotulo: 'webp-animado' });
  } else {
    const referencia = await pixels(base());
    const avaliar = async (buffer: Buffer, rotulo: string): Promise<Candidato> => {
      const dec = await pixels(sharp(buffer));
      const mesmoTamanho = dec.info.width === referencia.info.width && dec.info.height === referencia.info.height;
      return { buffer, rotulo, psnrDb: mesmoTamanho ? psnr(referencia.data, dec.data) : 0 };
    };
    const valido = (c: Candidato) => (c.psnrDb ?? 0) >= config.psnrMinimoDb;

    const q1 = await avaliar(await base().webp({ quality: config.webpQualidade, effort: 5, smartSubsample: true }).toBuffer(), `webp-q${config.webpQualidade}`);
    candidatos.push(q1);
    if (!valido(q1)) {
      const q2 = await avaliar(await base().webp({ quality: 95, effort: 5, smartSubsample: true }).toBuffer(), 'webp-q95');
      candidatos.push(q2);
    }
    if (!candidatos.some(valido) || ORIGEM_SEM_PERDA.has(formato)) {
      candidatos.push(await avaliar(await base().webp({ lossless: true, effort: 5 }).toBuffer(), 'webp-sem-perda'));
    }
    // Só concorrem os que mantêm a qualidade (o sem perda é sempre válido: PSNR infinito).
    for (let i = candidatos.length - 1; i >= 0; i -= 1) {
      const c = candidatos[i];
      if (c && !valido(c)) candidatos.splice(i, 1);
    }
  }

  let melhor = candidatos.reduce<Candidato | undefined>((a, b) => (!a || b.buffer.length < a.buffer.length ? b : a), undefined);
  let motivo: string | undefined;
  if (!melhor || melhor.buffer.length >= bytesEntrada) {
    // Sanitizar é obrigatório; comprimir, não. Sem ganho, entrega a cópia sem perda e sem metadados, mesmo maior.
    melhor = { buffer: await base().webp({ lossless: true, effort: 5 }).toBuffer(), rotulo: 'webp-sem-perda' };
    motivo = 'A compressão não ficou menor: entregue cópia sem perda e sem metadados.';
  }

  await writeFile(saida, melhor.buffer);
  return {
    status: 'pronta',
    tipo: 'foto',
    arquivoSaida: saida,
    formatoSaida: 'webp',
    bytesEntrada,
    bytesSaida: melhor.buffer.length,
    largura,
    altura,
    qualidade: { psnrDb: melhor.psnrDb === Infinity ? undefined : melhor.psnrDb, codec: melhor.rotulo },
    motivo,
  };
}
