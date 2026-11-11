/**
 * Mídia (foto, vídeo e drone) — contrato COMPARTILHADO pelos 4 apps.
 *
 * Fluxo entre os apps:
 *   Agricultor  envia a mídia (status "pendente")
 *   Administrador  valida ou rejeita (Documentos e mídias)
 *   Cliente  vê o que a visibilidade permite; a mídia ainda "pendente" aparece com a etiqueta
 *            "Não verificado" (como no mockup do Cliente). Só a "rejeitada" fica escondida
 *
 * A mesma regra (`podeVerMidia`) é usada para esconder a mídia na tela, e deve ser repetida no
 * servidor (política de acesso do Supabase), porque o app nunca é a barreira de segurança.
 */

import { classificarArquivo, listaFormatos, FORMATOS_IMAGEM, FORMATOS_VIDEO, type ArquivoParaClassificar } from './formatos.ts';

export type PapelApp = 'agricultor' | 'cliente' | 'logistica' | 'administrador';

export type TipoMidia = 'foto' | 'video' | 'drone';

export type StatusVerificacao = 'pendente' | 'verificada' | 'rejeitada';

/** Quem pode ver, além do dono e da equipe. */
export type VisibilidadeMidia = 'privado' | 'aprovados' | 'publico';

/** A que a mídia pertence. */
export type EscopoMidia = { tipo: 'propriedade' | 'lote' | 'cultura'; id: string };

export type Midia = {
  id: string;
  escopo: EscopoMidia;
  tipo: TipoMidia;
  /** Endereço do arquivo no Storage (ou do arquivo local, antes de enviar). 'demo' = ainda sem captura real */
  uri: string;
  /** Duração em segundos (vídeo e drone) */
  duracaoSeg?: number;
  /** Quando foi feita (ISO: "2026-11-03") */
  capturadaEm: string;
  /** Quem enviou */
  autor: string;
  /** Local APROXIMADO (cidade · UF). Nunca o endereço exato */
  local: string;
  status: StatusVerificacao;
  visibilidade: VisibilidadeMidia;
  /** Progresso do envio de 0 a 1; ausente quando o envio terminou */
  envio?: number;
  /** Motivo, quando o Administrador rejeita */
  motivoRejeicao?: string;
  /** Otimização automática (reduz o tamanho sem perder a resolução). Roda depois do envio */
  processamento: StatusProcessamento;
  /** Nome do arquivo escolhido pelo usuário */
  arquivoNome?: string;
  /** Tamanho do arquivo enviado, em bytes */
  tamanhoOriginalBytes?: number;
  /** Tamanho depois da otimização, em bytes */
  tamanhoFinalBytes?: number;
  /** Dia em que a mídia é apagada do banco e do Storage (ISO). Ausente = fica enquanto a conta existir */
  expiraEm?: string;
};

/**
 * pronta = arquivo sem metadados (comprimido ou, sem ganho, cópia sem perda) · mantida = o worker não conseguiu
 * tirar os metadados (vetorial, sem decodificador, acima do limite): o original pode ter GPS e nunca é publicado
 */
export type StatusProcessamento = 'aguardando' | 'otimizando' | 'pronta' | 'mantida' | 'falhou';

export const ROTULO_PROCESSAMENTO: Record<StatusProcessamento, string> = {
  aguardando: 'Aguardando otimização',
  otimizando: 'Otimizando',
  pronta: 'Otimizada',
  mantida: 'Original mantido',
  falhou: 'Falha na otimização',
};

export const ROTULO_VISIBILIDADE: Record<VisibilidadeMidia, string> = {
  privado: 'Privado',
  aprovados: 'Compradores aprovados',
  publico: 'Público na plataforma',
};

export const ROTULO_STATUS: Record<StatusVerificacao, string> = {
  pendente: 'Não verificado',
  verificada: 'Verificada',
  rejeitada: 'Rejeitada',
};

export const ROTULO_TIPO: Record<TipoMidia, string> = {
  foto: 'Foto',
  video: 'Vídeo',
  drone: 'Drone',
};

type Contexto = {
  /** Cliente: o comprador foi aprovado pela equipe? */
  compradorAprovado?: boolean;
  /** Agricultor: a mídia é da propriedade dele? */
  donoDaMidia?: boolean;
};

