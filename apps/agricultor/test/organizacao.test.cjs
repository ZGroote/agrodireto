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

// Supabase falso: registra RPCs e filtros; respostas definidas por teste.
function falso({ contexto = null, vinculos = [], propriedade = null, criada = 'org-nova' } = {}) {
  const chamadas = [];
  const supabase = {
    auth: { getSession: async () => ({ data: { session: {} } }) },
    rpc: async (nome, args) => {
      chamadas.push([nome, args]);
      if (nome === 'contexto_atual') return { data: contexto, error: null };
      if (nome === 'listar_meus_vinculos') return { data: vinculos, error: null };
      if (nome === 'enviar_propriedade') return { data: 'prop-1', error: null };
      return { data: null, error: null };
    },
    from: (tabela) => {
      const filtros = [];
      const consulta = {
        select: () => consulta, order: () => consulta, limit: () => consulta,
        eq: (campo, valor) => { filtros.push([campo, valor]); return consulta; },
        maybeSingle: async () => { chamadas.push([tabela, filtros]); return { data: propriedade, error: null }; },
        single: async () => { chamadas.push([tabela, filtros]); return { data: { organizacao_id: criada }, error: null }; },
      };
      return consulta;
    },
  };
  const organizacoes = carregar('../lib/organizacoes.ts', { './supabase': { supabase } });
  const remota = carregar('../lib/propriedadeRemota.ts', {
    '@agrodireto/dominio': { camposPropriedadeEnviada: 'id' }, './organizacoes': organizacoes, './supabase': { supabase },
  });
  return { chamadas, organizacoes, remota };
}

// Objetos criados no vm têm outro protótipo; compara só os dados.
const dados = (x) => JSON.parse(JSON.stringify(x));
const vinculo = (id, perfil = 'produtor') => ({ organizacao_id: id, nome: 'Org', perfil, papel: 'membro', propriedades_aprovadas: '2' });
const rascunho = { nome: 'Sítio', cidade: 'Ibiúna', uf: 'SP', area: '2,5', culturas: 'Tomate' };

test('lê só a propriedade da organização escolhida', async () => {
  const { chamadas, remota } = falso({ contexto: 'org-a', propriedade: { id: 'p' } });
  assert.deepEqual(await remota.lerPropriedadeEnviada(), { id: 'p' });
  assert.deepEqual(chamadas.at(-1), ['propriedades', [['organizacao_id', 'org-a']]]);
});

test('sem escolha e com vínculo pede a escolha, sem consultar propriedades', async () => {
  const { chamadas, organizacoes, remota } = falso({ vinculos: [vinculo('org-a')] });
  await assert.rejects(remota.lerPropriedadeEnviada(), { message: organizacoes.mensagemEscolherOrganizacao });
  await assert.rejects(remota.enviarPropriedade(rascunho), { message: organizacoes.mensagemEscolherOrganizacao });
  assert.ok(!chamadas.some(([nome]) => nome === 'propriedades' || nome === 'enviar_propriedade'));
});

test('sem vínculo: nada a ler; primeiro envio escolhe a organização criada', async () => {
  const { chamadas, remota } = falso({ vinculos: [vinculo('org-t', 'transportadora')] });
  assert.equal(await remota.lerPropriedadeEnviada(), null);
  await remota.enviarPropriedade(rascunho);
  const envio = chamadas.find(([nome]) => nome === 'enviar_propriedade');
  assert.equal(envio[1].p_organizacao, null);
  assert.deepEqual(dados(chamadas.at(-1)), ['trocar_contexto', { p_perfil: 'produtor', p_organizacao: 'org-nova' }]);
});

test('envio com organização escolhida grava nela e não troca contexto', async () => {
  const { chamadas, remota } = falso({ contexto: 'org-a' });
  await remota.enviarPropriedade(rascunho);
  assert.equal(chamadas.find(([nome]) => nome === 'enviar_propriedade')[1].p_organizacao, 'org-a');
  assert.ok(!chamadas.some(([nome]) => nome === 'trocar_contexto'));
});

test('vínculos só de produtor; inclusão valida e-mail antes de chamar o servidor', async () => {
  const { chamadas, organizacoes } = falso({ vinculos: [vinculo('org-a'), vinculo('org-c', 'comprador')] });
  assert.deepEqual(dados((await organizacoes.listarVinculos()).map((v) => [v.organizacao_id, v.propriedades_aprovadas])), [['org-a', 2]]);
  await assert.rejects(organizacoes.incluirMembro('org-a', 'sem-arroba'), { message: 'Confira o e-mail.' });
  await organizacoes.incluirMembro('org-a', '  pessoa@exemplo.com ');
  assert.deepEqual(dados(chamadas.at(-1)), ['incluir_membro', { p_organizacao: 'org-a', p_email: 'pessoa@exemplo.com' }]);
});
