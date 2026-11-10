import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { AppText, Button, Logo, Screen, spacing, TextField, TextLink } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/** 01 · Entrar — login por e-mail e senha (empresa compradora). Auth real entra na fase de autenticação. */
export default function EntrarScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const valido = email.includes('@') && senha.length >= 6;

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
        <Button label="Entrar" disabled={!valido} onPress={() => router.replace(rotasCliente.inicio)} />
        {/* Criar conta e Recuperar acesso: sem mockup do Cliente — entram na fase de autenticação. */}
        <TextLink label="Criar conta" />
        <TextLink label="Recuperar acesso" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  head: { gap: spacing.xs },
  actions: { gap: spacing.xs, paddingTop: spacing.sm },
});
