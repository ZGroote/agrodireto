/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

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

function falso(respostas = {}) {
  const chamadas = [];
  const supabase = { rpc: async (nome, args) => { chamadas.push([nome, args]); return respostas[nome] ?? { data: null, error: null }; } };
  return { chamadas, equipe: carregar('../lib/equipe.ts', { './supabase': { supabase } }) };
}

// Objetos criados no vm têm outro protótipo; compara só os dados.
const dados = (x) => JSON.parse(JSON.stringify(x));

test('MATRIZ do app é igual à do equipe_pode na migration', () => {
  const sql = readFileSync(resolve(__dirname, '../../../supabase/migrations/20261111210000_papeis_equipe.sql'), 'utf8');
  const casoSql = sql.slice(sql.indexOf('create function public.equipe_pode'), sql.indexOf('create policy concessoes_equipe_leitura'));
  const migration = {};
  for (const [, papel, lista] of casoSql.matchAll(/when '(\w+)' then p_acao in \(([^)]*)\)/g)) {
    migration[papel] = [...lista.matchAll(/'(\w+)'/g)].map((m) => m[1]).sort();
  }
  assert.match(casoSql, /when 'geral' then true/);
  const { equipe } = falso();
  const app = Object.fromEntries(Object.entries(dados(equipe.MATRIZ)).map(([papel, lista]) => [papel, [...lista].sort()]));
  assert.deepEqual(app, migration);
  assert.deepEqual(dados(equipe.papeis.map((p) => p.value)).sort(), ['geral', ...Object.keys(migration)].sort());
  // Toda ação da matriz aparece na tela 18.
  const acoes = dados(equipe.acoes.map((a) => a.value));
  for (const lista of Object.values(migration)) for (const a of lista) assert.ok(acoes.includes(a), a);
});

test('pode: geral tudo; tela sem ação no servidor só o geral; sem papel nada', () => {
  const { equipe } = falso();
  assert.equal(equipe.pode('geral', 'sem_acao_no_servidor'), true);
  assert.equal(equipe.pode('auditor', 'sem_acao_no_servidor'), false);
  assert.equal(equipe.pode('cadastral', 'revisar_ofertas'), true);
  assert.equal(equipe.pode('comercial', 'revisar_ofertas'), false);
  assert.equal(equipe.pode('auditor', 'ler_equipe'), true);
  assert.equal(equipe.pode('auditor', 'gerir_equipe'), false);
  assert.equal(equipe.pode(null, 'ler_cadastros'), false);
});

test('papelEquipe aceita só papéis conhecidos', async () => {
  assert.equal(await falso({ papel_equipe: { data: 'financeiro', error: null } }).equipe.papelEquipe(), 'financeiro');
  assert.equal(await falso({ papel_equipe: { data: null, error: null } }).equipe.papelEquipe(), null);
  assert.equal(await falso({ papel_equipe: { data: 'dono', error: null } }).equipe.papelEquipe(), null);
});

test('conceder e revogar: e-mail validado antes do servidor e mensagens claras', async () => {
  const { chamadas, equipe } = falso({ conceder_acesso_equipe: { data: true, error: null } });
  await assert.rejects(equipe.concederAcesso('sem-arroba', 'suporte'), { message: 'Confira o e-mail.' });
  assert.equal(chamadas.length, 0);
  assert.equal(await equipe.concederAcesso('  pessoa@agrodireto.com ', 'suporte'), 'Acesso concedido.');
  assert.deepEqual(dados(chamadas.at(-1)), ['conceder_acesso_equipe', { p_email: 'pessoa@agrodireto.com', p_papel: 'suporte' }]);
  assert.equal(await falso({ conceder_acesso_equipe: { data: false, error: null } }).equipe.concederAcesso('x@y.com', 'suporte'), 'Nenhuma conta com este e-mail.');
  await assert.rejects(falso({ revogar_acesso_equipe: { data: null, error: { code: '42501' } } }).equipe.revogarAcesso('u1'), /Sem permissão/);
  await assert.rejects(falso({ conceder_acesso_equipe: { data: null, error: { code: 'PT422' } } }).equipe.concederAcesso('x@y.com', 'suporte'), { message: 'Escolha um papel válido.' });
});
