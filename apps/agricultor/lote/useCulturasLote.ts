import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { lerCulturas, type CulturaLocal } from '@/lib/culturasLocais';

export function useCulturasLote() {
  const [culturas, setCulturas] = useState<CulturaLocal[]>([]);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    void lerCulturas().then(
      (registros) => { if (ativo) setCulturas(registros); },
      () => { if (ativo) setCulturas([]); },
    );
    return () => { ativo = false; };
  }, []));
  return culturas;
}
