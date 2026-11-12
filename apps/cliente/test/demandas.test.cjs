/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

function carregar(arquivo, dependencias) {
  const codigo = readFileSync(resolve(__dirname, arquivo), 'utf8');
  const compilado = ts.transpileModule(codigo, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  runInNewContext(compilado, {
    exports,
    console,
    require: (nome) => {
      if (!(nome in dependencias)) throw new Error(`Dependência não preparada: ${nome}`);
      return dependencias[nome];
    },
  });
  return exports;
}

const dados = (x) => JSON.parse(JSON.stringify(x));

function criarAmbiente({
  organizacao = 'org-1',
  erroSalvar = null,
  erroEncerrar = null,
  linhas = [],
  abertas = [],
  erroAbertas = null,
} = {}) {
  const chamadas = [];
  const supabase = {
    rpc: async (nome, args) => {
      chamadas.push([nome, args]);
      if (nome === 'salvar_demanda_compra') return { data: erroSalvar ? null : 'dem-1', error: erroSalvar };
      if (nome === 'encerrar_demanda_compra') return { data: null, error: erroEncerrar };
      if (nome === 'listar_demandas_abertas') return { data: erroAbertas ? null : abertas, error: erroAbertas };
      return { data: null, error: null };
    },
    from: (tabela) => {
      const filtros = [];
      const consulta = {
        select: () => consulta,
        eq: (c, v) => {
          filtros.push([c, v]);
          return consulta;
        },
        order: () => consulta,
        returns: async () => {
          chamadas.push([tabela, filtros]);
          return { data: linhas, error: null };
        },
      };
      return consulta;
    },
  };
  const demandasCliente = carregar('../lib/demandas.ts', {
    './organizacoes': { organizacaoEmUso: async () => organizacao },
    './supabase': { supabase },
  });
  const demandasAgricultor = carregar('../../agricultor/lib/demandas.ts', {
    './supabase': { supabase },
  });
  return { chamadas, demandasCliente, demandasAgricultor };
}

test('publica e edita demanda passando organizacao_id explícito e UF SP', async () => {
  const { chamadas, demandasCliente } = criarAmbiente({ organizacao: 'org-compradora-sp' });
  const id = await demandasCliente.salvarDemandaCompra({
    catalogoId: 'cat-tomate',
    quantidade: '250,5',
    unidade: 'cx',
    prazo: '20/12/2026',
    uf: 'sp',
    observacao: '  Caixas plásticas  ',
  });
  assert.equal(id, 'dem-1');
  assert.deepEqual(dados(chamadas.at(-1)), [
    'salvar_demanda_compra',
    {
      p_id: null,
      p_organizacao_id: 'org-compradora-sp',
      p_catalogo_id: 'cat-tomate',
      p_quantidade: 250.5,
      p_unidade: 'cx',
      p_prazo: '2026-12-20',
      p_uf: 'SP',
      p_observacao: 'Caixas plásticas',
    },
  ]);

  await demandasCliente.encerrarDemandaCompra('dem-1');
  assert.deepEqual(dados(chamadas.at(-1)), [
    'encerrar_demanda_compra',
    { p_id: 'dem-1', p_organizacao_id: 'org-compradora-sp' },
  ]);
});

test('recusa quantidade inválida, data inexistente, UF fora de SP ou empresa ausente antes do RPC', async () => {
  const { chamadas, demandasCliente } = criarAmbiente({ organizacao: 'org-1' });
  await assert.rejects(
    demandasCliente.salvarDemandaCompra({
      catalogoId: 'cat-1',
      quantidade: '0',
      unidade: 'kg',
      prazo: '20/12/2026',
      uf: 'SP',
      observacao: '',
    }),
  );
  await assert.rejects(
    demandasCliente.salvarDemandaCompra({
      catalogoId: 'cat-1',
      quantidade: '100',
      unidade: 'kg',
      prazo: '31/02/2026',
      uf: 'SP',
      observacao: '',
    }),
  );
  await assert.rejects(
    demandasCliente.salvarDemandaCompra({
      catalogoId: 'cat-1',
      quantidade: '100',
      unidade: 'kg',
      prazo: '20/12/2026',
      uf: 'PR',
      observacao: '',
    }),
  );
  assert.equal(chamadas.length, 0);

  const semOrg = criarAmbiente({ organizacao: null });
  await assert.rejects(semOrg.demandasCliente.listarMinhasDemandas(), /Cadastre e aprove sua empresa/);
});

test('lista demandas da empresa em uso e mapeia erros PT403/PT422 e leitura do Agricultor', async () => {
  const { chamadas, demandasCliente, demandasAgricultor } = criarAmbiente({
    organizacao: 'org-sp',
    linhas: [
      {
        id: 'd1',
        organizacao_id: 'org-sp',
        catalogo_id: 'c1',
        quantidade: 1200,
        unidade: 'kg',
        prazo: '2026-11-30',
        uf: 'SP',
        observacao: 'Lote limpo',
        status: 'aberta',
        catalogo_culturas: { nome: 'Tomate', unidades: ['kg', 'cx'] },
      },
    ],
    abertas: [
      {
        id: 'd1',
        catalogo_id: 'c1',
        cultura: 'Tomate',
        segmento: 'hortifruti',
        comprador: 'Atacado SP',
        cidade: 'Campinas',
        uf: 'SP',
        quantidade: 1200,
        unidade: 'kg',
        prazo: '2026-11-30',
        observacao: 'Lote limpo',
      },
    ],
  });

  const proprias = await demandasCliente.listarMinhasDemandas();
  assert.equal(proprias.organizacaoId, 'org-sp');
  assert.equal(proprias.demandas[0].prazo, '30/11/2026');
  assert.deepEqual(dados(chamadas.at(-1)), ['demandas_compra', [['organizacao_id', 'org-sp']]]);

  const abertas = await demandasAgricultor.listarDemandasAbertas(' Tomate ');
  assert.equal(abertas[0].comprador, 'Atacado SP');
  assert.equal(abertas[0].prazo, '30/11/2026');
  assert.deepEqual(dados(chamadas.at(-1)), ['listar_demandas_abertas', { p_busca: 'Tomate', p_pagina: 0 }]);

  const negado = criarAmbiente({ erroSalvar: { code: 'PT403' }, erroAbertas: { code: 'PT403' } });
  await assert.rejects(
    negado.demandasCliente.salvarDemandaCompra({
      catalogoId: 'c1',
      quantidade: '10',
      unidade: 'kg',
      prazo: '20/12/2026',
      uf: 'SP',
      observacao: '',
    }),
    /precisa estar aprovada/,
  );
  await assert.rejects(negado.demandasAgricultor.listarDemandasAbertas(), /propriedade é aprovada/);
});
