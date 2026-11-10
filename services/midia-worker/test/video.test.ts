import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { config } from '../src/config.ts';
import { processarArquivo } from '../src/processar.ts';
import { argsCodificacao, lerVmaf, otimizarVideo, type Executor, type Sonda } from '../src/video.ts';

let pasta = '';
before(async () => {
  pasta = await mkdtemp(join(tmpdir(), 'midia-worker-video-'));
});
after(async () => {
  await rm(pasta, { recursive: true, force: true });
});

const SONDA: Sonda = { temVideo: true, largura: 1920, altura: 1080, dezBits: false, duracaoSeg: 28 };

const JSON_FFPROBE = JSON.stringify({
  streams: [{ codec_type: 'video', width: 1920, height: 1080, pix_fmt: 'yuv420p', codec_name: 'h264' }],
  format: { duration: '28.0' },
});

/**
 * FFmpeg simulado: o ffprobe devolve um JSON; a codificação grava um arquivo cujo tamanho depende do CRF;
 * a medição do VMAF devolve, em ordem, as notas da lista.
 */
function ffmpegSimulado(opcoes: { notas: (number | undefined)[]; tamanhoPorCrf?: (crf: number) => number; semVideo?: boolean; ffprobeFalha?: boolean }) {
  const chamadas: { tipo: 'sonda' | 'codificar' | 'vmaf'; crf?: number }[] = [];
  const notas = [...opcoes.notas];
  const executar: Executor = async (programa, args) => {
    if (programa === config.ffprobe) {
      chamadas.push({ tipo: 'sonda' });
      if (opcoes.ffprobeFalha) throw new Error('Invalid data found when processing input');
      return { stdout: opcoes.semVideo ? JSON.stringify({ streams: [{ codec_type: 'audio' }] }) : JSON_FFPROBE, stderr: '' };
    }
    if (args.some((a) => a.includes('libvmaf'))) {
      chamadas.push({ tipo: 'vmaf' });
      const nota = notas.shift();
      return { stdout: '', stderr: nota === undefined ? 'sem nota' : `[Parsed_libvmaf_2] VMAF score: ${nota.toFixed(6)}` };
    }
    const crf = Number(args[args.indexOf('-crf') + 1]);
    chamadas.push({ tipo: 'codificar', crf });
    const saida = args[args.length - 1] as string;
    await writeFile(saida, Buffer.alloc((opcoes.tamanhoPorCrf ?? ((c) => 4000 - c * 20))(crf)));
    return { stdout: '', stderr: '' };
  };
  return { executar, chamadas };
}

async function criarOriginal(nome: string, bytes = 10_000): Promise<string> {
  const caminho = join(pasta, nome);
  await writeFile(caminho, Buffer.alloc(bytes));
  return caminho;
}

describe('otimização de vídeo (lógica, com FFmpeg simulado)', () => {
  it('atinge o VMAF na primeira tentativa: usa o CRF padrão do codec', async () => {
    const entrada = await criarOriginal('a.mp4');
    const { executar, chamadas } = ffmpegSimulado({ notas: [96.5] });

    const r = await otimizarVideo(entrada, join(pasta, 'a.otimizado.mp4'), executar);

    assert.equal(r.status, 'pronta', r.motivo ?? 'sem motivo');
    assert.equal(r.qualidade?.crf, config.crfInicial[config.codecVideo]);
    assert.equal(r.qualidade?.vmaf, 96.5);
    assert.ok((r.bytesSaida ?? Infinity) < r.bytesEntrada);
    assert.equal(r.largura, 1920);
    assert.equal(r.altura, 1080);
    assert.equal(chamadas.filter((c) => c.tipo === 'codificar').length, 1);
  });

  it('nota abaixo do mínimo: baixa o CRF e tenta de novo até passar', async () => {
    const entrada = await criarOriginal('b.mp4');
    const { executar, chamadas } = ffmpegSimulado({ notas: [93.1, 96.4] });

    const r = await otimizarVideo(entrada, join(pasta, 'b.otimizado.mp4'), executar);

    assert.equal(r.status, 'pronta', r.motivo ?? 'sem motivo');
    const crfs = chamadas.filter((c) => c.tipo === 'codificar').map((c) => c.crf);
    assert.deepEqual(crfs, [config.crfInicial[config.codecVideo], config.crfInicial[config.codecVideo] - config.passoCrf]);
    assert.equal(r.qualidade?.crf, config.crfInicial[config.codecVideo] - config.passoCrf);
  });

  it('nenhuma tentativa atinge o VMAF: mantém o original e não deixa lixo no disco', async () => {
    const entrada = await criarOriginal('c.mp4');
    const saida = join(pasta, 'c.otimizado.mp4');
    const { executar } = ffmpegSimulado({ notas: [90, 91, 92] });

    const r = await otimizarVideo(entrada, saida, executar);

    assert.equal(r.status, 'mantida');
    assert.match(r.motivo ?? '', /VMAF/);
    await assert.rejects(access(saida));
    assert.deepEqual((await readdir(pasta)).filter((n) => n.startsWith('c.otimizado')), []);
  });

  it('o resultado não pode ficar maior que o original', async () => {
    const entrada = await criarOriginal('d.mp4', 3000);
    const { executar } = ffmpegSimulado({ notas: [97], tamanhoPorCrf: () => 9000 });
    const r = await otimizarVideo(entrada, join(pasta, 'd.otimizado.mp4'), executar);
    assert.equal(r.status, 'mantida');
    assert.match(r.motivo ?? '', /menor/);
  });

  it('formato sem decodificador (R3D, BRAW, ARI, CRM): mantém o original', async () => {
    const entrada = await criarOriginal('e.r3d');
    const { executar } = ffmpegSimulado({ notas: [], ffprobeFalha: true });
    const r = await otimizarVideo(entrada, join(pasta, 'e.otimizado.mp4'), executar);
    assert.equal(r.status, 'mantida');
    assert.match(r.motivo ?? '', /decodificador/);
  });

  it('arquivo sem faixa de vídeo falha com motivo', async () => {
    const entrada = await criarOriginal('f.mp4');
    const { executar } = ffmpegSimulado({ notas: [], semVideo: true });
    const r = await otimizarVideo(entrada, join(pasta, 'f.otimizado.mp4'), executar);
    assert.equal(r.status, 'falhou');
  });

  it('o despachante manda a extensão da lista de vídeos para o otimizador de vídeo', async () => {
    const entrada = await criarOriginal('drone.mov');
    const { executar } = ffmpegSimulado({ notas: [96] });
    const r = await processarArquivo(entrada, 'drone.mov', pasta, executar);
    assert.equal(r.tipo, 'video');
    assert.equal(r.status, 'pronta', r.motivo ?? 'sem motivo');
  });
});

