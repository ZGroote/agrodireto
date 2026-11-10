import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';
import { AppText, Button, Screen, ScreenHeader } from '@agrodireto/ui';
import { descartarRascunhoLote, lerRascunhosLote, loteVazio, salvarRascunhoLote, type EtapaLote, type LoteDraft, type Unidade } from './rascunhosLote';

export type { EvidenciaDraft, Unidade } from './rascunhosLote';

export const UNIDADES: { label: string; value: Unidade }[] = [
  { label: 'kg', value: 'kg' },
  { label: 'cx', value: 'cx' },
  { label: 't', value: 't' },
];

export function precoValido(valor: string) {
  const texto = valor.trim();
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(texto)) return false;
  const centavos = Math.round(Number(texto.replace(',', '.')) * 100);
  return Number.isSafeInteger(centavos) && centavos > 0;
}

type Ctx = {
  id: string;
  draft: LoteDraft;
  update: (parcial: Partial<LoteDraft>) => void;
  salvar: (etapa: EtapaLote) => Promise<boolean>;
  descartar: () => Promise<boolean>;
  operacao: 'livre' | 'gravando' | 'salvo' | 'erro';
};

const LoteDraftContext = createContext<Ctx | null>(null);

export function LoteDraftProvider({ id, children }: { id: string; children: ReactNode }) {
  const [draft, setDraft] = useState(loteVazio);
  const [leitura, setLeitura] = useState<'carregando' | 'pronto' | 'erro'>('carregando');
  const [tentativa, setTentativa] = useState(0);
  const [operacao, setOperacao] = useState<Ctx['operacao']>('livre');
  const ocupado = useRef(false);

  useEffect(() => {
    let ativo = true;
    void lerRascunhosLote().then((registros) => {
      if (!ativo) return;
      setDraft(registros.find((registro) => registro.id === id)?.campos ?? loteVazio);
      setLeitura('pronto');
    }, () => {
      if (ativo) setLeitura('erro');
    });
    return () => { ativo = false; };
  }, [id, tentativa]);

  function update(parcial: Partial<LoteDraft>) {
    if (ocupado.current) return;
    setDraft((anterior) => ({ ...anterior, ...parcial }));
    setOperacao('livre');
  }

  async function gravar(etapa: EtapaLote | null) {
    if (ocupado.current) return false;
    ocupado.current = true;
    setOperacao('gravando');
    try {
      if (etapa === null) {
        await descartarRascunhoLote(id);
        setDraft(loteVazio);
      } else {
        await salvarRascunhoLote(id, etapa, draft);
      }
      setOperacao(etapa === null ? 'livre' : 'salvo');
      return true;
    } catch {
      setOperacao('erro');
      return false;
    } finally {
      ocupado.current = false;
    }
  }

  if (leitura !== 'pronto') {
    return (
      <Screen header={<ScreenHeader title="Rascunho do lote" />}>
        {leitura === 'carregando' ? <ActivityIndicator /> : (
          <>
            <AppText>Não foi possível abrir o rascunho.</AppText>
            <Button label="Tentar novamente" onPress={() => {
              setLeitura('carregando');
              setTentativa((anterior) => anterior + 1);
            }} />
          </>
        )}
      </Screen>
    );
  }

  return (
    <LoteDraftContext.Provider value={{ id, draft, update, salvar: gravar, descartar: () => gravar(null), operacao }}>
      {children}
    </LoteDraftContext.Provider>
  );
}

export function useLoteDraft(): Ctx {
  const ctx = useContext(LoteDraftContext);
  if (!ctx) throw new Error('useLoteDraft deve ser usado dentro de LoteDraftProvider');
  return ctx;
}
