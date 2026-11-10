/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  DADOS FICTÍCIOS (DEMONSTRAÇÃO) — APAGAR AO INTEGRAR O SUPABASE          ║
 * ║  Valores tirados do mockup 1-agricultor.jpeg, para conferir o layout.    ║
 * ║  Para remover: apague esta pasta e troque o corpo de hooks/dados.ts      ║
 * ║  por consultas reais. As telas só leem dados por esses hooks.            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import type { Midia } from '@agrodireto/dominio';
import type {
  Agricultor,
  Conversa,
  Cotacao,
  Documento,
  EtapaCadastro,
  Financeiro,
  Inspecao,
  Lote,
  Notificacao,
  Pedido,
  Previsao,
  Transporte,
} from '@/types';

export const AGRICULTOR: Agricultor = {
  nome: 'João Silva',
  telefone: '(11) 98888-7777',
  propriedade: 'Sítio Boa Vista',
  cidade: 'Ibiúna',
  uf: 'SP',
  areaHa: 12,
  culturas: ['Tomate', 'Abobrinha'],
  cadastroVerificado: true,
  avaliacao: 4.8,
  avaliacoes: 126,
  capacidadeKgSemana: 10000,
};

export const ETAPAS_CADASTRO: EtapaCadastro[] = [
  { id: 'identificacao', titulo: 'Identificação', status: 'verificado' },
  { id: 'propriedade', titulo: 'Propriedade', status: 'verificado' },
  { id: 'dados-bancarios', titulo: 'Dados bancários', status: 'verificado' },
];

/** Etapa 4/4 do cadastro: documento solicitado pela equipe. */
export const DOCUMENTO_PENDENTE = { titulo: 'Documento pendente', descricao: 'Envie o documento solicitado' };

export const DOCUMENTOS: Documento[] = [
  { id: 'identificacao', titulo: 'Identificação', tipoRotulo: '(RG ou CNH)', status: 'verificada' },
  { id: 'fitossanitario', titulo: 'Certificado fitossanitário', status: 'a-vencer', validade: '15/11/2026' },
];

/** Mídias da propriedade. O vídeo de drone do mockup está em envio (72%). */
export const MIDIAS: Midia[] = [
  {
    id: 'md-001',
    escopo: { tipo: 'propriedade', id: 'sitio-boa-vista' },
    tipo: 'drone',
    uri: 'demo',
    duracaoSeg: 28,
    capturadaEm: '2026-11-03',
    autor: 'João Silva',
    local: 'Ibiúna',
    status: 'pendente',
    visibilidade: 'aprovados',
    envio: 0.72,
    processamento: 'aguardando',
    arquivoNome: 'drone-sitio-boa-vista.mp4',
  },
];

export const LOTES: Lote[] = [
  {
    id: 'AD-1042',
    produto: 'Tomate italiano',
    origem: 'Sítio Boa Vista',
    local: 'Sítio Boa Vista · Ibiúna · SP',
    quantidadeKg: 2000,
    reservadoKg: 500,
    precoKg: 4.8,
    status: 'publicado',
    foto: 'tomate',
  },
  {
    id: 'AD-1038',
    produto: 'Abobrinha',
    origem: 'Sítio Boa Vista',
    local: 'Sítio Boa Vista · Ibiúna · SP',
    quantidadeKg: 1000,
    reservadoKg: 0,
    precoKg: 3.9,
    status: 'encerrado',
    foto: 'abobrinha',
  },
];

export const PREVISAO: Previsao = {
  cultura: 'Tomate italiano',
  origem: 'Sítio Boa Vista · Ibiúna · SP',
  estimativaKg: 2000,
  faixaMinKg: 1800,
  faixaMaxKg: 2200,
  atualizadoPor: 'João Silva',
  atualizadoEm: '03/11/2026, 08h24',
  etapa: 'Pré-colheita',
  janela: '05 – 12 NOV',
  foto: 'tomate',
};

/** Dias do mês corrente destacados no calendário (como no mockup). */
export const DIAS_COLHEITA = [5, 6, 7, 11, 12];

export const COTACOES: Cotacao[] = [
  {
    id: 'COT-0318',
    loteId: 'AD-1042',
    comprador: 'Mercado Central',
    quantidadeKg: 500,
    precoKg: 4.8,
    responderAte: '04/11/2026, 17h',
    versao: 2,
  },
];

export const NEGOCIACAO = {
  retirada: '05/11, 07h – 08h',
  mensagens: [
    {
      id: 'n1',
      autor: 'Mercado Central',
      hora: '03/11, 14h20',
      texto: 'Podemos confirmar 500 kg do lote AD-1042 a R$ 4,80/kg, com coleta em 05/11 às 07h?',
      minha: false,
    },
    {
      id: 'n2',
      autor: 'João Silva',
      hora: '03/11, 15h02',
      texto: 'Confirmo a proposta v2. Podemos seguir com o pedido.',
      minha: true,
    },
  ],
};

