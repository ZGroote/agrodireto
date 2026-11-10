import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { AppText, Button, Logo, Screen, spacing, TextField, TextLink } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 01 · Entrar — login por código no telefone. Auth real entra na fase de autenticação. */
export default function EntrarScreen() {
  const router = useRouter();
  const [telefone, setTelefone] = useState('');

  return (
    <Screen>
      <View style={styles.logo}>
        <Logo subtitle="Logística" />
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
        <Button
          label="Receber código"
          disabled={telefone.trim().length < 10}
          onPress={() => router.replace(rotasLogistica.inicio)}
        />
        {/* Mockup não tem tela própria de "Criar conta": o cadastro começa pela 02 · Transportadora. */}
        <TextLink label="Criar conta" onPress={() => router.push(rotasLogistica.transportadora)} />
        {/* Recuperar acesso: tela não existe no mockup — entra na fase de autenticação */}
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
