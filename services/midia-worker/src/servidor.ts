import { timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage } from 'node:http';
import { config } from './config.ts';
import { criarFila } from './fila.ts';
import { processarMidiaDoStorage, type TrabalhoMidia } from './supabase.ts';

const porta = Number(process.env.PORT ?? 8080);
const fila = criarFila(config.concorrencia);

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

function comoTrabalho(corpo: unknown): TrabalhoMidia | null {
  if (typeof corpo !== 'object' || corpo === null) return null;
  const c = corpo as Record<string, unknown>;
  const { midiaId, bucket, caminho, nomeOriginal } = c;
  if (typeof midiaId === 'string' && typeof bucket === 'string' && typeof caminho === 'string' && typeof nomeOriginal === 'string') {
    return { midiaId, bucket, caminho, nomeOriginal };
  }
  return null;
}

/**
 * Servidor do worker.
 *  GET  /saude    — verificação de saúde
 *  POST /webhook  — aviso de que há mídia nova no Storage: { midiaId, bucket, caminho, nomeOriginal }
 *                   (Authorization: Bearer WORKER_TOKEN). Responde 202 e processa em segundo plano.
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
      const trabalho = comoTrabalho(await lerJson(req));
      if (!trabalho) return responder(400, { erro: 'Corpo inválido: esperado midiaId, bucket, caminho e nomeOriginal.' });

      void fila(() => processarMidiaDoStorage(trabalho)).then(
        (r) => console.log(JSON.stringify({ midiaId: trabalho.midiaId, status: r.status, motivo: r.motivo })),
        (e: unknown) => console.error('Falha ao processar', trabalho.midiaId, e),
      );
      return responder(202, { aceito: true });
    }

    return responder(404, { erro: 'Rota não encontrada.' });
  } catch {
    return responder(400, { erro: 'Requisição inválida.' });
  }
});

servidor.listen(porta, () => console.log(`midia-worker ouvindo na porta ${porta} (codec de vídeo: ${config.codecVideo})`));
