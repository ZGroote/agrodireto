/**
 * Acesso a dados do app Agricultor. TODAS as telas leem dados por aqui.
 *
 * HOJE: devolvem os dados fictícios de `dados-demo/` (para acompanhar o layout dos mockups).
 * DEPOIS: troque cada corpo por consultas ao Supabase e apague a pasta `dados-demo/`.
 * Os tipos (`@/types`) não mudam.
 */
import {
  AGRICULTOR,
  AJUDA,
  CATALOGO,
  CODIGO_VALIDACAO,
  CULTURA_RASCUNHO,
  DADOS_BANCARIOS,
  CONVERSAS,
  COTACOES,
  DIAS_COLHEITA,
  DOCUMENTO_PENDENTE,
  DOCUMENTOS,
  ETAPAS_CADASTRO,
  FINANCEIRO,
  OCORRENCIA_RASCUNHO,
  SINCRONIZACAO,
  INSPECOES,
  LOTES,
  MIDIAS,
  NEGOCIACAO,
  NOTIFICACOES,
  PEDIDOS,
  PREVISAO,
  RASCUNHO_LOTE,
  SUPORTE,
  TRANSPORTE,
} from '@/dados-demo';

export const useAgricultor = () => AGRICULTOR;
export const useEtapasCadastro = () => ETAPAS_CADASTRO;
export const useDocumentoPendente = () => DOCUMENTO_PENDENTE;
export const useDocumentos = () => DOCUMENTOS;
export const useMidias = () => MIDIAS;
export const useMidia = () => MIDIAS[0];
export const useLotes = () => LOTES;
export const useLote = (id?: string) => LOTES.find((l) => l.id === id) ?? LOTES[0];
export const usePrevisao = () => PREVISAO;
export const useDiasColheita = () => DIAS_COLHEITA;
export const useCotacoes = () => COTACOES;
export const useCotacao = (id?: string) => COTACOES.find((c) => c.id === id) ?? COTACOES[0];
export const useNegociacao = () => NEGOCIACAO;
export const usePedidos = () => PEDIDOS;
export const usePedido = (id?: string) => PEDIDOS.find((p) => p.id === id) ?? PEDIDOS[0];
export const useTransporte = () => TRANSPORTE;
export const useFinanceiro = () => FINANCEIRO;
export const useConversas = () => CONVERSAS;
export const useSuporte = () => SUPORTE;
export const useNotificacoes = () => NOTIFICACOES;
export const useInspecoes = () => INSPECOES;
export const useCatalogo = () => CATALOGO;
export const useRascunhoInicial = () => RASCUNHO_LOTE;
export const useCodigoValidacao = () => CODIGO_VALIDACAO;
export const useDadosBancarios = () => DADOS_BANCARIOS;
export const useAjuda = () => AJUDA;
export const useCulturaRascunho = () => CULTURA_RASCUNHO;
export const useSincronizacao = () => SINCRONIZACAO;
export const useOcorrenciaRascunho = () => OCORRENCIA_RASCUNHO;
