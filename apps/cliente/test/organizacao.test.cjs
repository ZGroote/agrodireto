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
function falso({ contexto = null, vinculos = [], cadastro = null, erroReenvio = null } = {}) {
  const chamadas = [];
  const supabase = {
    rpc: async (nome, args) => {
      chamadas.push([nome, args]);
      if (nome === 'contexto_atual') return { data: contexto, error: null };
      if (nome === 'listar_meus_vinculos') return { data: vinculos, error: null };
      if (nome === 'enviar_cadastro_comprador') return { data: 'org-nova', error: null };
      if (nome === 'reenviar_cadastro_comprador') return { data: null, error: erroReenvio };
      return { data: null, error: null };
    },
    from: (tabela) => {
      const filtros = [];
      const consulta = {
        select: () => consulta,
        eq: (campo, valor) => { filtros.push([campo, valor]); return consulta; },
        maybeSingle: async () => { chamadas.push([tabela, filtros]); return { data: cadastro, error: null }; },
      };
      return consulta;
    },
  };
  const organizacoes = carregar('../lib/organizacoes.ts', { './supabase': { supabase } });
  // cnpjValido real seria do domínio; aqui só os dados válidos importam.
  const comprador = carregar('../lib/cadastroComprador.ts', {
    '@agrodireto/dominio': { camposCadastroComprador: '*', cnpjValido: () => true },
    './organizacoes': organizacoes, './supabase': { supabase },
  });
  return { chamadas, organizacoes, comprador };
}

// Objetos criados no vm têm outro protótipo; compara só os dados.
const dados = (x) => JSON.parse(JSON.stringify(x));
const vinculo = (id, perfil = 'comprador', papel = 'membro') => ({ organizacao_id: id, nome: 'Empresa', perfil, papel, status_cadastro: 'aprovada', propriedades_aprovadas: 0 });
const empresa = {
  razao_social: 'Mercado', cnpj: '11222333000181', contato_nome: 'Ana', contato_telefone: '(11) 99999-0000',
  cidade: 'Campinas', uf: 'SP', endereco_entrega: 'Rua A, 10',
};

test('lê só o cadastro da empresa em uso', async () => {
  const { chamadas, comprador } = falso({ contexto: 'org-a', cadastro: { organizacao_id: 'org-a' } });
  assert.equal((await comprador.lerCadastroComprador()).organizacao_id, 'org-a');
  assert.deepEqual(dados(chamadas.at(-1)), ['cadastros_comprador', [['organizacao_id', 'org-a']]]);
});

test('sem escolha e com vínculo pede a escolha, sem consultar cadastros', async () => {
  const { chamadas, organizacoes, comprador } = falso({ vinculos: [vinculo('org-a')] });
  await assert.rejects(comprador.lerCadastroComprador(), { message: organizacoes.mensagemEscolherEmpresa });
  assert.ok(!chamadas.some(([nome]) => nome === 'cadastros_comprador'));
});

test('sem vínculo: formulário novo; primeiro envio escolhe a empresa criada', async () => {
  const { chamadas, comprador } = falso({ vinculos: [vinculo('org-p', 'produtor')] });
  assert.equal(await comprador.lerCadastroComprador(), null);
  await comprador.enviarCadastroComprador(empresa);
  assert.deepEqual(dados(chamadas.at(-1)), ['trocar_contexto', { p_perfil: 'comprador', p_organizacao: 'org-nova' }]);
});

test('reenvio recusado ao membro mostra que só o titular corrige, sem trocar contexto', async () => {
  const { chamadas, comprador } = falso({ erroReenvio: { code: '42501' } });
  const atual = { organizacao_id: 'org-a', enviada_em: '2026-11-11T10:00:00Z' };
  await assert.rejects(comprador.enviarCadastroComprador(empresa, atual), { message: 'Só o titular corrige o cadastro da empresa.' });
  assert.ok(!chamadas.some(([nome]) => nome === 'trocar_contexto'));
});

test('vínculos só de comprador; inclusão valida e-mail antes de chamar o servidor', async () => {
  const { chamadas, organizacoes } = falso({ vinculos: [vinculo('org-a', 'comprador', 'titular'), vinculo('org-p', 'produtor')] });
  assert.deepEqual(dados(await organizacoes.listarVinculos()), [{ organizacao_id: 'org-a', nome: 'Empresa', papel: 'titular', status_cadastro: 'aprovada' }]);
  await assert.rejects(organizacoes.incluirMembro('org-a', 'sem-arroba'), { message: 'Confira o e-mail.' });
  await organizacoes.incluirMembro('org-a', '  pessoa@empresa.com ');
  assert.deepEqual(dados(chamadas.at(-1)), ['incluir_membro', { p_organizacao: 'org-a', p_email: 'pessoa@empresa.com' }]);
});
