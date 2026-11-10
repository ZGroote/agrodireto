import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { lerRascunhoPropriedade, type RascunhoPropriedade } from '@/lib/rascunhoPropriedade';

type Leitura =
  | { estado: 'carregando' | 'erro' }
  | { estado: 'pronto'; rascunho: RascunhoPropriedade | null };

export function useRascunhoPropriedade() {
  const [leitura, setLeitura] = useState<Leitura>({ estado: 'carregando' });

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLeitura({ estado: 'carregando' });
    void lerRascunhoPropriedade().then(
      (rascunho) => { if (ativo) setLeitura({ estado: 'pronto', rascunho }); },
      () => { if (ativo) setLeitura({ estado: 'erro' }); },
    );
    return () => { ativo = false; };
  }, []));

  return leitura;
}
