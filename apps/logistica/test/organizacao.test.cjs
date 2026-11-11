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
function falso({ contexto = null, vinculos = [], cadastro = null, papel = 'membro' } = {}) {
  const chamadas = [];
  const supabase = {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }) },
    rpc: async (nome, args) => {
      chamadas.push([nome, args]);
      if (nome === 'contexto_atual') return { data: contexto, error: null };
      if (nome === 'listar_meus_vinculos') return { data: vinculos, error: null };
      if (nome === 'enviar_cadastro_transportadora') return { data: 'org-nova', error: null };
      return { data: null, error: null };
    },
    from: (tabela) => {
      const filtros = [];
      const consulta = {
        select: () => consulta,
        eq: (campo, valor) => { filtros.push([campo, valor]); return consulta; },
        maybeSingle: async () => {
          chamadas.push([tabela, filtros]);
          return { data: tabela === 'membros_organizacao' ? { papel } : cadastro, error: null };
        },
      };
      return consulta;
    },
  };
  const deps = { './supabase': { supabase, exigirSessao: async () => undefined } };
  const organizacoes = carregar('../lib/organizacoes.ts', deps);
  const transportadora = carregar('../lib/transportadora.ts', { ...deps, './organizacoes': organizacoes });
  return { chamadas, organizacoes, transportadora };
}

// Objetos criados no vm têm outro protótipo; compara só os dados.
const dados = (x) => JSON.parse(JSON.stringify(x));
const vinculo = (id, perfil = 'transportadora', papel = 'membro') => ({ organizacao_id: id, nome: 'Transp', perfil, papel, status_cadastro: 'aprovada', propriedades_aprovadas: 0 });
const form = {
  razaoSocial: 'Transp', cnpj: '11222333000181', contatoNome: 'Ana', contatoTelefone: '(11) 99999-0000',
  cidade: 'Campinas', uf: 'SP', ufsAtendidas: 'SP, MG', tiposCarga: ['carga_seca'],
};

test('lê só a transportadora em uso, com o papel nela', async () => {
  const { chamadas, transportadora } = falso({ contexto: 'org-a', cadastro: { organizacao_id: 'org-a' }, papel: 'titular' });
  assert.deepEqual(dados(await transportadora.lerCadastroTransportadora()), { organizacao_id: 'org-a', papel: 'titular' });
  const filtros = dados(chamadas.filter(([nome]) => nome === 'membros_organizacao' || nome === 'cadastros_transportadora'));
  assert.deepEqual(filtros, [
    ['membros_organizacao', [['usuario_id', 'u1'], ['organizacao_id', 'org-a']]],
    ['cadastros_transportadora', [['organizacao_id', 'org-a']]],
  ]);
});

test('sem escolha e com vínculo pede a escolha, sem consultar cadastros', async () => {
  const { chamadas, organizacoes, transportadora } = falso({ vinculos: [vinculo('org-a')] });
  await assert.rejects(transportadora.lerCadastroTransportadora(), { message: organizacoes.mensagemEscolherEmpresa });
  assert.ok(!chamadas.some(([nome]) => nome === 'cadastros_transportadora'));
});

test('sem vínculo: formulário novo; primeiro envio escolhe a empresa criada', async () => {
  const { chamadas, transportadora } = falso({ vinculos: [vinculo('org-c', 'comprador')] });
  assert.equal(await transportadora.lerCadastroTransportadora(), null);
  await transportadora.enviarCadastroTransportadora(form, null);
  assert.deepEqual(dados(chamadas.at(-1)), ['trocar_contexto', { p_perfil: 'transportadora', p_organizacao: 'org-nova' }]);
});

test('vínculos só de transportadora; inclusão valida e-mail antes de chamar o servidor', async () => {
  const { chamadas, organizacoes } = falso({ vinculos: [vinculo('org-a', 'transportadora', 'titular'), vinculo('org-p', 'produtor')] });
  assert.deepEqual(dados(await organizacoes.listarVinculos()), [{ organizacao_id: 'org-a', nome: 'Transp', papel: 'titular', status_cadastro: 'aprovada' }]);
  await assert.rejects(organizacoes.incluirMembro('org-a', 'sem-arroba'), { message: 'Confira o e-mail.' });
  await organizacoes.incluirMembro('org-a', '  pessoa@transp.com ');
  assert.deepEqual(dados(chamadas.at(-1)), ['incluir_membro', { p_organizacao: 'org-a', p_email: 'pessoa@transp.com' }]);
});
