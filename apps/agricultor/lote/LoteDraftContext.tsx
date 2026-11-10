import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { AppText, Button, Screen, ScreenHeader } from '@agrodireto/ui';

export type Unidade = 'kg' | 'cx' | 't';

export type EvidenciaDraft = { id: string; tipo: 'foto' | 'video'; uri: string; nome: string };

export type LoteDraft = {
  produto?: string;
  origem?: string;
  quantidade: string;
  unidade: Unidade;
  padrao?: string;
  calibre?: string;
  embalagem?: string;
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

const chave = '@agrodireto/agricultor/lote-rascunho/v1';
const vazio: LoteDraft = {
  quantidade: '', unidade: 'kg', evidencias: [], precoUnitario: '',
  dataColheita: '', retirada: '', condicoes: '', validade: '',
};
const camposObrigatorios = ['quantidade', 'precoUnitario', 'dataColheita', 'retirada', 'condicoes', 'validade'] as const;
const camposOpcionais = ['produto', 'origem', 'padrao', 'calibre', 'embalagem'] as const;

export async function lerRascunhoLote(): Promise<LoteDraft | null> {
  const json = await AsyncStorage.getItem(chave);
  if (json === null) return null;

  const dados: unknown = JSON.parse(json);
  if (!dados || typeof dados !== 'object') throw new Error('Rascunho de lote inválido');

  const rascunho = { ...vazio };
  for (const campo of camposObrigatorios) {
    const valor: unknown = Reflect.get(dados, campo);
    if (typeof valor !== 'string') throw new Error('Rascunho de lote inválido');
    rascunho[campo] = valor;
  }
  for (const campo of camposOpcionais) {
    const valor: unknown = Reflect.get(dados, campo);
    if (valor === undefined) continue;
    if (typeof valor !== 'string') throw new Error('Rascunho de lote inválido');
    rascunho[campo] = valor;
  }
  const unidade: unknown = Reflect.get(dados, 'unidade');
  if (unidade !== 'kg' && unidade !== 'cx' && unidade !== 't') throw new Error('Unidade inválida');
  rascunho.unidade = unidade;
  return rascunho;
}

export function precoValido(valor: string) {
  const texto = valor.trim();
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(texto)) return false;
  const centavos = Math.round(Number(texto.replace(',', '.')) * 100);
  return Number.isSafeInteger(centavos) && centavos > 0;
}

type Ctx = {
  draft: LoteDraft;
  update: (parcial: Partial<LoteDraft>) => void;
  salvar: () => Promise<boolean>;
  descartar: () => Promise<boolean>;
  operacao: 'livre' | 'gravando' | 'salvo' | 'erro';
};

const LoteDraftContext = createContext<Ctx | null>(null);

export function LoteDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(vazio);
  const [leitura, setLeitura] = useState<'carregando' | 'pronto' | 'erro'>('carregando');
  const [tentativa, setTentativa] = useState(0);
  const [operacao, setOperacao] = useState<Ctx['operacao']>('livre');
  const ocupado = useRef(false);

  useEffect(() => {
    let ativo = true;
    void lerRascunhoLote().then((rascunho) => {
      if (!ativo) return;
      if (rascunho) setDraft(rascunho);
      setLeitura('pronto');
    }, () => {
      if (ativo) setLeitura('erro');
    });
    return () => { ativo = false; };
  }, [tentativa]);

  function update(parcial: Partial<LoteDraft>) {
    if (ocupado.current) return;
    setDraft((anterior) => ({ ...anterior, ...parcial }));
    setOperacao('livre');
  }

  async function gravar(descartar: boolean) {
    if (ocupado.current) return false;
    ocupado.current = true;
    setOperacao('gravando');
    try {
      if (descartar) {
        await AsyncStorage.removeItem(chave);
        setDraft(vazio);
      } else {
        // Arquivos selecionados podem estar em cache. Persista apenas os campos do lote.
        await AsyncStorage.setItem(chave, JSON.stringify({ ...draft, evidencias: [] }));
      }
      setOperacao(descartar ? 'livre' : 'salvo');
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
    <LoteDraftContext.Provider value={{ draft, update, salvar: () => gravar(false), descartar: () => gravar(true), operacao }}>
      {children}
    </LoteDraftContext.Provider>
  );
}

export function useLoteDraft(): Ctx {
  const ctx = useContext(LoteDraftContext);
  if (!ctx) throw new Error('useLoteDraft deve ser usado dentro de LoteDraftProvider');
  return ctx;
}
