import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { prepararFotoCatalogo, prepararFotosPendentes } from '../src/fotoCatalogo.ts';

test('gera WebP sem EXIF e só registra a cópia depois do upload privado', async () => {
  const lote = '51000000-0000-0000-0000-000000000010';
  const arquivo = '51000000-0000-0000-0000-000000000001/' + lote + '/foto-a.jpg';
  const copia = lote + '/foto-a.webp';
  const original = await sharp({ create: { width: 24, height: 16, channels: 3, background: 'green' } })
    .withExif({ IFD0: { Artist: 'Produtor teste' } }).jpeg().toBuffer();
  assert.ok((await sharp(original).metadata()).exif);

  const etapas: string[] = [];
  let falharEnvio = true;
  let registrada: string | null = null;
  const cliente = createClient('http://127.0.0.1:54321', 'chave-de-teste', {
    auth: { persistSession: false },
    global: {
      fetch: async (input, options) => {
        const req = new Request(input, options);
        const url = new URL(req.url);
        etapas.push(req.method);
        if (url.pathname === '/rest/v1/evidencias_lote') {
          assert.equal(url.searchParams.get('autorizada_catalogo'), 'eq.true');
          assert.equal(url.searchParams.get('revisao'), 'eq.aprovada');
          if (req.method === 'GET') return Response.json([{ arquivo, tipo: 'foto', copia_catalogo: registrada }]);
          assert.equal(req.method, 'PATCH');
          assert.equal(url.searchParams.get('arquivo'), 'eq.' + arquivo);
          assert.deepEqual(await req.json(), { copia_catalogo: copia });
          registrada = copia;
          return Response.json([{ copia_catalogo: copia }]);
        }
        if (req.method === 'GET') {
          assert.ok(url.pathname.endsWith('/evidencias-lote/' + arquivo));
          return new Response(new Uint8Array(original), { headers: { 'content-type': 'image/jpeg' } });
        }
        assert.equal(req.method, 'POST');
        assert.equal(url.pathname, '/storage/v1/object/fotos-catalogo/' + copia);
        assert.equal(req.headers.get('content-type'), 'image/webp');
        const dados = Buffer.from(await req.arrayBuffer());
        const meta = await sharp(dados).metadata();
        assert.equal(meta.format, 'webp');
        assert.equal(meta.exif, undefined);
        assert.deepEqual(await sharp(dados).raw().toBuffer(), await sharp(original).raw().toBuffer());
        return falharEnvio
          ? Response.json({ message: 'Falha de teste' }, { status: 500 })
          : Response.json({ Key: copia });
      },
    },
  });

  await assert.rejects(prepararFotoCatalogo(cliente, lote, 'foto-a'), /gravar a cópia privada/);
  assert.deepEqual(etapas.splice(0), ['GET', 'GET', 'POST']);
  assert.equal(registrada, null);
  falharEnvio = false;
  assert.equal(await prepararFotoCatalogo(cliente, lote, 'foto-a'), copia);
  assert.deepEqual(etapas.splice(0), ['GET', 'GET', 'POST', 'PATCH']);
  assert.equal(await prepararFotoCatalogo(cliente, lote, 'foto-a'), copia);
  assert.deepEqual(etapas, ['GET']);
});

test('avança para a próxima página mesmo quando fotos perdem a autorização', async () => {
  const lote = '51000000-0000-0000-0000-000000000010';
  const primeiraPagina = Array.from({ length: 25 }, (_, n) => ({
    lote_id: lote,
    chave: 'foto-' + String(n).padStart(2, '0'),
  }));
  const proxima = { lote_id: lote, chave: 'foto-25' };
  const copia = lote + '/foto-25.webp';
  const cursores: (string | null)[] = [];
  const cliente = createClient('http://127.0.0.1:54321', 'chave-de-teste', {
    auth: { persistSession: false },
    global: {
      fetch: async (input) => {
        const consulta = new URL(String(input)).searchParams;
        assert.equal(consulta.get('autorizada_catalogo'), 'eq.true');
        if (consulta.get('select') === 'lote_id,chave') {
          const cursor = consulta.get('or');
          cursores.push(cursor);
          assert.equal(consulta.get('copia_catalogo'), 'is.null');
          assert.equal(consulta.get('order'), 'lote_id.asc,chave.asc');
          return Response.json(cursor ? [proxima] : primeiraPagina);
        }
        return Response.json(consulta.get('chave') === 'eq.foto-25' ? [{ tipo: 'foto', copia_catalogo: copia }] : []);
      },
    },
  });
  const resultados: unknown[] = [];
  assert.deepEqual(await prepararFotosPendentes(cliente, (resultado) => resultados.push(resultado)), {
    concluidas: 1,
    falhas: 25,
  });
  assert.deepEqual(cursores, [null, `(lote_id.gt.${lote},and(lote_id.eq.${lote},chave.gt.foto-24))`]);
  assert.equal(resultados.length, 26);
  assert.deepEqual(resultados.at(-1), { ...proxima, caminho: copia });
});
