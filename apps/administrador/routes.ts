import type { Href } from 'expo-router';

/**
 * Rotas do perfil Administrador (equipe AgroDireto) — fonte única. Telas navegam SEMPRE por aqui,
 * nunca por string solta. Mudou o caminho em app/? Mude só este arquivo.
 *
 * Ids (cadastro, lote, inspeção, pedido, disputa) vão como query opcional enquanto não há backend.
 */
type Id = { id?: string };

export const rotasAdministrador = {
  // Pré-auth — Onboarding → Paywall → Auth (e-mail + senha → código de 6 dígitos)
  onboarding: '/onboarding',
  paywall: '/paywall',
  entrar: '/entrar',
  verificacao: '/verificacao',

  // Tabs
  inicio: '/inicio',
  operacao: '/operacao',
  cadastros: '/cadastros',
  alertas: '/alertas',
  perfil: '/perfil',

  // Administração da plataforma (dentro da tab Perfil, com tab bar)
  usuarios: '/perfil/usuarios',
  papeis: '/perfil/papeis',
  catalogo: '/perfil/catalogo',
  regras: '/perfil/regras',
  conteudo: '/perfil/conteudo',
  integracoes: '/perfil/integracoes',
  auditoria: '/perfil/auditoria',

  // Fluxos em tela cheia (sem tab bar)
  analisarCadastro: (params: Id & { tipo?: 'comprador' | 'transportadora' } = {}): Href => ({ pathname: '/cadastro', params }),
  documentosMidias: (params: Id = {}): Href => ({ pathname: '/documentos', params }),
  revisaoLote: (params: Id = {}): Href => ({ pathname: '/lote', params }),
  rastreabilidade: (params: Id = {}): Href => ({ pathname: '/rastreabilidade', params }),
  inspecoes: '/inspecoes',
  inspecionar: (params: Id = {}): Href => ({ pathname: '/inspecionar', params }),
  pedidoCarga: (params: Id = {}): Href => ({ pathname: '/pedido', params }),
  disputa: (params: Id = {}): Href => ({ pathname: '/disputa', params }),
  conciliacao: '/conciliacao',
  relatorios: '/relatorios',
} as const;

/** Catálogo das telas (mockup 4-administrador.jpeg) — usado no Mapa de telas (dev) e na documentação. */
export const telasAdministrador: { numero: string; nome: string; href: Href }[] = [
  { numero: '00a', nome: 'Onboarding', href: rotasAdministrador.onboarding },
  { numero: '00b', nome: 'Paywall', href: rotasAdministrador.paywall },
  { numero: '01', nome: 'Acesso da equipe', href: rotasAdministrador.entrar },
  { numero: '02', nome: 'Verificação de segurança', href: rotasAdministrador.verificacao },
  { numero: '03', nome: 'Início', href: rotasAdministrador.inicio },
  { numero: '04', nome: 'Cadastros', href: rotasAdministrador.cadastros },
  { numero: '05', nome: 'Analisar cadastro', href: rotasAdministrador.analisarCadastro() },
  { numero: '06', nome: 'Documentos e mídias', href: rotasAdministrador.documentosMidias() },
  { numero: '07', nome: 'Revisão de lotes', href: rotasAdministrador.revisaoLote() },
  { numero: '08', nome: 'Rastreabilidade', href: rotasAdministrador.rastreabilidade() },
  { numero: '09', nome: 'Inspeções', href: rotasAdministrador.inspecoes },
  { numero: '10', nome: 'Inspecionar lote', href: rotasAdministrador.inspecionar() },
  { numero: '11', nome: 'Torre logística', href: rotasAdministrador.operacao },
  { numero: '12', nome: 'Pedido e carga', href: rotasAdministrador.pedidoCarga() },
  { numero: '13', nome: 'Ocorrências', href: rotasAdministrador.alertas },
  { numero: '14', nome: 'Disputa comercial', href: rotasAdministrador.disputa() },
  { numero: '15', nome: 'Conciliação', href: rotasAdministrador.conciliacao },
  { numero: '16', nome: 'Relatórios', href: rotasAdministrador.relatorios },
  { numero: '17', nome: 'Usuários e empresas', href: rotasAdministrador.usuarios },
  { numero: '18', nome: 'Papéis e permissões', href: rotasAdministrador.papeis },
  { numero: '19', nome: 'Catálogo e regiões', href: rotasAdministrador.catalogo },
  { numero: '20', nome: 'Regras da operação', href: rotasAdministrador.regras },
  { numero: '21', nome: 'Conteúdo e notificações', href: rotasAdministrador.conteudo },
  { numero: '22', nome: 'Integrações', href: rotasAdministrador.integracoes },
  { numero: '23', nome: 'Auditoria', href: rotasAdministrador.auditoria },
  { numero: '24', nome: 'Configurações', href: rotasAdministrador.perfil },
];
