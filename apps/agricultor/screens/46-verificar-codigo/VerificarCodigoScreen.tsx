import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Button, OTPInput, Screen, ScreenHeader, spacing, TextLink } from '@agrodireto/ui';
import { useAgricultor, useCodigoValidacao } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 46 · Verificar código — 6 dígitos enviados por SMS ao telefone informado na tela 01. */
export default function VerificarCodigoScreen() {
  const router = useRouter();
  const [codigo, setCodigo] = useState(useCodigoValidacao());
  const telefone = useAgricultor().telefone;

  return (
    <Screen
      header={<ScreenHeader title="Verificar código" subtitle={`Informe o código de 6 dígitos enviado para ${telefone}.`} />}
      footer={<Button label="Confirmar código" disabled={codigo.length < 6} onPress={() => router.replace(rotasAgricultor.inicio)} />}
    >
      <OTPInput length={6} value={codigo} onChange={setCodigo} />
      <View style={styles.resend}>
        <AppText variant="body" color="textSecondary" align="center">
          Não recebeu o código?
        </AppText>
        <TextLink label="Reenviar código" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  resend: { gap: spacing.xxs },
});
