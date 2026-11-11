import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AppText, Button, Screen, ScreenHeader, TextField, TextLink } from '@agrodireto/ui';
import { supabase } from '@/lib/supabase';
import { rotasCliente } from '@/routes';

/** 25 · Criar conta do comprador. Termos do comprador aguardam o texto do jurídico. */
export default function CriarContaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function criar() {
    if (!supabase || ocupado) return;
    setOcupado(true);
    setMensagem('');
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
      if (error) throw error;
      if (data.session) router.replace(rotasCliente.empresa);
      else setMensagem('Confira o e-mail de confirmação e depois entre com sua senha.');
    } catch {
      setMensagem('Não foi possível criar a conta. Confira os dados e tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Criar conta" />}>
      <TextField label="E-mail de compras" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextField label="Senha (mínimo de 8 caracteres)" secure value={senha} onChangeText={setSenha} />
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {!supabase && <AppText>Ambiente de integração indisponível.</AppText>}
      <Button label="Criar conta" loading={ocupado} disabled={!supabase || ocupado || !email.includes('@') || senha.length < 8} onPress={() => void criar()} />
      <TextLink label="Já tenho conta" onPress={() => router.replace(rotasCliente.entrar)} />
    </Screen>
  );
}
