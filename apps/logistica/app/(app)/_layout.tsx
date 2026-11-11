import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { rotasLogistica } from '@/routes';

export default function Layout() {
  const [acesso, setAcesso] = useState<boolean | null>(supabase ? null : false);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setAcesso(!!sessao);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (acesso === null) return null;
  if (!acesso) return <Redirect href={rotasLogistica.entrar} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