describe('argumentos do FFmpeg', () => {
  it('H.265: libx265, tag hvc1, sem alterar resolução nem taxa de quadros, sem metadados', () => {
    const a = argsCodificacao('in.mov', 'out.mp4', SONDA, 24, 'hevc');
    assert.ok(a.includes('libx265'));
    assert.deepEqual(a.slice(a.indexOf('-tag:v'), a.indexOf('-tag:v') + 2), ['-tag:v', 'hvc1']);
    assert.ok(!a.includes('-vf') && !a.includes('scale'), 'não muda a resolução');
    assert.deepEqual(a.slice(a.indexOf('-fps_mode'), a.indexOf('-fps_mode') + 2), ['-fps_mode', 'passthrough']);
    assert.deepEqual(a.slice(a.indexOf('-map_metadata'), a.indexOf('-map_metadata') + 2), ['-map_metadata', '-1']);
    assert.ok(a.includes('+faststart'));
    assert.equal(a[a.length - 1], 'out.mp4');
  });

  it('AV1: usa o SVT-AV1', () => {
    const a = argsCodificacao('in.mp4', 'out.mp4', SONDA, 32, 'av1');
    assert.ok(a.includes('libsvtav1'));
    assert.ok(!a.includes('libx265'));
  });

  it('origem de 10 bits (HDR, ProRes) continua em 10 bits', () => {
    const a = argsCodificacao('in.mov', 'out.mp4', { ...SONDA, dezBits: true }, 24, 'hevc');
    assert.equal(a[a.indexOf('-pix_fmt') + 1], 'yuv420p10le');
    assert.equal(argsCodificacao('in.mp4', 'out.mp4', SONDA, 24, 'hevc')[argsCodificacao('in.mp4', 'out.mp4', SONDA, 24, 'hevc').indexOf('-pix_fmt') + 1], 'yuv420p');
  });
});

describe('leitura da nota VMAF', () => {
  it('extrai a nota do texto do libvmaf', () => {
    assert.equal(lerVmaf('[Parsed_libvmaf_2 @ 0x55] VMAF score: 96.214500'), 96.2145);
    assert.equal(lerVmaf('VMAF score: 100'), 100);
    assert.equal(lerVmaf('nada aqui'), undefined);
  });
});

/** Teste com o FFmpeg de verdade. Só roda se o ffmpeg (com libx265 e libvmaf) estiver instalado. */
function ffmpegCompleto(): boolean {
  try {
    const encoders = execFileSync(config.ffmpeg, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    const filtros = execFileSync(config.ffmpeg, ['-hide_banner', '-filters'], { encoding: 'utf8' });
    return encoders.includes('libx265') && filtros.includes('libvmaf');
  } catch {
    return false;
  }
}

describe('FFmpeg de verdade', { skip: ffmpegCompleto() ? false : 'ffmpeg com libx265 e libvmaf não encontrado' }, () => {
  it('recodifica um vídeo real mantendo a resolução e a qualidade', async () => {
    const entrada = join(pasta, 'real.mp4');
    execFileSync(config.ffmpeg, ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=24:duration=3', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', entrada]);
    const r = await processarArquivo(entrada, 'real.mp4', pasta);
    assert.ok(r.status === 'pronta' || r.status === 'mantida', r.motivo ?? 'sem motivo');
    if (r.status === 'pronta') {
      assert.ok((r.qualidade?.vmaf ?? 0) >= config.vmafMinimo);
      assert.equal(r.largura, 640);
      assert.ok((await stat(r.arquivoSaida as string)).size < r.bytesEntrada);
    }
  });
});
