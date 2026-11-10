import { useSyncExternalStore } from 'react';

/**
 * Foto de cada cultura (vira o ícone da cultura em Produção e Previsão de safra).
 * Guardada em memória enquanto não há Storage. Valor = URI da imagem, ou 'demo' quando a captura
 * real ainda não existe (expo-image-picker, aprovação pendente).
 */
const fotos = new Map<string, string>();
const ouvintes = new Set<() => void>();

export function definirFotoCultura(cultura: string, uri?: string) {
  if (uri) fotos.set(cultura, uri);
  else fotos.delete(cultura);
  ouvintes.forEach((o) => o());
}

export function useFotoCultura(cultura?: string): string | undefined {
  return useSyncExternalStore(
    (cb) => {
      ouvintes.add(cb);
      return () => ouvintes.delete(cb);
    },
    () => (cultura ? fotos.get(cultura) : undefined),
  );
}
