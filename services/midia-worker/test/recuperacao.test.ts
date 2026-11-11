import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';
import { iniciarSupabaseSimulado } from './supabaseSimulado.ts';

const PORTA = 18_081;

function subirWorker(url: string): ChildProcess {
  return spawn(process.execPath, ['src/servidor.ts'], {
    env: {
      ...process.env, PORT: String(PORTA), WORKER_TOKEN: 'segredo-de-teste',
      SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: 'chave-de-teste', INTERVALO_FILA_SEG: '0.2',
    },
    stdio: 'ignore',
  });
}

async function esperar(condicao: () => boolean, descricao: string) {
  for (let i = 0; i < 300; i += 1) {
    if (condicao()) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`Tempo esgotado esperando: ${descricao}`);
}

test('reinício: a mídia aceita continua na fila e é retomada pelo novo processo, uma vez só', async () => {
  const simulado = await iniciarSupabaseSimulado('propriedade/lote/foto.png', { segurarDownload: true });
  const { eventos, linha, falhas } = simulado;
  let worker: ChildProcess | undefined;
  try {
    // O primeiro worker assume a mídia sozinho (sem aviso) e cai no meio do download.
    worker = subirWorker(simulado.url);
    await esperar(() => eventos.includes('download'), 'primeiro download');
    worker.kill('SIGKILL');
    await once(worker, 'exit');
    assert.equal(linha.processamento, 'otimizando');

    // O prazo vence no banco e um novo processo sobe.
    falhas.segurarDownload = false;
    linha.prazoVencido = true;
    worker = subirWorker(simulado.url);
    await esperar(() => linha.processamento === 'pronta', 'mídia pronta');

    assert.equal(linha.tentativa, 2);
    assert.deepEqual(eventos.filter((e) => e.startsWith('assumida')), ['assumida:1', 'assumida:2']);
    assert.equal(eventos.filter((e) => e === 'pronta').length, 1);
    assert.equal(eventos.filter((e) => e.startsWith('upload')).length, 1);
  } finally {
    worker?.kill('SIGKILL');
    await simulado.fechar();
  }
});
