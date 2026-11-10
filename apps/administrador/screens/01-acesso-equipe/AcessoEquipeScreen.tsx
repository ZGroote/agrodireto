import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { AppText, Button, Logo, Screen, spacing, TextField, TextLink } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

/** 01 · Acesso da equipe — e-mail e senha; o segundo fator vem na 02. Auth real na fase de autenticação. */
export default function AcessoEquipeScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const valido = email.includes('@') && senha.length >= 6;

  return (
    <Screen>
      <View style={styles.logo}>
        <Logo subtitle="Administrador" />
      </View>

      <AppText variant="title">Acesso da equipe</AppText>

      <TextField
        label="E-mail"
        icon={Mail}
        placeholder="nome@agrodireto.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Senha" icon={Lock} placeholder="Sua senha" secure value={senha} onChangeText={setSenha} />

      <View style={styles.actions}>
        <Button label="Entrar" disabled={!valido} onPress={() => router.push(rotasAdministrador.verificacao)} />
        {/* Recuperar acesso e Acesso por convite: sem mockup — fase de autenticação. */}
        <TextLink label="Recuperar acesso" />
        <TextLink label="Acesso por convite" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  actions: { gap: spacing.xs, paddingTop: spacing.sm },
});
