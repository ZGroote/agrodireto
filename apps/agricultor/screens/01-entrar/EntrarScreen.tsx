import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AppText, Button, Logo, Screen, ScreenHeader, TextField, TextLink } from '@agrodireto/ui';
import { supabase } from '@/lib/supabase';
import { rotasAgricultor } from '@/routes';

export default function EntrarScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function entrar() {
    if (!supabase || ocupado) return;
    setOcupado(true);
    setMensagem('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) throw error;
      router.replace(rotasAgricultor.cadastro);
    } catch {
      setMensagem('Não foi possível entrar. Confira o e-mail, a senha e a conexão.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen header={<ScreenHeader />}>
      <Logo subtitle="Agricultor" />
      <AppText variant="title">Entrar</AppText>
      <TextField label="E-mail" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextField label="Senha" secure value={senha} onChangeText={setSenha} />
      {!supabase && <AppText>Ambiente de integração indisponível.</AppText>}
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      <Button label="Entrar" loading={ocupado} disabled={!supabase || ocupado || !email.includes('@') || !senha} onPress={() => void entrar()} />
      <TextLink label="Criar conta" onPress={() => router.push(rotasAgricultor.criarConta)} />
    </Screen>
  );
}
