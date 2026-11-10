import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { after, before, describe, it } from 'node:test';

const PORTA = 18_080;
const base = `http://127.0.0.1:${PORTA}`;
let filho: ChildProcess;

before(async () => {
  filho = spawn(process.execPath, ['src/servidor.ts'], { env: { ...process.env, PORT: String(PORTA), WORKER_TOKEN: 'segredo-de-teste' }, stdio: 'ignore' });
  // Espera o servidor subir.
  for (let i = 0; i < 50; i += 1) {
    try {
      if ((await fetch(`${base}/saude`)).ok) return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error('O servidor não subiu a tempo.');
});

after(() => {
  filho.kill();
});

const post = (corpo: unknown, token?: string) =>
  fetch(`${base}/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(corpo),
  });

describe('servidor do worker', () => {
  it('GET /saude responde ok e informa o codec de vídeo', async () => {
    const r = await fetch(`${base}/saude`);
    assert.equal(r.status, 200);
    const j = (await r.json()) as { ok: boolean; codecVideo: string };
    assert.equal(j.ok, true);
    assert.ok(['hevc', 'av1'].includes(j.codecVideo));
  });

  it('o webhook recusa chamada sem token ou com token errado (401)', async () => {
    const corpo = { midiaId: 'x', bucket: 'midias', caminho: 'a/b.jpg', nomeOriginal: 'b.jpg' };
    assert.equal((await post(corpo)).status, 401);
    assert.equal((await post(corpo, 'errado')).status, 401);
  });

  it('o webhook recusa corpo inválido (400)', async () => {
    assert.equal((await post({ midiaId: 'x' }, 'segredo-de-teste')).status, 400);
    assert.equal((await post('texto', 'segredo-de-teste')).status, 400);
  });

  it('o webhook aceita um pedido válido e responde 202 sem esperar o processamento', async () => {
    const r = await post({ midiaId: 'x', bucket: 'midias', caminho: 'a/b.jpg', nomeOriginal: 'b.jpg' }, 'segredo-de-teste');
    assert.equal(r.status, 202);
  });

  it('rota inexistente devolve 404', async () => {
    assert.equal((await fetch(`${base}/nada`)).status, 404);
  });
});
