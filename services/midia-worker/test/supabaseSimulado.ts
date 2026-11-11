import { once } from 'node:events';
import { createServer } from 'node:http';
import sharp from 'sharp';

/** Falhas que o Supabase simulado pode injetar. */
export type Falhas = {
  falharUpdate?: boolean; falharRemove?: boolean; perderReferencia?: boolean;
  falharUpload?: boolean; falharDownload?: boolean;
  /** O download nunca responde (simula o worker parado no meio do trabalho) */
  segurarDownload?: boolean;
};

/**
 * Supabase simulado com uma linha em `midias`, a fila `assumir_proxima_midia` e o Storage.
 * A regra da fila espelha a migration de forma mínima: entrega "aguardando", ou "otimizando" com o prazo vencido.
 */
export async function iniciarSupabaseSimulado(caminho: string, falhas: Falhas = {}) {
  const imagem = await sharp({ create: { width: 256, height: 256, channels: 3, background: '#56a52a' } })
    .png({ compressionLevel: 0 }).toBuffer();
  const eventos: string[] = [];
  const linha = { id: 'midia-teste', arquivo: caminho, processamento: 'aguardando', tentativa: 0, prazoVencido: false, publicado: null as string | null };

  const ler = async (req: AsyncIterable<Uint8Array>) => {
    const partes: Uint8Array[] = [];
    for await (const parte of req) partes.push(parte);
    return Buffer.concat(partes).toString('utf8');
  };

  const servidor = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const json = (status: number, dados: unknown) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(dados));
    };

    if (req.method === 'POST' && url.pathname === '/rest/v1/rpc/assumir_proxima_midia') {
      await ler(req);
      if (linha.processamento !== 'aguardando' && !(linha.processamento === 'otimizando' && linha.prazoVencido)) return json(200, []);
      linha.processamento = 'otimizando';
      linha.tentativa += 1;
      linha.prazoVencido = false;
      eventos.push(`assumida:${linha.tentativa}`);
      return json(200, [{ midia_id: linha.id, caminho: linha.arquivo, tentativa: linha.tentativa }]);
    }

    if (req.method === 'PATCH' && url.pathname === '/rest/v1/midias') {
      const dados = JSON.parse(await ler(req)) as { processamento: string; arquivo_publicado?: string | null };
      const corresponde = url.searchParams.get('id') === `eq.${linha.id}`
        && url.searchParams.get('processamento') === `eq.${linha.processamento}`
        && url.searchParams.get('tentativas_processamento') === `eq.${linha.tentativa}`;
      if (!corresponde) return json(200, []);
      eventos.push(dados.processamento);
      if (dados.processamento === 'pronta' && falhas.falharUpdate) return json(500, { message: 'falha na gravação' });
      if (dados.processamento === 'pronta' && falhas.perderReferencia) return json(200, []);
      linha.processamento = dados.processamento;
      if (dados.arquivo_publicado !== undefined) linha.publicado = dados.arquivo_publicado;
      return json(200, [{ id: linha.id }]);
    }

    if (req.method === 'GET' && url.pathname.startsWith('/storage/v1/object/')) {
      eventos.push('download');
      if (falhas.segurarDownload) return;
      if (falhas.falharDownload) return json(404, { message: 'objeto ausente' });
      res.writeHead(200, { 'content-type': 'image/png' });
      return res.end(imagem);
    }

    if (req.method === 'POST' && url.pathname.startsWith('/storage/v1/object/')) {
      await ler(req);
      eventos.push(`upload:${req.headers['x-upsert']}:${url.pathname}`);
      if (falhas.falharUpload) return json(500, { message: 'falha no envio' });
      return json(200, { Key: url.pathname });
    }

    if (req.method === 'DELETE' && url.pathname === '/storage/v1/object/midias') {
      const { prefixes } = JSON.parse(await ler(req)) as { prefixes: string[] };
      eventos.push(`remove:${prefixes.join(',')}`);
      if (falhas.falharRemove) return json(500, { message: 'falha ao remover' });
      return json(200, prefixes.map((name) => ({ name })));
    }

    json(404, { message: 'rota inesperada' });
  });
  servidor.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  const endereco = servidor.address();
  if (!endereco || typeof endereco === 'string') throw new Error('Sem endereço.');

  return {
    url: `http://127.0.0.1:${endereco.port}`,
    eventos,
    linha,
    falhas,
    fechar: () => new Promise<void>((resolve, reject) => {
      servidor.closeAllConnections();
      servidor.close((erro) => (erro ? reject(erro) : resolve()));
    }),
  };
}
