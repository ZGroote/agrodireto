import type { FotoTipo } from '@agrodireto/ui';

/** Tipos do domínio do app Agricultor. Ficam depois que os dados de demonstração forem apagados. */

export type Agricultor = {
  nome: string;
  telefone: string;
  propriedade: string;
  cidade: string;
  uf: string;
  areaHa: number;
  culturas: string[];
  cadastroVerificado: boolean;
  avaliacao: number;
  avaliacoes: number;
  capacidadeKgSemana: number;
};

export type StatusEtapa = 'verificado' | 'pendente' | 'nao-enviado';

export type EtapaCadastro = {
  id: 'identificacao' | 'propriedade' | 'dados-bancarios';
  titulo: string;
  status: StatusEtapa;
};

export type StatusDocumento = 'verificada' | 'a-vencer' | 'vencida' | 'nao-enviado';

export type Documento = {
  id: string;
  titulo: string;
  tipoRotulo?: string;
  status: StatusDocumento;
  validade?: string;
};

export type StatusLote = 'rascunho' | 'publicado' | 'reservado' | 'encerrado';

export type Lote = {
  id: string;
  produto: string;
  origem: string;
  local: string;
  quantidadeKg: number;
  reservadoKg: number;
  precoKg: number;
  status: StatusLote;
  foto: FotoTipo;
};

export type Previsao = {
  cultura: string;
  origem: string;
  estimativaKg: number;
  faixaMinKg: number;
  faixaMaxKg: number;
  atualizadoPor: string;
  atualizadoEm: string;
  etapa: string;
  janela: string;
  foto: FotoTipo;
};

export type Cotacao = {
  id: string;
  loteId: string;
  comprador: string;
  quantidadeKg: number;
  precoKg: number;
  responderAte: string;
  versao: number;
};

export type Mensagem = {
  id: string;
  autor: string;
  hora: string;
  texto: string;
  minha: boolean;
};

export type Conversa = {
  id: string;
  titulo: string;
  subtitulo: string;
  mensagens: Mensagem[];
};

export type StatusPedido = 'em-preparacao' | 'aguardando-coleta' | 'em-transito' | 'concluido';

export type EventoPedido = { title: string; caption: string; status: 'done' | 'current' | 'todo' };

export type Pedido = {
  id: string;
  comprador: string;
  loteId: string;
  produto: string;
  quantidadeKg: number;
  embalagem: string;
  valor: number;
  status: StatusPedido;
  retirada: string;
  cargaId: string;
  motorista: string;
  eventos: EventoPedido[];
  /** Texto de apoio na lista ("Chegada prevista: 10h20", "Entrega em: 29/10/2026") */
  situacao: string;
};

export type Transporte = {
  cargaId: string;
  pedidoId: string;
  origem: string;
  destino: string;
  eta: string;
  atualizadoEm: string;
  eventos: EventoPedido[];
};

export type Financeiro = {
  aReceber: number;
  vendaPedido: string;
  venda: number;
  taxaPercentual: number;
  taxa: number;
  statusRepasse: string;
  previsaoRepasse: string;
  extrato: { id: string; titulo: string; legenda: string; valor: number }[];
};

export type Notificacao = {
  id: string;
  titulo: string;
  texto: string;
  quando: string;
  lida: boolean;
  tipo: 'cotacao' | 'pedido' | 'documento' | 'coleta';
};

export type Inspecao = {
  id: string;
  titulo: string;
  legenda: string;
  resultado: 'aprovada' | 'agendada';
};
