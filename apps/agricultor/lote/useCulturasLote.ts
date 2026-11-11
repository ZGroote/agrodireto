import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { lerCulturas, type Cultura } from '@/lib/culturas';

export function useCulturasLote() {
  const [culturas, setCulturas] = useState<Cultura[]>([]);
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
