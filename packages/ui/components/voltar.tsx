import { createContext, useContext, type ReactNode } from 'react';
import { useRouter, type Href } from 'expo-router';

const VoltarContext = createContext<Href>('/');

/**
 * Define para onde o botão voltar leva quando não há histórico
 * (ex.: tela aberta direto por URL ou depois de um replace). Cada app informa o seu Início.
 */
export function VoltarProvider({ inicio, children }: { inicio: Href; children: ReactNode }) {
  return <VoltarContext.Provider value={inicio}>{children}</VoltarContext.Provider>;
}

/** Ação do botão voltar: volta no histórico; sem histórico, vai ao Início do app. */
export function useVoltar() {
  const router = useRouter();
  const inicio = useContext(VoltarContext);
  return () => (router.canGoBack() ? router.back() : router.replace(inicio));
}
