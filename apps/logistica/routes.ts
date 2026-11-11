import type { Href } from 'expo-router';

/**
 * Rotas do perfil Logística — fonte única. Telas navegam SEMPRE por aqui,
 * nunca por string solta. Mudou o caminho em app/? Mude só este arquivo.
 *
 * O id da carga vai como query opcional enquanto não há backend:
 * rota.carga({ id }) · rota.rotaColeta({ carga }).
 */
type Carga = { carga?: string };

export const rotasLogistica = {
  // Pré-auth — Onboarding → Paywall → Auth
  onboarding: '/onboarding',
  paywall: '/paywall',
  entrar: '/entrar',
  criarConta: '/criar-conta',
  recuperarAcesso: '/recuperar-acesso',

  // Cadastro da transportadora (sem tab bar)
  transportadora: '/cadastro',
  veiculos: '/cadastro/veiculos',
  motoristas: '/cadastro/motoristas',
  documentos: '/cadastro/documentos',

  // Tabs
  inicio: '/inicio',
  cargas: '/cargas',
  agenda: '/agenda',
  mensagens: '/mensagens',
  perfil: '/perfil',

  // Dentro da tab Perfil (mantém a tab bar)
  privacidade: '/perfil/privacidade',
  empresas: '/perfil/empresas',
  equipe: '/perfil/equipe',

  // Carga e viagem (sem tab bar)
  carga: (params: { id?: string } = {}): Href => ({ pathname: '/carga', params }),
  rotaColeta: (params: Carga = {}): Href => ({ pathname: '/viagem/rota', params }),
  chegadaProdutor: (params: Carga = {}): Href => ({ pathname: '/viagem/chegada-produtor', params }),
  conferirColeta: (params: Carga = {}): Href => ({ pathname: '/viagem/conferir', params }),
  pesoEvidencias: (params: Carga = {}): Href => ({ pathname: '/viagem/evidencias', params }),
  iniciarTransporte: (params: Carga = {}): Href => ({ pathname: '/viagem/iniciar', params }),
  emTransito: (params: Carga = {}): Href => ({ pathname: '/viagem/em-transito', params }),
  ocorrencia: (params: Carga = {}): Href => ({ pathname: '/viagem/ocorrencia', params }),
  chegadaComprador: (params: Carga = {}): Href => ({ pathname: '/viagem/chegada-comprador', params }),
  provaEntrega: (params: Carga = {}): Href => ({ pathname: '/viagem/prova-entrega', params }),

  // Pós-entrega e estados (sem tab bar)
  historico: '/historico',
  repasses: '/repasses',
  semConexao: '/sem-conexao',
} as const;

/** Catálogo das telas (mockup 2-logistica.jpeg) — usado no Mapa de telas (dev) e na documentação. */
export const telasLogistica: { numero: string; nome: string; href: Href }[] = [
  { numero: '00a', nome: 'Onboarding', href: rotasLogistica.onboarding },
  { numero: '00b', nome: 'Paywall', href: rotasLogistica.paywall },
  { numero: '01', nome: 'Entrar', href: rotasLogistica.entrar },
  { numero: '02', nome: 'Transportadora', href: rotasLogistica.transportadora },
  { numero: '03', nome: 'Veículos', href: rotasLogistica.veiculos },
  { numero: '04', nome: 'Motoristas', href: rotasLogistica.motoristas },
  { numero: '05', nome: 'Documentos', href: rotasLogistica.documentos },
  { numero: '06', nome: 'Início', href: rotasLogistica.inicio },
  { numero: '07', nome: 'Ofertas de carga', href: rotasLogistica.cargas },
  { numero: '08', nome: 'Detalhe da carga', href: rotasLogistica.carga() },
  { numero: '09', nome: 'Agenda', href: rotasLogistica.agenda },
  { numero: '10', nome: 'Rota da coleta', href: rotasLogistica.rotaColeta() },
  { numero: '11', nome: 'Chegada ao produtor', href: rotasLogistica.chegadaProdutor() },
  { numero: '12', nome: 'Conferir coleta', href: rotasLogistica.conferirColeta() },
  { numero: '13', nome: 'Peso e evidências', href: rotasLogistica.pesoEvidencias() },
  { numero: '14', nome: 'Iniciar transporte', href: rotasLogistica.iniciarTransporte() },
  { numero: '15', nome: 'Em trânsito', href: rotasLogistica.emTransito() },
  { numero: '16', nome: 'Registrar ocorrência', href: rotasLogistica.ocorrencia() },
  { numero: '17', nome: 'Chegada ao comprador', href: rotasLogistica.chegadaComprador() },
  { numero: '18', nome: 'Prova de entrega', href: rotasLogistica.provaEntrega() },
  { numero: '19', nome: 'Histórico', href: rotasLogistica.historico },
  { numero: '20', nome: 'Repasses', href: rotasLogistica.repasses },
  { numero: '21', nome: 'Mensagens', href: rotasLogistica.mensagens },
  { numero: '22', nome: 'Configurações', href: rotasLogistica.perfil },
  { numero: '23', nome: 'Privacidade', href: rotasLogistica.privacidade },
  { numero: '24', nome: 'Sem conexão', href: rotasLogistica.semConexao },
  { numero: '25', nome: 'Trocar empresa', href: rotasLogistica.empresas },
  { numero: '26', nome: 'Equipe e permissões', href: rotasLogistica.equipe },
];
