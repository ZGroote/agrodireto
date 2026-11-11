import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Executor } from '../src/video.ts';
import { iniciarSupabaseSimulado, type Falhas } from './supabaseSimulado.ts';

process.env.APAGAR_ORIGINAL_APOS_OTIMIZAR = 'true';
// Prazo curto (3 s) para o teste de trabalho travado.
process.env.PRAZO_TRABALHO_MIN = '0.05';
const { assumirProximaMidia, processarMidiaDoStorage } = await import('../src/supabase.ts');

const ORIGINAL = 'propriedade/lote/foto.png';

async function comSupabase(falhas: Falhas, verificar: (simulado: Awaited<ReturnType<typeof iniciarSupabaseSimulado>>) => Promise<void>, caminho = ORIGINAL) {
  const simulado = await iniciarSupabaseSimulado(caminho, falhas);
  process.env.SUPABASE_URL = simulado.url;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-de-teste';
  try {
    await verificar(simulado);
  } finally {
    await simulado.fechar();
  }
}

async function assumir() {
  const trabalho = await assumirProximaMidia();
  assert.ok(trabalho, 'a fila devia entregar a mídia');
  return trabalho;
}

const enviados = (eventos: string[]) => eventos.filter((e) => e.startsWith('upload:')).map((e) => e.split('/midias/')[1]);

test('confirma a referência antes da remoção e a fila não entrega a mesma mídia de novo', async () => {
  await comSupabase({}, async ({ eventos, linha }) => {
    const trabalho = await assumir();
    assert.deepEqual(trabalho, { midiaId: 'midia-teste', caminho: ORIGINAL, tentativa: 1 });
    assert.equal((await processarMidiaDoStorage(trabalho)).status, 'pronta');
    assert.deepEqual(eventos.map((evento) => evento.split(':')[0]), ['assumida', 'download', 'upload', 'pronta', 'remove']);
    assert.match(eventos[2] ?? '', /^upload:false:\/storage\/v1\/object\/midias\/propriedade\/lote\/otimizado-[\da-f-]+\.webp$/);
    assert.equal(linha.publicado, enviados(eventos)[0]);
    assert.equal(await assumirProximaMidia(), null);
  });
});

test('preserva o original se a atualização falhar ou se nenhuma linha for confirmada', async () => {
  for (const falhas of [{ falharUpdate: true }, { perderReferencia: true }]) {
    await comSupabase(falhas, async ({ eventos }) => {
      assert.equal((await processarMidiaDoStorage(await assumir())).status, 'falhou');
      assert.ok(eventos.includes('falhou'));
      // O original nunca é removido; o otimizado só sai quando nenhuma linha foi confirmada (sem ambiguidade).
      assert.ok(!eventos.includes(`remove:${ORIGINAL}`));
      assert.equal(eventos.includes(`remove:${enviados(eventos)[0]}`), !!falhas.perderReferencia);
    });
  }
});

test('falha no download ou no envio registra a falha sem tocar no original', async () => {
  for (const falhas of [{ falharDownload: true }, { falharUpload: true }]) {
    await comSupabase(falhas, async ({ eventos, linha }) => {
      const r = await processarMidiaDoStorage(await assumir());
      assert.equal(r.status, 'falhou');
      assert.ok(r.motivo);
      assert.equal(eventos.at(-1), 'falhou');
      assert.equal(linha.processamento, 'falhou');
      assert.ok(!eventos.some((e) => e.startsWith('remove') || e === 'pronta'));
    });
  }
});

test('arquivos com o mesmo nome e extensões diferentes não colidem', async () => {
  const destinos: string[] = [];
  for (const caminho of ['propriedade/lote/foto.png', 'propriedade/lote/foto.jpg']) {
    await comSupabase({}, async ({ eventos }) => {
      assert.equal((await processarMidiaDoStorage(await assumir())).status, 'pronta');
      destinos.push(...enviados(eventos));
      assert.ok(eventos.includes(`remove:${caminho}`));
    }, caminho);
  }
  assert.equal(new Set(destinos).size, 2);
  for (const destino of destinos) assert.doesNotMatch(destino, /\/foto\.(png|jpg|webp)$/);
});

test('falha na limpeza não desfaz o resultado gravado', async () => {
  await comSupabase({ falharRemove: true }, async ({ eventos, linha }) => {
    assert.equal((await processarMidiaDoStorage(await assumir())).status, 'pronta');
    assert.deepEqual(eventos.slice(-2), ['pronta', `remove:${ORIGINAL}`]);
    assert.equal(linha.processamento, 'pronta');
  });
});

test('job repetido: a execução antiga não grava por cima da nova e não deixa arquivo', async () => {
  await comSupabase({}, async ({ eventos, linha }) => {
    const antiga = await assumir();
    linha.prazoVencido = true; // o worker antigo parou de responder e o prazo venceu
    const nova = await assumir();
    assert.equal(nova.tentativa, 2);

    const rAntiga = await processarMidiaDoStorage(antiga);
    assert.equal(rAntiga.status, 'falhou');
    assert.equal(linha.processamento, 'otimizando');
    assert.equal((await processarMidiaDoStorage(nova)).status, 'pronta');

    const [daAntiga, daNova] = enviados(eventos);
    assert.ok(eventos.includes(`remove:${daAntiga}`), 'o envio da execução antiga é removido');
    assert.equal(linha.publicado, daNova);
    assert.equal(eventos.filter((e) => e === 'pronta').length, 1);
  });
});

test('trabalho travado: o prazo encerra o processo e registra a falha', async () => {
  await comSupabase({}, async ({ eventos, linha }) => {
    let encerrado = false;
    // FFmpeg que nunca termina: só para quando o sinal do prazo chega.
    const travado: Executor = (_programa, _argumentos, sinal) => new Promise((_resolve, reject) => {
      sinal?.addEventListener('abort', () => {
        encerrado = true;
        reject(new Error('encerrado'));
      });
    });
    const inicio = Date.now();
    const r = await processarMidiaDoStorage(await assumir(), travado);
    assert.ok(encerrado);
    assert.ok(Date.now() - inicio < 10_000);
    assert.equal(r.status, 'falhou');
    assert.match(r.motivo ?? '', /Tempo limite/);
    assert.equal(linha.processamento, 'falhou');
    assert.ok(!eventos.some((e) => e.startsWith('upload')));
  }, 'propriedade/lote/drone.mp4');
});
