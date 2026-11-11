import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import sharp from 'sharp';
import { config } from '../src/config.ts';
import { prepararCopiaFoto } from '../src/copiaFoto.ts';
import { otimizarImagem, psnr } from '../src/imagem.ts';
import { processarArquivo } from '../src/processar.ts';

let pasta = '';
before(async () => {
  // No Windows o cache de arquivos do sharp segura os arquivos abertos e impede a limpeza.
  sharp.cache(false);
  pasta = await mkdtemp(join(tmpdir(), 'midia-worker-'));
});
after(async () => {
  await rm(pasta, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
});

/** Imagem "de foto": degradê suave com um ruído leve, como uma foto de câmera. */
function pixelsDeFoto(largura: number, altura: number): Buffer {
  const dados = Buffer.alloc(largura * altura * 3);
  let semente = 12345;
  const ruido = () => {
    semente = (semente * 1103515245 + 12345) & 0x7fffffff;
    return (semente % 5) - 2;
  };
  for (let y = 0; y < altura; y += 1) {
    for (let x = 0; x < largura; x += 1) {
      const i = (y * largura + x) * 3;
      dados[i] = Math.max(0, Math.min(255, Math.round((x / largura) * 255) + ruido()));
      dados[i + 1] = Math.max(0, Math.min(255, Math.round((y / altura) * 255) + ruido()));
      dados[i + 2] = Math.max(0, Math.min(255, Math.round(((x + y) / (largura + altura)) * 255) + ruido()));
    }
  }
  return dados;
}

describe('otimização de imagem', () => {
  it('JPEG: gera WebP menor, na MESMA resolução, com qualidade acima do mínimo', async () => {
    const entrada = join(pasta, 'foto.jpg');
    await sharp(pixelsDeFoto(1600, 1200), { raw: { width: 1600, height: 1200, channels: 3 } }).jpeg({ quality: 95 }).toFile(entrada);

    const r = await otimizarImagem(entrada, join(pasta, 'foto.webp'));

    assert.equal(r.status, 'pronta', r.motivo ?? 'sem motivo');
    assert.equal(r.formatoSaida, 'webp');
    assert.ok(r.bytesSaida !== undefined && r.bytesSaida < r.bytesEntrada, 'ficou menor');
    assert.ok((r.qualidade?.psnrDb ?? Infinity) >= config.psnrMinimoDb, 'qualidade acima do mínimo');
    const meta = await sharp(join(pasta, 'foto.webp')).metadata();
    assert.equal(meta.width, 1600);
    assert.equal(meta.height, 1200);
    assert.equal(meta.format, 'webp');
  });

  it('remove os metadados (o GPS do celular não pode vazar)', async () => {
    const entrada = join(pasta, 'com-exif.jpg');
    await sharp(pixelsDeFoto(800, 600), { raw: { width: 800, height: 600, channels: 3 } })
      .jpeg({ quality: 95 })
      .withExif({ IFD0: { Copyright: 'dado-sensivel' } })
      .toFile(entrada);
    assert.ok((await sharp(entrada).metadata()).exif, 'a entrada tem EXIF');

    const r = await otimizarImagem(entrada, join(pasta, 'com-exif.webp'));

    assert.equal(r.status, 'pronta', r.motivo ?? 'sem motivo');
    assert.equal((await sharp(join(pasta, 'com-exif.webp')).metadata()).exif, undefined);
  });

  it('respeita a orientação da câmera e nunca troca a resolução', async () => {
    const entrada = join(pasta, 'girada.jpg');
    // 600x300 gravado com a orientação 6 (girar 90°): a foto de verdade é 300x600.
    await sharp(pixelsDeFoto(600, 300), { raw: { width: 600, height: 300, channels: 3 } }).jpeg({ quality: 95 }).withMetadata({ orientation: 6 }).toFile(entrada);

    const r = await otimizarImagem(entrada, join(pasta, 'girada.webp'));

    assert.equal(r.status, 'pronta', r.motivo ?? 'sem motivo');
    const meta = await sharp(join(pasta, 'girada.webp')).metadata();
    assert.equal(meta.width, 300);
    assert.equal(meta.height, 600);
  });

  it('PNG com transparência: preserva o canal alfa e a resolução', async () => {
    const entrada = join(pasta, 'logo.png');
    const l = 800;
    const a = 600;
    const dados = Buffer.alloc(l * a * 4);
    for (let y = 0; y < a; y += 1) {
      for (let x = 0; x < l; x += 1) {
        const i = (y * l + x) * 4;
        const bloco = (Math.floor(x / 100) + Math.floor(y / 100)) % 2;
        dados[i] = bloco ? 36 : 235;
        dados[i + 1] = bloco ? 89 : 240;
        dados[i + 2] = bloco ? 67 : 226;
        dados[i + 3] = x < 100 ? 0 : 255;
      }
    }
    await sharp(dados, { raw: { width: l, height: a, channels: 4 } }).png({ compressionLevel: 1 }).toFile(entrada);

    const r = await otimizarImagem(entrada, join(pasta, 'logo.webp'));

    assert.equal(r.status, 'pronta', r.motivo ?? 'sem motivo');
    const meta = await sharp(join(pasta, 'logo.webp')).metadata();
    assert.equal(meta.hasAlpha, true);
    assert.equal(meta.width, l);
    assert.equal(meta.height, a);
  });

  it('SVG (vetorial): mantém o original, sem virar pixel', async () => {
    const entrada = join(pasta, 'desenho.svg');
    await writeFile(entrada, '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>');
    const r = await otimizarImagem(entrada, join(pasta, 'desenho.webp'));
    assert.equal(r.status, 'mantida');
    assert.match(r.motivo ?? '', /vetorial/i);
  });

  it('formato sem leitor (RAW de câmera): mantém o original em vez de falhar', async () => {
    const entrada = join(pasta, 'IMG_0001.cr2');
    await writeFile(entrada, Buffer.from('conteudo que nenhum leitor de imagem entende'));
    const r = await otimizarImagem(entrada, join(pasta, 'IMG_0001.webp'));
    assert.equal(r.status, 'mantida');
  });

  it('nunca entrega um arquivo maior que o original', async () => {
    const entrada = join(pasta, 'minusculo.png');
    await sharp({ create: { width: 4, height: 4, channels: 3, background: '#245943' } }).png({ compressionLevel: 9 }).toFile(entrada);
    const r = await otimizarImagem(entrada, join(pasta, 'minusculo.webp'));
    if (r.status === 'pronta') assert.ok((r.bytesSaida ?? Infinity) < r.bytesEntrada);
    else assert.equal(r.status, 'mantida');
  });

  it('o despachante recusa formato fora da lista do negócio', async () => {
    const entrada = join(pasta, 'planilha.xlsx');
    await writeFile(entrada, 'x');
    const r = await processarArquivo(entrada, 'planilha.xlsx', pasta);
    assert.equal(r.status, 'falhou');
    assert.equal(r.motivo, 'Formato não aceito.');
  });

  it('o despachante escolhe imagem pela extensão da lista (maiúscula também)', async () => {
    const entrada = join(pasta, 'FOTO-GRANDE.JPG');
    await sharp(pixelsDeFoto(640, 480), { raw: { width: 640, height: 480, channels: 3 } }).jpeg({ quality: 95 }).toFile(entrada);
    const r = await processarArquivo(entrada, 'FOTO-GRANDE.JPG', pasta);
    assert.equal(r.tipo, 'foto');
    assert.equal(r.status, 'pronta', r.motivo ?? 'sem motivo');
    assert.ok((await stat(join(pasta, 'FOTO-GRANDE.webp'))).size > 0);
  });
});

describe('cópia de foto sem metadados', () => {
  it('gera uma cópia mesmo quando ela fica maior e preserva a orientação', async () => {
    const entrada = join(pasta, 'privada.jpg');
    const saida = join(pasta, 'privada.sanitizada.webp');
    await sharp(pixelsDeFoto(800, 600), { raw: { width: 800, height: 600, channels: 3 } })
      .jpeg({ quality: 20 }).withMetadata({ orientation: 6 })
      .toFile(entrada);
    const original = await readFile(entrada);
    const metadadosOriginais = await sharp(original).metadata();
    assert.ok(metadadosOriginais.exif);
    assert.equal(metadadosOriginais.orientation, 6);

    const resultado = await prepararCopiaFoto(entrada, saida);
    assert.equal(resultado.status, 'pronta', resultado.motivo ?? 'sem motivo');
    assert.ok((resultado.bytesSaida ?? 0) > resultado.bytesEntrada);
    const meta = await sharp(saida).metadata();
    assert.deepEqual([meta.width, meta.height], [600, 800]);
    assert.equal(meta.exif, undefined);
    assert.equal(meta.xmp, undefined);
    assert.equal(meta.iptc, undefined);
    assert.deepEqual(await readFile(entrada), original);
  });

  it('recusa SVG renomeado e não deixa uma cópia', async () => {
    const entrada = join(pasta, 'vetor.png');
    const saida = join(pasta, 'vetor.sanitizada.webp');
    await writeFile(entrada, '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
    assert.equal((await prepararCopiaFoto(entrada, saida)).status, 'falhou');
    await assert.rejects(stat(saida), { code: 'ENOENT' });
  });
});

describe('PSNR', () => {
  it('idênticos = infinito; diferentes = finito e menor', () => {
    const a = Buffer.from([10, 20, 30, 40]);
    assert.equal(psnr(a, Buffer.from(a)), Infinity);
    assert.ok(psnr(a, Buffer.from([12, 20, 30, 40])) < Infinity);
    assert.ok(psnr(a, Buffer.from([60, 20, 30, 40])) < psnr(a, Buffer.from([12, 20, 30, 40])));
    assert.equal(psnr(a, Buffer.from([1, 2])), 0);
  });
});
