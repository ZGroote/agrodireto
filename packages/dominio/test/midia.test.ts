import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calcularExpiracao,
  classificarArquivo,
  contarMidias,
  formatarTamanho,
  LIMITES_MIDIA,
  midiaExpiraComAProducao,
  podeValidarMidia,
  podeVerMidia,
  validarNovasMidias,
  type Midia,
} from '../index.ts';

const IMAGENS = 'JPG JPEG PNG WebP AVIF GIF BMP TIFF TIF SVG ICO ICNS HEIC HEIF RAW CR2 CR3 NEF NRW ARW SRF SR2 DNG ORF RW2 RAF PEF PSD PSB AI EPS PDF JP2 J2K JPF JXL EXR HDR TGA DDS PCX PPM PGM PBM PNM XBM XPM CUR APNG QOI FITS WBMP'.split(' ');
const VIDEOS = 'MP4 MKV AVI MOV WMV FLV WebM MPEG MPG M4V 3GP 3G2 TS MTS M2TS VOB OGV OGG ASF RM RMVB F4V F4P F4A F4B DV MXF GXF NUT NSV DVR-MS Y4M YUV R3D BRAW ARI CRM'.split(' ');

describe('formatos aceitos (lista do negócio)', () => {
  it(`reconhece os ${IMAGENS.length} formatos de imagem`, () => {
    for (const e of IMAGENS) assert.equal(classificarArquivo({ nome: `arquivo.${e}` }), 'foto', e);
  });
  it(`reconhece os ${VIDEOS.length} formatos de vídeo`, () => {
    for (const e of VIDEOS) assert.equal(classificarArquivo({ nome: `arquivo.${e}` }), 'video', e);
  });
  it('ignora maiúsculas e usa o MIME quando falta a extensão', () => {
    assert.equal(classificarArquivo({ nome: 'FOTO.JPG' }), 'foto');
    assert.equal(classificarArquivo({ nome: 'IMG_0001', mime: 'image/heic' }), 'foto');
    assert.equal(classificarArquivo({ nome: 'VID', mime: 'video/quicktime' }), 'video');
  });
  it('recusa o que está fora da lista', () => {
    assert.equal(classificarArquivo({ nome: 'virus.exe' }), null);
    assert.equal(classificarArquivo({ nome: 'planilha.xlsx' }), null);
    assert.equal(classificarArquivo({ nome: 'sem-extensao' }), null);
  });
});

describe('limite de 100 fotos e 100 vídeos por produto', () => {
  it('recusa a 101ª foto e ainda aceita um vídeo', () => {
    const cem = Array.from({ length: LIMITES_MIDIA.fotos }, () => ({ tipo: 'foto' as const }));
    const r = validarNovasMidias(cem, [{ nome: 'a.jpg' }, { nome: 'b.mp4' }]);
    assert.deepEqual(r.recusados.map((x) => x.nome), ['a.jpg']);
    assert.deepEqual(r.aceitos.map((x) => x.tipo), ['video']);
  });
  it('aceita só o que cabe numa seleção múltipla', () => {
    const noventaECinco = Array.from({ length: 95 }, () => ({ tipo: 'foto' as const }));
    const r = validarNovasMidias(noventaECinco, Array.from({ length: 10 }, (_, i) => ({ nome: `${i}.png` })));
    assert.equal(r.aceitos.length, 5);
    assert.equal(r.recusados.length, 5);
  });
  it('drone conta como vídeo', () => {
    assert.equal(contarMidias([{ tipo: 'drone' }, { tipo: 'video' }, { tipo: 'foto' }]).videos, 2);
  });
  it('explica o motivo da recusa', () => {
    assert.equal(validarNovasMidias([], [{ nome: 'x.docx' }]).recusados[0]?.motivo, 'Formato não aceito.');
  });
});

describe('retenção: apagar depois que a produção termina', () => {
  it('apaga 30 dias depois do encerramento (inclusive virando o ano)', () => {
    assert.equal(calcularExpiracao('2026-11-12'), '2026-12-12');
    assert.equal(calcularExpiracao('2026-12-20'), '2027-01-19');
  });
  it('mídia de lote e de cultura expira; a da propriedade não', () => {
    assert.equal(midiaExpiraComAProducao({ tipo: 'lote', id: 'x' }), true);
    assert.equal(midiaExpiraComAProducao({ tipo: 'cultura', id: 'x' }), true);
    assert.equal(midiaExpiraComAProducao({ tipo: 'propriedade', id: 'x' }), false);
  });
  it('formata o tamanho', () => {
    assert.equal(formatarTamanho(3_250_000), '3,1 MB');
  });
});

const base: Omit<Midia, 'status' | 'visibilidade'> = {
  id: 'm',
  escopo: { tipo: 'propriedade', id: 'x' },
  tipo: 'drone',
  uri: 'u',
  capturadaEm: '2026-11-03',
  autor: 'a',
  local: 'l',
  processamento: 'aguardando',
};

describe('quem vê a mídia', () => {
  it('o comprador aprovado vê a mídia ainda não validada (com a etiqueta "Não verificado")', () => {
    assert.equal(podeVerMidia({ ...base, status: 'pendente', visibilidade: 'aprovados' }, 'cliente', { compradorAprovado: true }), true);
  });
  it('comprador não aprovado não vê a de visibilidade "aprovados"', () => {
    assert.equal(podeVerMidia({ ...base, status: 'verificada', visibilidade: 'aprovados' }, 'cliente', { compradorAprovado: false }), false);
  });
  it('ninguém de fora vê a privada e o comprador nunca vê a rejeitada', () => {
    assert.equal(podeVerMidia({ ...base, status: 'verificada', visibilidade: 'privado' }, 'cliente', { compradorAprovado: true }), false);
    assert.equal(podeVerMidia({ ...base, status: 'rejeitada', visibilidade: 'publico' }, 'cliente'), false);
  });
  it('logística nunca vê; administrador sempre vê e é o único que valida', () => {
    assert.equal(podeVerMidia({ ...base, status: 'verificada', visibilidade: 'publico' }, 'logistica'), false);
    assert.equal(podeVerMidia({ ...base, status: 'rejeitada', visibilidade: 'privado' }, 'administrador'), true);
    assert.equal(podeValidarMidia('administrador'), true);
    assert.equal(podeValidarMidia('cliente'), false);
    assert.equal(podeValidarMidia('agricultor'), false);
  });
});
