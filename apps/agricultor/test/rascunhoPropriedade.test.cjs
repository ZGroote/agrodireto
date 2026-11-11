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

const legado = '@agrodireto/agricultor/propriedade-rascunho/v1';
const daConta = (id) => `${legado}/${id}`;
const rascunho = { nome: 'Sítio Boa Vista', cidade: 'Ibiúna', uf: 'SP', area: '2,5', culturas: 'Tomate' };

// AsyncStorage em memória e Supabase falso; o resto é o código real do app.
function ambiente({ usuario = 'u1', contexto = 'org-a', enviada = null, falhaEnvio = null, falhaTroca = false, falhaGravar = false } = {}) {
  const memoria = new Map();
  const chamadas = [];
  const sessao = { usuario };
  const AsyncStorage = {
    getItem: async (k) => memoria.get(k) ?? null,
    setItem: async (k, v) => { if (falhaGravar && k !== `${legado}/dono-legado`) throw new Error('disco'); memoria.set(k, v); },
    removeItem: async (k) => { memoria.delete(k); },
  };
  const supabase = {
    auth: { getSession: async () => ({ data: { session: { user: { id: sessao.usuario } } } }) },
    rpc: async (nome, args) => {
      chamadas.push([nome, args]);
      if (nome === 'contexto_atual') return { data: contexto, error: null };
      if (nome === 'listar_meus_vinculos') return { data: [], error: null };
      if (nome === 'enviar_propriedade') return falhaEnvio ? { data: null, error: falhaEnvio } : { data: 'prop-1', error: null };
      if (nome === 'trocar_contexto') return { data: null, error: falhaTroca ? { code: 'XX000' } : null };
      return { data: null, error: null };
    },
    from: () => {
      const consulta = {
        select: () => consulta, eq: () => consulta, order: () => consulta, limit: () => consulta,
        maybeSingle: async () => ({ data: enviada, error: null }),
        single: async () => ({ data: { organizacao_id: 'org-nova' }, error: null }),
      };
      return consulta;
    },
  };
  const base = { './supabase': { supabase } };
  const local = carregar('../lib/rascunhoPropriedade.ts', { ...base, '@react-native-async-storage/async-storage': { __esModule: true, default: AsyncStorage } });
  const organizacoes = carregar('../lib/organizacoes.ts', base);
  const remota = carregar('../lib/propriedadeRemota.ts', {
    ...base, './rascunhoPropriedade': local, './organizacoes': organizacoes, '@agrodireto/dominio': { camposPropriedadeEnviada: '*' },
  });
  return { memoria, chamadas, sessao, local, remota };
}

const dados = (x) => JSON.parse(JSON.stringify(x));

test('rascunho de antes da conta vai para a primeira conta e só depois sai da chave antiga', async () => {
  const a = ambiente();
  a.memoria.set(legado, JSON.stringify(rascunho));
  assert.deepEqual(dados(await a.local.lerRascunhoPropriedade()), rascunho);
  assert.equal(a.memoria.has(legado), false);
  assert.equal(a.memoria.get(daConta('u1')), JSON.stringify(rascunho));
  a.sessao.usuario = 'u2';
  assert.equal(await a.local.lerRascunhoPropriedade(), null);

  // Falha ao copiar: a chave antiga continua (nada é apagado antes da cópia).
  const b = ambiente({ falhaGravar: true });
  b.memoria.set(legado, JSON.stringify(rascunho));
  await assert.rejects(b.local.lerRascunhoPropriedade());
  assert.equal(b.memoria.get(legado), JSON.stringify(rascunho));
});

test('envio confirmado apaga o local; falha no envio ou na troca de contexto mantém', async () => {
  const ok = ambiente();
  ok.memoria.set(daConta('u1'), JSON.stringify(rascunho));
  await ok.remota.enviarRascunhoPropriedade(rascunho);
  assert.equal(ok.memoria.has(daConta('u1')), false);

  for (const falha of [{ falhaEnvio: { code: 'XX000' } }, { falhaEnvio: { code: '23514' } }, { contexto: null, falhaTroca: true }]) {
    const a = ambiente(falha);
    a.memoria.set(daConta('u1'), JSON.stringify(rascunho));
    await assert.rejects(a.remota.enviarRascunhoPropriedade(rascunho));
    assert.equal(a.memoria.get(daConta('u1')), JSON.stringify(rascunho), JSON.stringify(falha));
  }
});

test('nova tentativa repete organização e nome, então o servidor devolve a mesma propriedade', async () => {
  const a = ambiente({ falhaEnvio: { code: 'XX000' } });
  await assert.rejects(a.remota.enviarRascunhoPropriedade(rascunho));
  const b = ambiente();
  await b.remota.enviarRascunhoPropriedade(rascunho);
  const primeira = a.chamadas.find(([nome]) => nome === 'enviar_propriedade')[1];
  const segunda = b.chamadas.find(([nome]) => nome === 'enviar_propriedade')[1];
  assert.deepEqual(dados([primeira.p_nome, primeira.p_organizacao]), dados([segunda.p_nome, segunda.p_organizacao]));
});

test('correção após ajustes abre os dados do servidor, mesmo sem rascunho local', async () => {
  const servidor = { id: 'prop-1', nome: 'Sítio Boa Vista', cidade: 'Ibiúna', uf: 'SP', area: 2.5, culturas: 'Tomate', status: 'ajustes_solicitados', enviada_em: '2026-11-11T10:00:00Z' };
  const a = ambiente({ enviada: servidor });
  assert.equal(a.memoria.size, 0);
  assert.deepEqual(dados(await a.remota.lerFormularioPropriedade(true)), {
    campos: { nome: 'Sítio Boa Vista', cidade: 'Ibiúna', uf: 'SP', area: '2.5', culturas: 'Tomate' },
    revisao: '2026-11-11T10:00:00Z',
  });
  assert.equal(await ambiente({ enviada: { ...servidor, status: 'em_analise' } }).remota.lerFormularioPropriedade(true), null);
  assert.deepEqual(dados(await ambiente().remota.lerFormularioPropriedade(false)), { campos: { nome: '', cidade: '', uf: '', area: '', culturas: '' } });
});
