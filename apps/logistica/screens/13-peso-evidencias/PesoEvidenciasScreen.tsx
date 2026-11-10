import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, MapPin, Package, Scale, User } from 'lucide-react-native';
import { AddMediaButton, AppText, Button, colors, EMPTY, KeyValueRow, Screen, ScreenHeader, SignaturePlaceholder, sizes, spacing, TextField } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 13 · Peso e evidências — prova da coleta (foto, responsável, assinatura). Param: ?carga= */
export default function PesoEvidenciasScreen() {
  const router = useRouter();
  const { carga } = useLocalSearchParams<{ carga?: string }>();
  const [coletadoPor, setColetadoPor] = useState('');

  return (
    <Screen
      header={<ScreenHeader title="Peso e evidências" />}
      footer={
        <Button
          label="Confirmar coleta"
          // Foto e assinatura ainda não são capturáveis (libs pendentes) — só o responsável é exigido por enquanto.
          disabled={coletadoPor.trim().length === 0}
          onPress={() => router.push(rotasLogistica.iniciarTransporte({ carga }))}
        />
      }
    >
      <View>
        <KeyValueRow icon={Scale} label="Peso total" value={EMPTY} />
        <KeyValueRow icon={Package} label="Quantidade" value={EMPTY} />
      </View>

      <View style={styles.block}>
        <AppText variant="label">Evidência da coleta</AppText>
        {/* Foto exige expo-image-picker (aprovação pendente). */}
        <AddMediaButton />
      </View>

      <TextField label="Coletado por" icon={User} placeholder="Nome de quem entregou" value={coletadoPor} onChangeText={setColetadoPor} autoCapitalize="words" />

      <View style={styles.block}>
        <AppText variant="label">Assinatura da coleta</AppText>
        {/* Assinatura exige lib de desenho (aprovação pendente). */}
        <SignaturePlaceholder />
      </View>

      <View style={styles.block}>
        <View style={styles.meta}>
          <Clock size={sizes.iconSm} color={colors.textSecondary} />
          <AppText variant="caption" color="textSecondary">
            Coleta realizada em {EMPTY}
          </AppText>
        </View>
        {/* Com expo-location: ícone de check verde + "Localização concedida nesta coleta". */}
        <View style={styles.meta}>
          <MapPin size={sizes.iconSm} color={colors.warning} />
          <AppText variant="caption" color="textSecondary">
            Localização não autorizada nesta coleta
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
