import { useEffect, type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Href } from 'expo-router';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { VoltarProvider } from '../components/voltar';

preventAutoHideAsync();

type Props = {
  /** Início do app: destino do botão voltar quando não há histórico */
  inicio: Href;
  children: ReactNode;
};

/** Raiz comum dos apps: fontes Inter, splash, safe area, status bar e fallback do voltar. */
export function AppProviders({ inicio, children }: Props) {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (loaded || error) hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <VoltarProvider inicio={inicio}>{children}</VoltarProvider>
    </SafeAreaProvider>
  );
}