export const PEDIDOS: Pedido[] = [
  {
    id: 'PED-2084',
    comprador: 'Mercado Central',
    loteId: 'AD-1042',
    produto: 'Tomate italiano',
    quantidadeKg: 500,
    embalagem: '25 caixas de 20 kg',
    valor: 2400,
    status: 'em-preparacao',
    retirada: '05/11, 07h – 08h',
    cargaId: 'LG-2048',
    motorista: 'Carlos Mendes',
    situacao: 'Coleta: 05/11, 07h – 08h',
    eventos: [
      { title: 'Pagamento autorizado', caption: '05/11, 06h12', status: 'done' },
      { title: 'Em preparação', caption: 'Separação e embalagem do lote.', status: 'done' },
      { title: 'Aguardando coleta', caption: '05/11, 07h – 08h', status: 'todo' },
    ],
  },
  {
    id: 'PED-1967',
    comprador: 'Mercado Central',
    loteId: 'AD-1038',
    produto: 'Abobrinha',
    quantidadeKg: 1000,
    embalagem: '50 caixas de 20 kg',
    valor: 3900,
    status: 'concluido',
    retirada: '29/10, 07h – 08h',
    cargaId: 'LG-1990',
    motorista: 'Carlos Mendes',
    situacao: 'Entrega em: 29/10/2026',
    eventos: [
      { title: 'Pagamento autorizado', caption: '28/10, 18h40', status: 'done' },
      { title: 'Em preparação', caption: 'Separação e embalagem do lote.', status: 'done' },
      { title: 'Entregue', caption: '29/10, 10h05', status: 'done' },
    ],
  },
];

export const TRANSPORTE: Transporte = {
  cargaId: 'LG-2048',
  pedidoId: 'PED-2084',
  origem: 'Ibiúna',
  destino: 'São Paulo',
  eta: '10h20',
  atualizadoEm: '09h41',
  eventos: [
    { title: 'Coleta realizada', caption: '05/11, 07h40', status: 'done' },
    { title: 'Em trânsito', caption: 'Saída da propriedade: 05/11, 07h45', status: 'done' },
    { title: 'Previsão de entrega', caption: '05/11, 10h20', status: 'todo' },
  ],
};

export const FINANCEIRO: Financeiro = {
  aReceber: 2352,
  vendaPedido: 'PED-2084',
  venda: 2400,
  taxaPercentual: 2,
  taxa: 48,
  statusRepasse: 'Aguardando recebimento',
  previsaoRepasse: '05/11/2026',
  extrato: [
    { id: 'x1', titulo: 'Venda (PED-2084)', legenda: '05/11/2026 · aguardando recebimento', valor: 2400 },
    { id: 'x2', titulo: 'Taxa (2,0%) · PED-2084', legenda: '05/11/2026', valor: -48 },
    { id: 'x3', titulo: 'Repasse PED-1967', legenda: '30/10/2026 · pago', valor: 3822 },
  ],
};

export const CONVERSAS: Conversa[] = [
  {
    id: 'PED-2084',
    titulo: 'PED-2084',
    subtitulo: 'Mercado Central',
    mensagens: [
      {
        id: 'm1',
        autor: 'Mercado Central',
        hora: '03/11, 16h10',
        texto: 'Agradecemos a confirmação do PED-2084. Seguimos com a coleta amanhã, 05/11, às 07h.',
        minha: false,
      },
      {
        id: 'm2',
        autor: 'João Silva',
        hora: '03/11, 16h22',
        texto: 'Perfeito, lote preparado e etiquetado conforme combinado.',
        minha: true,
      },
    ],
  },
  {
    id: 'PED-1967',
    titulo: 'PED-1967',
    subtitulo: 'Mercado Central',
    mensagens: [
      { id: 'm3', autor: 'Mercado Central', hora: '29/10, 10h12', texto: 'Recebemos a carga. Obrigado!', minha: false },
    ],
  },
];

export const SUPORTE: Conversa = {
  id: 'suporte',
  titulo: 'Suporte AgroDireto',
  subtitulo: 'Atendimento da equipe',
  mensagens: [
    { id: 's1', autor: 'Suporte AgroDireto', hora: '02/11, 10h05', texto: 'Olá, João! Como podemos ajudar?', minha: false },
    { id: 's2', autor: 'João Silva', hora: '02/11, 10h12', texto: 'Quero atualizar o certificado fitossanitário.', minha: true },
  ],
};

