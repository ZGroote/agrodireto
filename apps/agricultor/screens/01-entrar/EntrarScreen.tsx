import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { AppText, Button, Logo, Screen, ScreenHeader, spacing, TextField, TextLink } from '@agrodireto/ui';
import { useAgricultor } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 01 · Entrar — login por código no telefone. Auth real entra na fase de autenticação. */
export default function EntrarScreen() {
  const router = useRouter();
  const [telefone, setTelefone] = useState(useAgricultor().telefone);

  return (
    <Screen header={<ScreenHeader />}>
      <View style={styles.logo}>
        <Logo subtitle="Agricultor" />
      </View>

      <View style={styles.head}>
        <AppText variant="title">Entrar</AppText>
        <AppText variant="body" color="textSecondary">
          Receba um código no seu telefone para acessar sua conta.
        </AppText>
      </View>

      <TextField
        label="Telefone"
        icon={Phone}
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={setTelefone}
      />

      <View style={styles.actions}>
        <Button label="Receber código" disabled={telefone.trim().length < 10} onPress={() => router.push(rotasAgricultor.verificarCodigo)} />
        <TextLink label="Criar conta" onPress={() => router.push(rotasAgricultor.criarConta)} />
        <TextLink label="Recuperar acesso" onPress={() => router.push(rotasAgricultor.recuperarAcesso)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { paddingBottom: spacing.sm },
  head: { gap: spacing.xs },
  actions: { gap: spacing.xs, paddingTop: spacing.sm },
});
