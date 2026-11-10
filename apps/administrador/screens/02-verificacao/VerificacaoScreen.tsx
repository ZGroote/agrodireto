import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Button, Divider, OTPInput, Screen, ScreenHeader, spacing, TextLink } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

/** 02 · Verificação de segurança — código de 6 dígitos enviado por e-mail (MFA). */
export default function VerificacaoScreen() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');

  return (
    <Screen header={<ScreenHeader title="Verificação de segurança" subtitle="Informe o código de 6 dígitos enviado para seu e-mail." />}>
      <OTPInput length={6} value={codigo} onChange={setCodigo} />

      {/* Sem auth: o código não é validado no servidor ainda — 6 dígitos liberam o acesso. */}
      <Button label="Confirmar código" disabled={codigo.length < 6} onPress={() => router.replace(rotasAdministrador.inicio)} />

      <Divider />
      <View style={styles.resend}>
        <AppText variant="body" color="textSecondary" align="center">
          Não recebeu o código?
        </AppText>
        {/* Reenvio por e-mail: fase de autenticação. */}
        <TextLink label="Recuperar por e-mail" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  resend: { gap: spacing.xxs },
});