export const NOTIFICACOES: Notificacao[] = [
  { id: 'a1', tipo: 'cotacao', titulo: 'Nova cotação de Mercado Central', texto: 'COT-0318 · 500 kg do lote AD-1042.', quando: '03/11, 14h20', lida: false },
  { id: 'a2', tipo: 'pedido', titulo: 'Pagamento autorizado', texto: 'PED-2084 · R$ 2.400.', quando: '05/11, 06h12', lida: false },
  { id: 'a3', tipo: 'documento', titulo: 'Documento a vencer', texto: 'Certificado fitossanitário vale até 15/11/2026.', quando: '04/11, 09h00', lida: true },
  { id: 'a4', tipo: 'coleta', titulo: 'Coleta hoje às 07h', texto: 'PED-2084 · LG-2048 · motorista Carlos Mendes.', quando: '05/11, 05h30', lida: true },
];

export const INSPECOES: Inspecao[] = [
  { id: 'i1', titulo: 'Inspeção de origem', legenda: '03/11/2026 · Ana Oliveira', resultado: 'aprovada' },
  { id: 'i2', titulo: 'Inspeção na coleta', legenda: '05/11/2026 · 07h', resultado: 'agendada' },
];

/** Catálogos (virão do Admin · Catálogo e regiões). */
export const CATALOGO = {
  produtos: ['Tomate italiano', 'Abobrinha'],
  origens: ['Sítio Boa Vista'],
  padroes: ['Padrão A', 'Padrão B', 'Padrão C'],
  calibres: ['Pequeno (40 – 60 mm)', 'Médio (60 – 80 mm)', 'Grande (80 mm ou mais)'],
  embalagens: ['Caixas de 20 kg', 'Caixas de 10 kg', 'Sacos de 25 kg'],
  etapas: ['Plantio', 'Desenvolvimento', 'Previsão inicial', 'Pré-colheita', 'Pronto para colheita', 'Encerrado'],
};

/** Rascunho já preenchido, como nas telas 11 a 13 do mockup. */
export const RASCUNHO_LOTE = {
  produto: 'Tomate italiano',
  origem: 'Sítio Boa Vista',
  quantidade: '2.000',
  unidade: 'kg' as const,
  padrao: 'Padrão A',
  calibre: 'Médio (60 – 80 mm)',
  embalagem: 'Caixas de 20 kg',
  evidencias: [
    { id: 'ev-1', tipo: 'foto' as const, uri: 'demo', nome: 'tomates-colhidos.jpg' },
    { id: 'ev-2', tipo: 'foto' as const, uri: 'demo', nome: 'caixas-20kg.jpg' },
  ],
  precoUnitario: '4,80',
  dataColheita: '05/11/2026',
  retirada: '05/11 a 06/11/2026',
  condicoes: 'Tomate colhido na data, padronizado em caixas de 20 kg.',
  validade: '06/11/2026',
};

/** Código de 6 dígitos que o mockup mostra preenchido (Criar conta). */
export const CODIGO_VALIDACAO = '482913';

export const DADOS_BANCARIOS = {
  banco: 'Banco do Brasil',
  agencia: '1234',
  conta: '56789-0',
  tipo: 'Conta corrente',
  titular: 'João Silva',
  documento: '123.456.789-00',
  verificado: true,
};

export const AJUDA = [
  { id: 'h1', pergunta: 'Como publico um lote?', resposta: 'Na tela Início, toque em "Publicar lote" e siga os 3 passos: dados básicos, padrão e preço.' },
  { id: 'h2', pergunta: 'Quando recebo o repasse?', resposta: 'O repasse é liberado após a confirmação do recebimento pelo comprador.' },
  { id: 'h3', pergunta: 'Como atualizo um documento?', resposta: 'Em Documentos, abra o item e toque em "Enviar documento".' },
  { id: 'h4', pergunta: 'O que é a previsão de safra?', resposta: 'É a estimativa de colheita que compradores veem para planejar as compras.' },
];

/** Formulário "Cadastrar cultura" já preenchido. */
export const CULTURA_RASCUNHO = {
  cultura: 'Tomate italiano',
  variedade: 'Italiano',
  area: '6',
  plantio: '20/09/2026',
  etapa: 'Pré-colheita',
};

export const SINCRONIZACAO = { pendentes: 3, ultima: '07h12' };

/** Formulário "Registrar ocorrência" já preenchido. */
export const OCORRENCIA_RASCUNHO = {
  tipo: 'Motorista atrasado',
  gravidade: 'Média',
  descricao: 'O motorista chegou 40 minutos depois da janela de coleta.',
};
