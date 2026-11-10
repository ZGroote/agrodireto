import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import sharp from 'sharp';

process.env.APAGAR_ORIGINAL_APOS_OTIMIZAR = 'true';
const { processarMidiaDoStorage } = await import('../src/supabase.ts');

const trabalho = {
  midiaId: 'midia-teste',
  bucket: 'midias',
  caminho: 'propriedade/lote/foto.png',
  nomeOriginal: 'foto.png',
};

async function comStorage(opcoes: { falharUpdate?: boolean; falharRemove?: boolean; perderReferencia?: boolean }, verificar: (
  eventos: string[], executar: () => ReturnType<typeof processarMidiaDoStorage>,
) => Promise<void>) {
  const imagem = await sharp({
    create: { width: 256, height: 256, channels: 3, background: '#56a52a' },
  }).png({ compressionLevel: 0 }).toBuffer();
  const eventos: string[] = [];
  let processamento = 'aguardando';
  let arquivo = trabalho.caminho;

  const servidor = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    function json(status: number, dados: unknown) {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(dados));
    }

    if (req.method === 'PATCH' && url.pathname === '/rest/v1/midias') {
      const partes: Uint8Array[] = [];
      for await (const parte of req) partes.push(parte);
      const dados = JSON.parse(Buffer.concat(partes).toString('utf8')) as { processamento: string; arquivo?: string };
      const esperado = url.searchParams.get('processamento');
      const corresponde = url.searchParams.get('id') === 'eq.midia-teste'
        && url.searchParams.get('arquivo') === `eq.${arquivo}`
        && (esperado === `eq.${processamento}`
          || (esperado === 'in.(aguardando,falhou)' && ['aguardando', 'falhou'].includes(processamento)));
      if (!corresponde) return json(200, []);
      eventos.push(dados.processamento);
      if (dados.processamento === 'pronta' && opcoes.falharUpdate) return json(500, { message: 'falha na gravação' });
      if (dados.processamento === 'pronta' && opcoes.perderReferencia) return json(200, []);
      processamento = dados.processamento;
      arquivo = dados.arquivo ?? arquivo;
      return json(200, [{ id: trabalho.midiaId }]);
    }

    if (req.method === 'GET' && url.pathname.startsWith('/storage/v1/object/')) {
      eventos.push('download');
      res.writeHead(200, { 'content-type': 'image/png' });
      return res.end(imagem);
    }

    if (req.method === 'POST' && url.pathname.startsWith('/storage/v1/object/')) {
      eventos.push(`upload:${req.headers['x-upsert']}:${url.pathname}`);
      for await (const parte of req) { void parte; }
      return json(200, { Key: url.pathname });
    }

    if (req.method === 'DELETE' && url.pathname === '/storage/v1/object/midias') {
      eventos.push('remove');
      if (opcoes.falharRemove) return json(500, { message: 'falha ao remover' });
      return json(200, [{ name: trabalho.caminho }]);
    }

    json(404, { message: 'rota inesperada' });
  });
  servidor.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  const endereco = servidor.address();
  assert.ok(endereco && typeof endereco !== 'string');
  process.env.SUPABASE_URL = `http://127.0.0.1:${endereco.port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-de-teste';

  try {
    await verificar(eventos, () => processarMidiaDoStorage(trabalho));
  } finally {
    await new Promise<void>((resolve, reject) => {
      servidor.close((erro) => erro ? reject(erro) : resolve());
    });
  }
}

test('confirma a referência antes da remoção e ignora reentrega do mesmo trabalho', async () => {
  await comStorage({}, async (eventos, executar) => {
    assert.equal((await executar()).status, 'pronta');
    assert.deepEqual(eventos.map((evento) => evento.split(':')[0]), ['otimizando', 'download', 'upload', 'pronta', 'remove']);
    assert.match(eventos[2], /^upload:false:\/storage\/v1\/object\/midias\/propriedade\/lote\/otimizado-[\da-f-]+\.webp$/);
    assert.equal((await executar()).status, 'mantida');
    assert.equal(eventos.length, 5);
  });
});

test('preserva o original se a atualização falhar ou se nenhuma linha for confirmada', async () => {
  for (const opcoes of [{ falharUpdate: true }, { perderReferencia: true }]) {
    await comStorage(opcoes, async (eventos, executar) => {
      assert.equal((await executar()).status, 'falhou');
      assert.ok(eventos.includes('falhou'));
      assert.ok(!eventos.includes('remove'));
    });
  }
});

test('falha na limpeza não desfaz o resultado gravado', async () => {
  await comStorage({ falharRemove: true }, async (eventos, executar) => {
    assert.equal((await executar()).status, 'pronta');
    assert.deepEqual(eventos.slice(-2), ['pronta', 'remove']);
  });
});
