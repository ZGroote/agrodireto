import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, MapPin, Package, Truck, User } from 'lucide-react-native';
import { AddMediaButton, AppText, Button, Card, colors, EMPTY, ListRow, Screen, ScreenHeader, SignaturePlaceholder, sizes, spacing, TextField } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 18 · Prova de entrega — recebedor, foto e assinatura. Param: ?carga= */
export default function ProvaEntregaScreen() {
  const router = useRouter();
  const { carga } = useLocalSearchParams<{ carga?: string }>();
  const [recebidoPor, setRecebidoPor] = useState('');

  const confirmar = () => {
    // Fim da viagem: fecha o fluxo 10 → 18 (volta às tabs) e abre o Histórico.
    router.dismissAll();
    router.push(rotasLogistica.historico);
  };

  return (
    <Screen
      header={<ScreenHeader title="Prova de entrega" />}
      footer={<Button label="Confirmar entrega" disabled={recebidoPor.trim().length === 0} onPress={confirmar} />}
    >
      <Card>
        <ListRow icon={Truck} title={`${carga ?? EMPTY} · PED ${EMPTY}`} />
      </Card>
      <Card>
        <ListRow icon={Package} title={EMPTY} subtitle={EMPTY} />
      </Card>

      <TextField label="Recebido por" icon={User} placeholder="Nome de quem recebeu" value={recebidoPor} onChangeText={setRecebidoPor} autoCapitalize="words" />

      <View style={styles.row}>
        <View style={styles.block}>
          <AppText variant="label">Evidência da entrega</AppText>
          {/* Foto exige expo-image-picker (aprovação pendente). */}
          <AddMediaButton size={110} />
        </View>
        <View style={[styles.block, styles.flex]}>
          <AppText variant="label">Assinatura</AppText>
          {/* Assinatura exige lib de desenho (aprovação pendente). */}
          <SignaturePlaceholder height={110} />
        </View>
      </View>

      <View style={styles.block}>
        <View style={styles.meta}>
          <Clock size={sizes.iconSm} color={colors.textSecondary} />
          <AppText variant="caption" color="textSecondary">
            Entrega realizada em {EMPTY}
          </AppText>
        </View>
        {/* Com expo-location: check verde + "Localização concedida nesta entrega". */}
        <View style={styles.meta}>
          <MapPin size={sizes.iconSm} color={colors.warning} />
          <AppText variant="caption" color="textSecondary">
            Localização não autorizada nesta entrega
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  block: { gap: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
