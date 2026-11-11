import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { AppText, Button, Logo, Screen, spacing, TextField, TextLink } from '@agrodireto/ui';
import { compradorAutorizado } from '@/lib/cadastroComprador';
import { supabase } from '@/lib/supabase';
import { rotasCliente } from '../../routes';

/** Acesso do comprador por e-mail e senha. */
export default function EntrarScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const valido = email.includes('@') && senha.length >= 6;

  async function entrar() {
    if (!supabase || entrando) return;
    setEntrando(true);
    setMensagem('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) throw error;
      router.replace(await compradorAutorizado() ? rotasCliente.ofertas : rotasCliente.empresa);
    } catch {
      setMensagem('Não foi possível entrar. Confira o e-mail e a senha.');
    } finally {
      setEntrando(false);
    }
  }

  return (
    <Screen>
      <View style={styles.logo}>
        <Logo subtitle="Cliente" />
      </View>

      <View style={styles.head}>
        <AppText variant="title">Entrar</AppText>
        <AppText variant="body" color="textSecondary">
          Acesse sua conta do AgroDireto.
        </AppText>
      </View>

      <TextField
        label="E-mail"
        icon={Mail}
        placeholder="compras@empresa.com.br"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Senha" icon={Lock} placeholder="Sua senha" secure value={senha} onChangeText={setSenha} />

      <View style={styles.actions}>
        {!supabase && <AppText>Ambiente de integração indisponível.</AppText>}
        {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
        <Button label="Entrar" disabled={!valido || !supabase || entrando} loading={entrando} onPress={() => void entrar()} />
        <TextLink label="Esqueci minha senha" onPress={() => router.push(rotasCliente.recuperarAcesso)} />
        <TextLink label="Criar conta" onPress={() => router.push(rotasCliente.criarConta)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  head: { gap: spacing.xs },
  actions: { gap: spacing.xs, paddingTop: spacing.sm },
});
