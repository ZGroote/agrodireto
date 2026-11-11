import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { AppText, Button, Screen, ScreenHeader, TextField, TextLink } from '@agrodireto/ui';
import { supabase } from '@/lib/supabase';
import { rotasLogistica } from '@/routes';

/** 01b · Criar conta — e-mail e senha; o cadastro da transportadora vem em seguida. */
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
      if (data.session) router.replace(rotasLogistica.transportadora);
      else setMensagem('Confira o e-mail de confirmação e depois entre com sua senha.');
    } catch {
      setMensagem('Não foi possível criar a conta. Confira os dados e tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Criar conta" />}>
      {/* Aceite de termos fica pendente: o app Logística ainda não tem as telas de termos e política. */}
      <TextField label="E-mail" icon={Mail} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextField label="Senha (mínimo de 8 caracteres)" icon={Lock} secure value={senha} onChangeText={setSenha} />
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {!supabase && <AppText>Ambiente de integração indisponível.</AppText>}
      <Button label="Criar conta" loading={ocupado} disabled={!supabase || ocupado || !email.includes('@') || senha.length < 8} onPress={() => void criar()} />
      <TextLink label="Já tenho conta" onPress={() => router.replace(rotasLogistica.entrar)} />
    </Screen>
  );
}
