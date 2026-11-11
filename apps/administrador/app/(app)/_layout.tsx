import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { papelEquipe, type Papel } from '@/lib/equipe';
import { PapelEquipeContext } from '@/components/PapelEquipe';
import { rotasAdministrador } from '@/routes';

export default function Layout() {
  // undefined: carregando; null: sem acesso autorizado (papel_equipe nulo).
  const [papel, setPapel] = useState<Papel | null | undefined>(supabase ? undefined : null);

  useEffect(() => {
    if (!supabase) return;
    let ativo = true;
    let tokenAtual: string | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function validar(token: string) {
      const atual = await papelEquipe();
      if (ativo && token === tokenAtual) setPapel(atual);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      const token = sessao?.access_token;
      if (timer) clearTimeout(timer);
      tokenAtual = token;
      if (!token) {
        setPapel(null);
        return;
      }
      timer = setTimeout(() => {
        void validar(token).catch(() => {
          if (ativo && token === tokenAtual) setPapel(null);
        });
      }, 0);
    });
    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  if (papel === undefined) return null;
  if (!papel) return <Redirect href={rotasAdministrador.entrar} />;
  return (
    <PapelEquipeContext.Provider value={papel}>
      <Stack screenOptions={{ headerShown: false }} />
    </PapelEquipeContext.Provider>
  );
}
