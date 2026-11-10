import type { Href } from 'expo-router';
import type { EtapaLote } from '@/lote/rascunhosLote';

/**
 * Rotas do app Agricultor — fonte única. Telas navegam SEMPRE por aqui, nunca por string solta.
 * Mudou o caminho em app/? Mude só este arquivo. Ids vão como query opcional enquanto não há backend.
 */
export const rotasAgricultor = {
  // Pré-auth — Onboarding → Paywall → Auth
  onboarding: '/onboarding',
  paywall: '/paywall',
  entrar: '/entrar',
  criarConta: '/criar-conta',
  recuperarAcesso: '/recuperar-acesso',
  verificarCodigo: '/verificar-codigo',
  termos: '/termos-de-uso',
  politica: '/politica-de-privacidade',

  // Tabs (com tab bar)
  inicio: '/inicio',
  producao: '/producao',
  pedidos: '/pedidos',
  mensagens: '/mensagens',
  perfil: '/perfil',

  // Dentro das tabs (mantêm a tab bar)
  previsao: '/producao/previsao',
  lotes: '/producao/lotes',
  cotacoes: '/producao/cotacoes',
  pedido: (params: { pedido?: string } = {}): Href => ({ pathname: '/pedidos', params }),
  todosPedidos: '/pedidos/todos',
  abrirConversa: (params: { conversa?: string } = {}): Href => ({ pathname: '/mensagens', params }),
  conversas: '/mensagens/conversas',
  preferenciasNotificacao: '/perfil/notificacoes',
  privacidade: '/perfil/privacidade',
  seguranca: '/perfil/seguranca',
  ajuda: '/perfil/ajuda',

  // Cadastro e propriedade (tela cheia)
  cadastro: '/cadastro',
  dadosBancarios: '/cadastro/dados-bancarios',
  propriedade: '/propriedade',
  editarPropriedade: '/propriedade/editar',
  perfilPublico: '/propriedade/perfil-publico',
  midias: '/midias',
  documentos: '/documentos',
  enviarDocumento: (params: { documento?: string } = {}): Href => ({ pathname: '/documentos/enviar', params }),

  // Avisos, dinheiro e produção (tela cheia)
  notificacoes: '/notificacoes',
  financeiro: '/financeiro',
  repasse: '/financeiro/repasse',
  novaCultura: '/cultura/nova',

  // Criação de lote
  novoLote: '/lote/novo',
  padraoLote: '/lote/padrao',
  precoLote: '/lote/preco',
  revisarLote: '/lote/revisar',
  rascunhoLote: (rascunhoId: string, etapa: EtapaLote): Href => ({
    pathname: `/lote/[rascunhoId]/${etapa}` as const,
    params: { rascunhoId },
  }),

  // Lote, venda e entrega
  detalheLote: (params: { id?: string } = {}): Href => ({ pathname: '/detalhe-lote', params }),
  inspecoes: (params: { id?: string } = {}): Href => ({ pathname: '/detalhe-lote/inspecoes', params }),
  negociacao: (params: { id?: string } = {}): Href => ({ pathname: '/negociacao', params }),
  contraproposta: (params: { id?: string } = {}): Href => ({ pathname: '/negociacao/contraproposta', params }),
  prepararColeta: (params: { pedido?: string } = {}): Href => ({ pathname: '/coleta/preparar', params }),
  entregarMotorista: (params: { pedido?: string } = {}): Href => ({ pathname: '/coleta/entregar', params }),
  transporte: (params: { pedido?: string } = {}): Href => ({ pathname: '/transporte', params }),
  ocorrencia: (params: { pedido?: string } = {}): Href => ({ pathname: '/transporte/ocorrencia', params }),
} as const;

