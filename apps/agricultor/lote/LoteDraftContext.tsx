import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRascunhoInicial } from '@/hooks/dados';

export type Unidade = 'kg' | 'cx' | 't';

/** Foto ou vídeo de evidência do lote. uri 'demo' = exemplo sem arquivo. */
export type EvidenciaDraft = { id: string; tipo: 'foto' | 'video'; uri: string; nome: string };

/** Rascunho do lote — compartilhado pelas telas 11 → 14. */
export type LoteDraft = {
  produto?: string;
  origem?: string;
  quantidade: string;
  unidade: Unidade;
  padrao?: string;
  calibre?: string;
  embalagem?: string;
  /** Fotos e vídeos de evidência (até 100 de cada) */
  evidencias: EvidenciaDraft[];
  precoUnitario: string;
  dataColheita: string;
  retirada: string;
  condicoes: string;
  validade: string;
};

export const UNIDADES: { label: string; value: Unidade }[] = [
  { label: 'kg', value: 'kg' },
  { label: 'cx', value: 'cx' },
  { label: 't', value: 't' },
];

type Ctx = { draft: LoteDraft; update: (parcial: Partial<LoteDraft>) => void; reset: () => void };

const LoteDraftContext = createContext<Ctx | null>(null);

export function LoteDraftProvider({ children }: { children: ReactNode }) {
  const inicial = useRascunhoInicial();
  const [draft, setDraft] = useState<LoteDraft>(inicial);
  const update = useCallback((parcial: Partial<LoteDraft>) => setDraft((d) => ({ ...d, ...parcial })), []);
  const reset = useCallback(() => setDraft(inicial), [inicial]);
  const valor = useMemo(() => ({ draft, update, reset }), [draft, update, reset]);
  return <LoteDraftContext.Provider value={valor}>{children}</LoteDraftContext.Provider>;
}

export function useLoteDraft(): Ctx {
  const ctx = useContext(LoteDraftContext);
  if (!ctx) throw new Error('useLoteDraft deve ser usado dentro de LoteDraftProvider');
  return ctx;
}