/** Regra de visibilidade da mídia, por app. */
export function podeVerMidia(midia: Midia, papel: PapelApp, ctx: Contexto = {}): boolean {
  switch (papel) {
    case 'administrador':
      return true;
    case 'agricultor':
      return ctx.donoDaMidia ?? true;
    case 'cliente': {
      if (midia.status === 'rejeitada') return false;
      if (midia.visibilidade === 'publico') return true;
      return midia.visibilidade === 'aprovados' && !!ctx.compradorAprovado;
    }
    default:
      // Logística não vê mídia da propriedade (ela tem as evidências de coleta e entrega).
      return false;
  }
}

/** Só a equipe valida ou rejeita mídia. */
export const podeValidarMidia = (papel: PapelApp): boolean => papel === 'administrador';

/** 28 → "0:28" · 125 → "2:05" */
export function formatarDuracao(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = Math.round(segundos % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** "2026-11-03" → "03/11" */
export function dataCurta(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

/* --------------------------------- Limites --------------------------------- */

/** Limite POR PRODUTO (lote, cultura ou propriedade): até 100 fotos e até 100 vídeos. */
export const LIMITES_MIDIA = { fotos: 100, videos: 100 } as const;

/** Quantas fotos e vídeos já existem (drone conta como vídeo). */
export function contarMidias(midias: readonly Pick<Midia, 'tipo'>[]): { fotos: number; videos: number } {
  const fotos = midias.filter((m) => m.tipo === 'foto').length;
  return { fotos, videos: midias.length - fotos };
}

export type ArquivoRecusado = { nome: string; motivo: string };

export type ResultadoValidacao = {
  aceitos: { arquivo: ArquivoParaClassificar; tipo: 'foto' | 'video' }[];
  recusados: ArquivoRecusado[];
};

/**
 * Valida os arquivos que o usuário escolheu: formato aceito e limite de 100 fotos e 100 vídeos por produto.
 * Os que passam devem ser enviados; os recusados são mostrados com o motivo.
 */
export function validarNovasMidias(existentes: readonly Pick<Midia, 'tipo'>[], novos: readonly ArquivoParaClassificar[]): ResultadoValidacao {
  const usados = contarMidias(existentes);
  const aceitos: ResultadoValidacao['aceitos'] = [];
  const recusados: ArquivoRecusado[] = [];

  for (const arquivo of novos) {
    const tipo = classificarArquivo(arquivo);
    if (!tipo) {
      recusados.push({ nome: arquivo.nome, motivo: 'Formato não aceito.' });
      continue;
    }
    if (tipo === 'foto' && usados.fotos >= LIMITES_MIDIA.fotos) {
      recusados.push({ nome: arquivo.nome, motivo: `Limite de ${LIMITES_MIDIA.fotos} fotos atingido.` });
      continue;
    }
    if (tipo === 'video' && usados.videos >= LIMITES_MIDIA.videos) {
      recusados.push({ nome: arquivo.nome, motivo: `Limite de ${LIMITES_MIDIA.videos} vídeos atingido.` });
      continue;
    }
    if (tipo === 'foto') usados.fotos += 1;
    else usados.videos += 1;
    aceitos.push({ arquivo, tipo });
  }
  return { aceitos, recusados };
}

/** Texto de ajuda dos formatos, para os campos de envio. */
export const AJUDA_FORMATOS = {
  fotos: `Fotos: ${listaFormatos(FORMATOS_IMAGEM)}.`,
  videos: `Vídeos: ${listaFormatos(FORMATOS_VIDEO)}.`,
};

/* -------------------------------- Retenção --------------------------------- */

/**
 * Depois que a produção termina, as mídias do lote e da cultura são apagadas (banco e Storage)
 * para não acumular arquivos sem uso. A carência abaixo dá tempo de resolver disputas e devoluções.
 * Valor provisório, a confirmar com o negócio.
 */
export const RETENCAO_DIAS_APOS_ENCERRAMENTO = 30;

/** A mídia da propriedade (perfil) fica; a do lote e a da cultura expiram com a produção. */
export const midiaExpiraComAProducao = (escopo: EscopoMidia): boolean => escopo.tipo !== 'propriedade';

/** "2026-11-12" (encerramento) → "2026-12-12" (dia em que as mídias são apagadas). */
export function calcularExpiracao(encerradoEmIso: string, dias: number = RETENCAO_DIAS_APOS_ENCERRAMENTO): string {
  const [a, m, d] = encerradoEmIso.split('-').map(Number);
  const data = new Date(a ?? 1970, (m ?? 1) - 1, (d ?? 1) + dias);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

/** Tamanho legível: 3,1 MB */
export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const unidades = ['KB', 'MB', 'GB'];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < unidades.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 ? 0 : 1).replace('.', ',')} ${unidades[i]}`;
}
