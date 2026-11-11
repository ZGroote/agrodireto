/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

// Executa o módulo real; substitui armazenamento, sessão, arquivos e o Supabase (que imita as RPCs da D03).
function carregar(arquivo, dependencias) {
  const codigo = readFileSync(resolve(__dirname, arquivo), 'utf8');
  const compilado = ts.transpileModule(codigo, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  runInNewContext(compilado, { exports, console, require: (nome) => {
    if (!(nome in dependencias)) throw new Error(`Dependência não preparada: ${nome}`);
    return dependencias[nome];
  } });
  return exports;
}

function ambiente() {
  const disco = new Map();
  const arquivos = new Map();
  // Servidor: reservas por chave e objetos no bucket.
  const midias = new Map();
  const objetos = new Map();
  const estado = { conta: 'autor-a', online: true, cairNoMeio: false, putsFeitos: 0 };
  const rede = () => { if (!estado.online) throw new Error('Rede indisponível'); };
  const erro = (code, message) => ({ data: null, error: { code, message } });

  const supabase = {
    auth: { getSession: async () => ({ data: { session: { user: { id: estado.conta } } } }) },
    // Como o supabase-js: sem rede, devolve erro em vez de lançar.
    rpc: async (nome, p) => {
      if (!estado.online) return erro('', 'Failed to fetch');
      if (nome === 'reservar_midia') {
        const caminho = `org/propriedade/${p.p_propriedade}/${p.p_chave}.${p.p_extensao}`;
        if (!midias.has(caminho)) midias.set(caminho, { autor: estado.conta, chave: p.p_chave, enviada: false, recusada: false });
        return { data: caminho, error: null };
      }
      if (nome === 'confirmar_midia') {
        const m = midias.get(p.p_arquivo);
        if (!m || m.autor !== estado.conta || !objetos.has(p.p_arquivo)) return erro('PT409', 'Arquivo ainda não confirmado.');
        if (m.enviada) return { data: 'enviada', error: null };
        if (m.recusada || objetos.get(p.p_arquivo) > 20 * 1024 * 1024) { m.recusada = true; return { data: 'recusada', error: null }; }
        m.enviada = true;
        return { data: 'enviada', error: null };
      }
      throw new Error(`RPC inesperada ${nome}`);
    },
    storage: { from: () => ({
      // Igual à policy midias_storage_envio: só o autor, só com reserva pendente e sem objeto.
      createSignedUploadUrl: async (caminho) => {
        if (!estado.online) return erro('', 'Failed to fetch');
        const m = midias.get(caminho);
        if (!m || m.autor !== estado.conta || m.enviada || objetos.has(caminho)) return erro('403', 'new row violates row-level security policy');
        return { data: { signedUrl: `https://s/${caminho}` }, error: null };
      },
    }) },
  };

  const dependencias = {
    '@react-native-async-storage/async-storage': { getItem: async (k) => disco.get(k) ?? null, setItem: async (k, v) => disco.set(k, v) },
    './supabase': { supabase },
    '@/lote/arquivosEvidencia': {
      armazenarEvidencia: async (k, uri) => { if (uri === 'file:///sumiu') throw new Error('Arquivo indisponível'); arquivos.set(k, uri); },
      apagarEvidencia: async (k) => arquivos.delete(k),
      abrirEvidencia: async (k) => ({ uri: arquivos.get(k) }),
      enviarArquivoLocal: async (k, url, _mime, onProgresso) => {
        assert.ok(arquivos.has(k), 'o arquivo sai da cópia guardada no aparelho');
        rede();
        estado.putsFeitos += 1;
        onProgresso(0.5);
        if (estado.cairNoMeio) { estado.cairNoMeio = false; throw new Error('Conexão interrompida'); }
        const caminho = url.replace('https://s/', '');
        objetos.set(caminho, arquivos.get(k) === 'file:///grande' ? 21 * 1024 * 1024 : 7 * 1024 * 1024);
        onProgresso(1);
        return 200;
      },
    },
  };
  const abrir = () => carregar('../lib/midiasRemotas.ts', dependencias);
  return { disco, arquivos, midias, objetos, estado, abrir, mod: abrir() };
}

const video = { uri: 'file:///video', nome: 'colheita.MOV', tipo: 'video', mime: 'video/quicktime', tamanho: 7 * 1024 * 1024 };

test('fila local antes da rede; reinício no meio do envio; nova tentativa não duplica', async () => {
  const a = ambiente();
  a.estado.online = false;
  const { adicionadas } = await a.mod.adicionarPendentes('prop-1', [video]);
  assert.equal(adicionadas.length, 1);
  const [m] = adicionadas;
  assert.match(m.chave, /^[a-z0-9-]{1,80}$/);

  a.estado.online = true;
  a.estado.cairNoMeio = true;
  await assert.rejects(a.mod.enviarPendente(m, () => {}), /interrompida/);

  // Reinício do app: a fila e o arquivo continuam no aparelho.
  const reiniciado = a.abrir();
  const [lido] = await reiniciado.lerPendentes('prop-1');
  assert.equal(lido.chave, m.chave);
  const progresso = [];
  assert.equal(await reiniciado.enviarPendente(lido, (f) => progresso.push(f)), 'enviada');
  assert.equal(progresso.join(), '0.5,1');
  assert.equal(a.midias.size, 1, 'uma reserva só, mesmo com duas tentativas');
  assert.equal((await reiniciado.lerPendentes('prop-1')).length, 0);
  assert.equal(a.arquivos.size, 0, 'cópia local apagada depois da confirmação');
});

test('arquivo já subiu mas a confirmação falhou: a nova tentativa só confirma', async () => {
  const a = ambiente();
  const { adicionadas: [m] } = await a.mod.adicionarPendentes('prop-1', [video]);
  // A rede cai entre o PUT (último progresso) e a confirmação.
  await assert.rejects(
    a.mod.enviarPendente(m, (f) => { if (f === 1) a.estado.online = false; }),
    /Arquivo enviado\. Tente de novo/,
  );
  assert.equal((await a.mod.lerPendentes('prop-1')).length, 1, 'continua na fila');
  a.estado.online = true;
  assert.equal(await a.mod.enviarPendente(m, () => {}), 'enviada');
  assert.equal(a.estado.putsFeitos, 1, 'não sobe o arquivo de novo');
});

test('URL de envio só sai para o autor com reserva pendente', async () => {
  const a = ambiente();
  const { adicionadas: [m] } = await a.mod.adicionarPendentes('prop-1', [video]);
  a.estado.cairNoMeio = true;
  await assert.rejects(a.mod.enviarPendente(m, () => {}), /interrompida/);
  // Outra conta tentando o mesmo caminho reservado não recebe URL.
  a.estado.conta = 'autor-b';
  await assert.rejects(a.mod.enviarPendente(m, () => {}), /iniciar o envio/);
  a.estado.conta = 'autor-a';
  assert.equal(await a.mod.enviarPendente(m, () => {}), 'enviada');
  assert.equal(a.estado.putsFeitos, 2);
});

test('arquivo acima do limite volta como recusado e sai da fila', async () => {
  const a = ambiente();
  const { adicionadas: [m] } = await a.mod.adicionarPendentes('prop-1', [{ uri: 'file:///grande', nome: 'foto.jpg', tipo: 'foto', mime: 'image/jpeg' }]);
  assert.equal(await a.mod.enviarPendente(m, () => {}), 'recusada');
  assert.equal((await a.mod.lerPendentes('prop-1')).length, 0);
});

test('filas separadas por conta; arquivo que não copia não entra na fila', async () => {
  const a = ambiente();
  const r = await a.mod.adicionarPendentes('prop-1', [video, { uri: 'file:///sumiu', nome: 'x.jpg', tipo: 'foto' }]);
  assert.equal(r.adicionadas.length, 1);
  assert.equal(r.falhas.length, 1);
  a.estado.conta = 'autor-b';
  assert.equal((await a.mod.lerPendentes('prop-1')).length, 0);
  a.estado.conta = 'autor-a';
  assert.equal((await a.mod.lerPendentes('prop-1')).length, 1);
  assert.equal((await a.mod.lerPendentes('prop-2')).length, 0);
});

test('adições simultâneas não se perdem', async () => {
  const a = ambiente();
  await Promise.all([a.mod.adicionarPendentes('prop-1', [video]), a.mod.adicionarPendentes('prop-1', [video])]);
  assert.equal((await a.mod.lerPendentes('prop-1')).length, 2);
});
