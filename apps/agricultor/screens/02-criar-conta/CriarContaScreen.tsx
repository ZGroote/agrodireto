import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AppText, Button, Checkbox, Screen, ScreenHeader, TextField, TextLink } from '@agrodireto/ui';
import { supabase } from '@/lib/supabase';
import { rotasAgricultor } from '@/routes';

export default function CriarContaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceite, setAceite] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function criar() {
    if (!supabase || ocupado || !aceite) return;
    setOcupado(true);
    setMensagem('');
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
      if (error) throw error;
      if (data.session) router.replace(rotasAgricultor.cadastro);
      else setMensagem('Confira o e-mail de confirmação e depois entre com sua senha.');
    } catch {
      setMensagem('Não foi possível criar a conta. Confira os dados e tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Criar conta" />}>
      <TextField label="E-mail" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextField label="Senha (mínimo de 8 caracteres)" secure value={senha} onChangeText={setSenha} />
      <Checkbox checked={aceite} onChange={setAceite} label="Li e concordo com os termos e a política de privacidade" />
      <TextLink label="Termos de Uso" onPress={() => router.push(rotasAgricultor.termos)} />
      <TextLink label="Política de Privacidade" onPress={() => router.push(rotasAgricultor.politica)} />
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {!supabase && <AppText>Ambiente de integração indisponível.</AppText>}
      <Button label="Criar conta" loading={ocupado} disabled={!supabase || ocupado || !aceite || !email.includes('@') || senha.length < 8} onPress={() => void criar()} />
      <TextLink label="Já tenho conta" onPress={() => router.replace(rotasAgricultor.entrar)} />
    </Screen>
  );
}
