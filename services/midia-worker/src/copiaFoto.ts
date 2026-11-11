import { readFile, stat, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import type { Resultado } from './tipos.ts';

const limiteBytes = 6 * 1024 * 1024;
const limitePixels = 16_000_000;
const assinaturaPng = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function fotoAceita(dados: Buffer) {
  if (dados[0] === 0xff && dados[1] === 0xd8 && dados[2] === 0xff) return true;
  if (dados.toString('ascii', 0, 4) === 'RIFF' && dados.toString('ascii', 8, 12) === 'WEBP') return true;
  if (!dados.subarray(0, 8).equals(assinaturaPng)) return false;
  for (let offset = 8; offset + 12 <= dados.length;) {
    const tipo = dados.toString('ascii', offset + 4, offset + 8);
    if (tipo === 'acTL') return false;
    if (tipo === 'IDAT') return true;
    offset += 12 + dados.readUInt32BE(offset);
  }
  return false;
}

/** Gera uma cópia sem metadados para a etapa de revisão. O original permanece privado. */
export async function prepararCopiaFoto(entrada: string, saida: string): Promise<Resultado> {
  const bytesEntrada = (await stat(entrada)).size;
  const falha = (motivo: string): Resultado => ({ status: 'falhou', tipo: 'foto', bytesEntrada, motivo });
  if (bytesEntrada > limiteBytes) return falha('A foto excede 6 MiB.');

  const dados = await readFile(entrada);
  if (dados.length > limiteBytes || !fotoAceita(dados)) {
    return falha('Use uma foto estática JPEG, PNG ou WebP de até 6 MiB.');
  }

  try {
    const imagem = sharp(dados, { animated: true, failOn: 'warning', limitInputPixels: limitePixels });
    const origem = await imagem.metadata();
    if ((origem.pages ?? 1) !== 1) return falha('Fotos animadas não podem ser preparadas.');

    const { data, info } = await imagem.rotate().webp({ lossless: true }).toBuffer({ resolveWithObject: true });
    const meta = await sharp(data, { limitInputPixels: limitePixels }).metadata();
    if (meta.exif || meta.xmp || meta.iptc) return falha('A cópia ainda contém metadados.');

    await writeFile(saida, data, { flag: 'wx' });
    return {
      status: 'pronta', tipo: 'foto', arquivoSaida: saida, formatoSaida: 'webp',
      bytesEntrada, bytesSaida: data.length, largura: info.width, altura: info.height,
      qualidade: { codec: 'webp-sem-perda' },
    };
  } catch {
    return falha('Não foi possível preparar a cópia da foto. Confira o arquivo e o destino.');
  }
}
