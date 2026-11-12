import type { Href } from 'expo-router';

/**
 * Rotas do perfil Cliente — fonte única. Telas navegam SEMPRE por aqui,
 * nunca por string solta. Mudou o caminho em app/? Mude só este arquivo.
 *
 * Ids (oferta, fornecedor, cotação, pedido) vão como query opcional enquanto não há backend.
 */
type Id = { id?: string };
type Pedido = { pedido?: string };

export const rotasCliente = {
  // Pré-auth — Onboarding → Paywall → Auth
  onboarding: '/onboarding',
  paywall: '/paywall',
  entrar: '/entrar',
  criarConta: '/criar-conta',
  recuperarAcesso: '/recuperar-acesso',

  // Cadastro da empresa compradora (sem tab bar)
  empresa: '/empresa',

  // Tabs
  inicio: '/inicio',
  ofertas: '/ofertas',
  pedidos: '/pedidos',
  mensagens: '/mensagens',
  perfil: '/perfil',

  // Dentro das tabs (mantêm a tab bar)
  cotacoes: '/inicio/cotacoes',
  favoritos: '/ofertas/favoritos',
  pedido: (params: Id = {}): Href => ({ pathname: '/pedidos/pedido', params }),

  // Descoberta e cotação (sem tab bar)
  filtros: '/filtros',
  fornecedor: (params: Id = {}): Href => ({ pathname: '/fornecedor', params }),
  oferta: (params: Id = {}): Href => ({ pathname: '/oferta', params }),
  comparar: '/comparar',
  solicitarCotacao: (params: { oferta?: string } = {}): Href => ({ pathname: '/cotacao', params }),
  negociacao: (params: Id = {}): Href => ({ pathname: '/negociacao', params }),

  // Compra (sem tab bar)
  resumoCompra: '/compra/resumo',
  entrega: '/compra/entrega',
  confirmarPedido: '/compra/confirmar',
  pedidoConfirmado: '/compra/confirmado',

  // Pós-compra (sem tab bar)
  rastrear: (params: Pedido = {}): Href => ({ pathname: '/rastrear', params }),
  recebimento: (params: Pedido = {}): Href => ({ pathname: '/recebimento', params }),
  divergencia: (params: Pedido = {}): Href => ({ pathname: '/divergencia', params }),
  avaliar: (params: Pedido = {}): Href => ({ pathname: '/avaliar', params }),
  faturas: '/faturas',

  // Empresa, equipe e demandas (sem tab bar)
  empresas: '/empresas',
  equipe: '/equipe',
  demandas: '/demandas',
} as const;

/** Catálogo das telas (mockup 3-cliente.jpeg) — usado no Mapa de telas (dev) e na documentação. */
export const telasCliente: { numero: string; nome: string; href: Href }[] = [
  { numero: '00a', nome: 'Onboarding', href: rotasCliente.onboarding },
  { numero: '00b', nome: 'Paywall', href: rotasCliente.paywall },
  { numero: '01', nome: 'Entrar', href: rotasCliente.entrar },
  { numero: '02', nome: 'Início', href: rotasCliente.inicio },
  { numero: '03', nome: 'Ofertas', href: rotasCliente.ofertas },
  { numero: '04', nome: 'Mapa e filtros', href: rotasCliente.filtros },
  { numero: '05', nome: 'Fornecedor', href: rotasCliente.fornecedor() },
  { numero: '06', nome: 'Detalhe da oferta', href: rotasCliente.oferta() },
  { numero: '07', nome: 'Comparar ofertas', href: rotasCliente.comparar },
  { numero: '08', nome: 'Solicitar cotação', href: rotasCliente.solicitarCotacao() },
  { numero: '09', nome: 'Minhas cotações', href: rotasCliente.cotacoes },
  { numero: '10', nome: 'Negociação', href: rotasCliente.negociacao() },
  { numero: '11', nome: 'Favoritos', href: rotasCliente.favoritos },
  { numero: '12', nome: 'Resumo da compra', href: rotasCliente.resumoCompra },
  { numero: '13', nome: 'Entrega', href: rotasCliente.entrega },
  { numero: '14', nome: 'Confirmar pedido', href: rotasCliente.confirmarPedido },
  { numero: '15', nome: 'Pedido confirmado', href: rotasCliente.pedidoConfirmado },
  { numero: '16', nome: 'Meus pedidos', href: rotasCliente.pedidos },
  { numero: '17', nome: 'Detalhe do pedido', href: rotasCliente.pedido() },
  { numero: '18', nome: 'Rastrear entrega', href: rotasCliente.rastrear() },
  { numero: '19', nome: 'Conferir recebimento', href: rotasCliente.recebimento() },
  { numero: '20', nome: 'Registrar divergência', href: rotasCliente.divergencia() },
  { numero: '21', nome: 'Avaliar entrega', href: rotasCliente.avaliar() },
  { numero: '22', nome: 'Faturas e financeiro', href: rotasCliente.faturas },
  { numero: '23', nome: 'Mensagens', href: rotasCliente.mensagens },
  { numero: '24', nome: 'Configurações', href: rotasCliente.perfil },
  { numero: '25', nome: 'Criar conta', href: rotasCliente.criarConta },
  { numero: '26', nome: 'Cadastro da empresa', href: rotasCliente.empresa },
  { numero: '27', nome: 'Recuperar acesso', href: rotasCliente.recuperarAcesso },
  { numero: '28', nome: 'Trocar empresa', href: rotasCliente.empresas },
  { numero: '29', nome: 'Equipe e permissões', href: rotasCliente.equipe },
  { numero: '30', nome: 'Demandas de compra', href: rotasCliente.demandas },
];
