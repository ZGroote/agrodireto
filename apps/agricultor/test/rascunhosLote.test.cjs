/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

// Executa os módulos reais; substitui somente armazenamento, sessão, arquivos e rede.
function carregar(arquivo, dependencias, fonte) {
  const codigo = fonte ?? readFileSync(resolve(__dirname, arquivo), 'utf8');
  const compilado = ts.transpileModule(codigo, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  runInNewContext(compilado, { exports, console, require: (nome) => {
    if (!(nome in dependencias)) throw new Error(`Dependência não preparada: ${nome}`);
    return dependencias[nome];
  } });
  return exports;
}

// Usa as funções de datas reais do UI, sem carregar React Native no Node.
const arquivoUI = readFileSync(resolve(__dirname, '../../../packages/ui/components/popups.tsx'), 'utf8');
const ast = ts.createSourceFile('popups.tsx', arquivoUI, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const nomes = ['dois', 'formatarData', 'formatarPeriodo', 'lerPeriodo'];
const datasFonte = ast.statements.filter((no) => nomes.includes(no.name?.text) ||
  (ts.isVariableStatement(no) && no.declarationList.declarations.some((d) => nomes.includes(d.name.getText(ast)))))
  .map((no) => no.getText(ast)).join('\n');
const ui = carregar('', {}, datasFonte);
const culturas = carregar('../lib/culturas.ts', { './supabase': { supabase: null } });
const remotoReal = carregar('../lib/rascunhosRemotos.ts', { '@agrodireto/ui': ui, './culturas': culturas, './supabase': { supabase: null } });

function ambiente() {
  const disco = new Map();
  const servidor = new Map();
  const arquivos = new Map();
  const estado = { conta: 'autor-a', online: true, antesEnvio: null };
  const chave = () => `@agrodireto/agricultor/lotes-rascunhos/v2/${estado.conta}`;
  const dependencias = {
    '@react-native-async-storage/async-storage': { getItem: async (k) => disco.get(k) ?? null, setItem: async (k, v) => disco.set(k, v) },
    './arquivosEvidencia': { armazenarEvidencia: async (k, uri) => arquivos.set(k, uri), apagarEvidencia: async (k) => arquivos.delete(k) },
    '@/lib/supabase': { supabase: { auth: { getSession: async () => ({ data: { session: { user: { id: estado.conta } } } }) } } },
    '@/lib/rascunhosRemotos': {
      validarRascunho: remotoReal.validarRascunho,
      enviarRascunho: async (id, etapa, campos) => {
        const local = JSON.parse(disco.get(chave()));
        assert.equal(local.find((r) => r.id === id).pendente, true, 'local deve estar gravado antes da rede');
        if (estado.antesEnvio) await estado.antesEnvio();
        if (!estado.online) throw new Error('Rede indisponível');
        servidor.set(`${estado.conta}/${id}`, { id, etapa, campos: { ...campos, evidencias: [] } });
      },
      lerRascunhosRemotos: async () => {
        if (!estado.online) throw new Error('Rede indisponível');
        return [...servidor.entries()].filter(([k]) => k.startsWith(`${estado.conta}/`)).map(([, v]) => v);
      },
      descartarRascunhoRemoto: async (id) => {
        if (!estado.online) throw new Error('Rede indisponível');
        servidor.delete(`${estado.conta}/${id}`);
      },
    },
  };
  const abrir = () => carregar('../lote/rascunhosLote.ts', dependencias);
  const mod = abrir();
  const campos = { ...mod.loteVazio, culturaId: 'cultura-a', propriedadeId: 'propriedade-a', produto: 'Tomate', quantidade: '12', precoUnitario: '3,50', padrao: 'A' };
  return { disco, servidor, arquivos, estado, abrir, mod, campos };
}

test('rascunho parcial aceita ausência e recusa valores preenchidos inválidos', () => {
  const { mod, campos } = ambiente();
  assert.equal(remotoReal.validarRascunho(mod.loteVazio).p_quantidade, null);
  assert.equal(remotoReal.validarRascunho({ ...campos, quantidade: '1.234,5' }).p_quantidade, 1234.5);
  for (const parcial of [
    { quantidade: '0' }, { quantidade: '-1' }, { quantidade: 'NaN' }, { quantidade: '1000000001' },
    { precoUnitario: '0' }, { precoUnitario: '1,234' }, { precoUnitario: '1000000001' },
    { unidade: 'sc' }, { padrao: 'A'.repeat(121) }, { validade: '31/02/2026' },
    { retirada: '22/11 a 21/11/2026' }, { retirada: '31/02 a 03/03/2026' },
  ]) assert.throws(() => remotoReal.validarRascunho({ ...campos, ...parcial }));
});

test('falha de rede preserva etapa, campos e mídia após reinício; retentativa não duplica', async () => {
  const a = ambiente();
  a.estado.online = false;
  const salvo = await a.mod.salvarRascunhoLote('lote-1', 'preco', { ...a.campos, evidencias: [{ id: 'foto-1', tipo: 'foto', nome: 'foto.jpg', uri: 'file:///foto' }] });
  assert.equal(salvo.pendente, true);
  assert.equal(a.arquivos.size, 1);
  const reiniciado = a.abrir();
  const [lido] = await reiniciado.lerRascunhosLote();
  assert.equal(lido.etapa, 'preco');
  assert.equal(lido.campos.padrao, 'A');
  assert.equal(lido.campos.evidencias[0].uri, undefined);
  a.estado.online = true;
  assert.equal((await reiniciado.salvarRascunhoLote(lido.id, lido.etapa, lido.campos)).pendente, false);
  await reiniciado.salvarRascunhoLote(lido.id, lido.etapa, lido.campos);
  assert.equal(a.servidor.size, 1);
  assert.equal((await reiniciado.lerRascunhosLote())[0].campos.evidencias.length, 1);
});

test('pendência local prevalece na leitura; após envio vale a última gravação do autor', async () => {
  const a = ambiente();
  await a.mod.salvarRascunhoLote('lote-1', 'novo', a.campos);
  a.estado.online = false;
  await a.mod.salvarRascunhoLote('lote-1', 'padrao', { ...a.campos, quantidade: '20' });
  a.estado.online = true;
  assert.equal((await a.mod.lerRascunhosLote())[0].campos.quantidade, '20');
  await a.mod.salvarRascunhoLote('lote-1', 'padrao', { ...a.campos, quantidade: '20' });
  a.servidor.get('autor-a/lote-1').campos.quantidade = '30';
  assert.equal((await a.mod.lerRascunhosLote())[0].campos.quantidade, '30');
  a.disco.clear();
  assert.equal((await a.abrir().lerRascunhosLote())[0].campos.quantidade, '30');
});

test('contas isoladas e troca de sessão durante envio não confirma dados na conta nova', async () => {
  const a = ambiente();
  await a.mod.salvarRascunhoLote('lote-1', 'novo', a.campos);
  a.estado.conta = 'autor-b';
  assert.equal((await a.mod.lerRascunhosLote()).length, 0);
  a.estado.conta = 'autor-a';
  a.estado.antesEnvio = async () => { a.estado.conta = 'autor-b'; throw new Error('Sessão trocada'); };
  await assert.rejects(a.mod.salvarRascunhoLote('lote-2', 'novo', a.campos), /conta mudou/);
  assert.equal((await a.mod.lerRascunhosLote()).length, 0);
  a.estado.conta = 'autor-a';
  assert.equal((await a.mod.lerRascunhosLote()).find((r) => r.id === 'lote-2').pendente, true);
});

test('descarte com falha preserva o local; confirmação remove remoto e evidências', async () => {
  const a = ambiente();
  await a.mod.salvarRascunhoLote('lote-1', 'novo', { ...a.campos, evidencias: [{ id: 'foto-1', tipo: 'foto', nome: 'foto.jpg', uri: 'file:///foto' }] });
  a.estado.online = false;
  await assert.rejects(a.mod.descartarRascunhoLote('lote-1'));
  assert.equal((await a.mod.lerRascunhosLote()).length, 1);
  a.estado.online = true;
  await a.mod.descartarRascunhoLote('lote-1');
  assert.equal((await a.mod.lerRascunhosLote()).length, 0);
  assert.equal(a.arquivos.size, 0);
});

test('gravação aguardando outra operação mantém a conta de origem', async () => {
  const a = ambiente();
  let liberar;
  let iniciou;
  const inicio = new Promise((r) => { iniciou = r; });
  a.estado.antesEnvio = () => new Promise((r) => { liberar = r; iniciou(); });
  const primeira = a.mod.salvarRascunhoLote('lote-1', 'novo', a.campos);
  await inicio;
  const segunda = a.mod.salvarRascunhoLote('lote-2', 'novo', a.campos);
  // A rede falha depois da troca; a segunda operação não pode usar a nova conta.
  a.estado.online = false;
  a.estado.conta = 'autor-b';
  const rejeicoes = Promise.all([
    assert.rejects(primeira, /conta mudou/), assert.rejects(segunda, /conta mudou/),
  ]);
  liberar();
  await rejeicoes;
  assert.equal((await a.mod.lerRascunhosLote()).length, 0);
  assert.equal(a.servidor.size, 0);
});

test('valor inválido não substitui a última versão local ou remota válida', async () => {
  const a = ambiente();
  await a.mod.salvarRascunhoLote('lote-1', 'novo', a.campos);
  await assert.rejects(a.mod.salvarRascunhoLote('lote-1', 'novo', { ...a.campos, quantidade: '0' }));
  assert.equal((await a.mod.lerRascunhosLote())[0].campos.quantidade, '12');
  assert.equal(a.servidor.get('autor-a/lote-1').campos.quantidade, '12');
});
