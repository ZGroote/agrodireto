import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { consultarAcessoEquipe, supabase } from '@/lib/supabase';
import { rotasAdministrador } from '@/routes';

export default function Layout() {
  const [acesso, setAcesso] = useState<boolean | null>(supabase ? null : false);

  useEffect(() => {
    if (!supabase) return;
    let ativo = true;
    let tokenAtual: string | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function validar(token: string) {
      const autorizado = await consultarAcessoEquipe() === 'autorizado';
      if (ativo && token === tokenAtual) setAcesso(autorizado);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      const token = sessao?.access_token;
      if (timer) clearTimeout(timer);
      tokenAtual = token;
      if (!token) {
        setAcesso(false);
        return;
      }
      timer = setTimeout(() => {
        void validar(token).catch(() => {
          if (ativo && token === tokenAtual) setAcesso(false);
        });
      }, 0);
    });
    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  if (acesso === null) return null;
  if (!acesso) return <Redirect href={rotasAdministrador.entrar} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