/** Catálogo das telas — mockup 1-agricultor.jpeg (01–24) e telas criadas além do mockup (25–45). */
export const telasAgricultor: { numero: string; nome: string; href: Href }[] = [
  { numero: '00a', nome: 'Onboarding', href: rotasAgricultor.onboarding },
  { numero: '00b', nome: 'Paywall', href: rotasAgricultor.paywall },
  { numero: '01', nome: 'Entrar', href: rotasAgricultor.entrar },
  { numero: '02', nome: 'Criar conta', href: rotasAgricultor.criarConta },
  { numero: '03', nome: 'Seu cadastro', href: rotasAgricultor.cadastro },
  { numero: '04', nome: 'Minha propriedade', href: rotasAgricultor.propriedade },
  { numero: '05', nome: 'Fotos e vídeos', href: rotasAgricultor.midias },
  { numero: '06', nome: 'Documentos', href: rotasAgricultor.documentos },
  { numero: '07', nome: 'Início', href: rotasAgricultor.inicio },
  { numero: '08', nome: 'Minha produção', href: rotasAgricultor.producao },
  { numero: '09', nome: 'Previsão de safra', href: rotasAgricultor.previsao },
  { numero: '10', nome: 'Meus lotes', href: rotasAgricultor.lotes },
  { numero: '11', nome: 'Novo lote', href: rotasAgricultor.novoLote },
  { numero: '12', nome: 'Padrão do lote', href: rotasAgricultor.padraoLote },
  { numero: '13', nome: 'Preço e retirada', href: rotasAgricultor.precoLote },
  { numero: '14', nome: 'Revisar oferta', href: rotasAgricultor.revisarLote },
  { numero: '15', nome: 'Detalhe do lote', href: rotasAgricultor.detalheLote({ id: 'AD-1042' }) },
  { numero: '16', nome: 'Cotações', href: rotasAgricultor.cotacoes },
  { numero: '17', nome: 'Negociação', href: rotasAgricultor.negociacao({ id: 'COT-0318' }) },
  { numero: '18', nome: 'Pedidos', href: rotasAgricultor.pedidos },
  { numero: '19', nome: 'Preparar coleta', href: rotasAgricultor.prepararColeta({ pedido: 'PED-2084' }) },
  { numero: '20', nome: 'Entregar ao motorista', href: rotasAgricultor.entregarMotorista({ pedido: 'PED-2084' }) },
  { numero: '21', nome: 'Acompanhar transporte', href: rotasAgricultor.transporte({ pedido: 'PED-2084' }) },
  { numero: '22', nome: 'Financeiro', href: rotasAgricultor.financeiro },
  { numero: '23', nome: 'Mensagens', href: rotasAgricultor.mensagens },
  { numero: '24', nome: 'Configurações', href: rotasAgricultor.perfil },
  { numero: '25', nome: 'Dados bancários', href: rotasAgricultor.dadosBancarios },
  { numero: '26', nome: 'Editar propriedade', href: rotasAgricultor.editarPropriedade },
  { numero: '27', nome: 'Enviar documento', href: rotasAgricultor.enviarDocumento({ documento: 'fitossanitario' }) },
  { numero: '28', nome: 'Central de notificações', href: rotasAgricultor.notificacoes },
  { numero: '29', nome: 'Preferências de notificação', href: rotasAgricultor.preferenciasNotificacao },
  { numero: '30', nome: 'Cadastrar cultura', href: rotasAgricultor.novaCultura },
  { numero: '31', nome: 'Inspeções do lote', href: rotasAgricultor.inspecoes({ id: 'AD-1042' }) },
  { numero: '33', nome: 'Contraproposta', href: rotasAgricultor.contraproposta({ id: 'COT-0318' }) },
  { numero: '34', nome: 'Todos os pedidos', href: rotasAgricultor.todosPedidos },
  { numero: '35', nome: 'Registrar ocorrência', href: rotasAgricultor.ocorrencia({ pedido: 'PED-2084' }) },
  { numero: '36', nome: 'Detalhe do repasse', href: rotasAgricultor.repasse },
  { numero: '37', nome: 'Conversas', href: rotasAgricultor.conversas },
  { numero: '39', nome: 'Privacidade', href: rotasAgricultor.privacidade },
  { numero: '40', nome: 'Segurança', href: rotasAgricultor.seguranca },
  { numero: '41', nome: 'Ajuda', href: rotasAgricultor.ajuda },
  { numero: '42', nome: 'Recuperar acesso', href: rotasAgricultor.recuperarAcesso },
  { numero: '43', nome: 'Termos de Uso', href: rotasAgricultor.termos },
  { numero: '44', nome: 'Política de Privacidade', href: rotasAgricultor.politica },
  { numero: '45', nome: 'Perfil público', href: rotasAgricultor.perfilPublico },
  { numero: '46', nome: 'Verificar código', href: rotasAgricultor.verificarCodigo },
];
