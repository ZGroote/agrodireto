import { timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage } from 'node:http';
import { config } from './config.ts';
import { criarFila } from './fila.ts';
import { assumirProximaMidia, processarMidiaDoStorage } from './supabase.ts';

const porta = Number(process.env.PORT ?? 8080);
const acordar = criarFila(config.concorrencia, assumirProximaMidia, async (trabalho) => {
  const r = await processarMidiaDoStorage(trabalho);
  console.log(JSON.stringify({ midiaId: trabalho.midiaId, tentativa: trabalho.tentativa, status: r.status, motivo: r.motivo }));
});

function tokenValido(recebido: string | undefined): boolean {
  const esperado = process.env.WORKER_TOKEN;
  if (!esperado || !recebido) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(`Bearer ${esperado}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function lerJson(req: IncomingMessage, limiteBytes = 10_000): Promise<unknown> {
  const partes: Buffer[] = [];
  let total = 0;
  for await (const parte of req) {
    total += (parte as Buffer).length;
    if (total > limiteBytes) throw new Error('Corpo grande demais.');
    partes.push(parte as Buffer);
  }
  return JSON.parse(Buffer.concat(partes).toString('utf8'));
}

/**
 * Servidor do worker.
 *  GET  /saude    — verificação de saúde
 *  POST /webhook  — aviso de que há mídia nova (Authorization: Bearer WORKER_TOKEN), corpo JSON qualquer.
 *                   O trabalho já está registrado na tabela `midias`; o aviso só faz o worker conferir a fila agora.
 *                   Responde 202 e processa em segundo plano.
 */
const servidor = createServer(async (req, res) => {
  const responder = (status: number, corpo: unknown) => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(corpo));
  };

  try {
    if (req.method === 'GET' && req.url === '/saude') {
      return responder(200, { ok: true, codecVideo: config.codecVideo, concorrencia: config.concorrencia });
    }

    if (req.method === 'POST' && req.url === '/webhook') {
      if (!tokenValido(req.headers.authorization)) return responder(401, { erro: 'Não autorizado.' });
      const corpo = await lerJson(req);
      if (typeof corpo !== 'object' || corpo === null) return responder(400, { erro: 'Corpo inválido: esperado um objeto JSON.' });
      void acordar();
      return responder(202, { aceito: true });
    }

    return responder(404, { erro: 'Rota não encontrada.' });
  } catch {
    return responder(400, { erro: 'Requisição inválida.' });
  }
});

servidor.listen(porta, () => {
  console.log(`midia-worker ouvindo na porta ${porta} (codec de vídeo: ${config.codecVideo})`);
  // Retoma o que ficou na fila (inclusive de antes de um reinício) e confere de tempos em tempos.
  void acordar();
  setInterval(() => void acordar(), config.intervaloFilaSeg * 1000).unref();
});
