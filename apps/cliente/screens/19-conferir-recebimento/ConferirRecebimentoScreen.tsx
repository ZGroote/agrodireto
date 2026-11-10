import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddMediaButton, AppText, Button, Card, Checkbox, colors, Divider, EMPTY, radius, Screen, ScreenHeader, spacing, TextLink } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/** 19 · Conferir recebimento — declarado x recebido, checklist e evidência. Param: ?pedido= */
export default function ConferirRecebimentoScreen() {
  const router = useRouter();
  const { pedido } = useLocalSearchParams<{ pedido?: string }>();
  const [embalagem, setEmbalagem] = useState(false);
  const [aparencia, setAparencia] = useState(false);
  const [semAvarias, setSemAvarias] = useState(false);

  return (
    <Screen
      header={<ScreenHeader title={pedido ?? `PED ${EMPTY}`} />}
      footer={
        <>
          <Button
            label="Confirmar recebimento"
            disabled={!embalagem || !aparencia || !semAvarias}
            onPress={() => router.replace(rotasCliente.avaliar({ pedido }))}
          />
          {/* Não está no mockup: único acesso à 20 · Registrar divergência. */}
          <TextLink label="Registrar divergência" color="danger" onPress={() => router.push(rotasCliente.divergencia({ pedido }))} />
        </>
      }
    >
      <View style={styles.compare}>
        <View style={[styles.box, styles.declared]}>
          <AppText variant="label" color="textSecondary">
            Declarado
          </AppText>
          <AppText variant="title">{EMPTY}</AppText>
        </View>
        <View style={[styles.box, styles.received]}>
          <AppText variant="label" color="textSecondary">
            Recebido
          </AppText>
          <AppText variant="title">{EMPTY}</AppText>
        </View>
      </View>

      <Card>
        <Checkbox checked={embalagem} onChange={setEmbalagem} label="Embalagem conforme" />
        <Divider />
        <Checkbox checked={aparencia} onChange={setAparencia} label="Aparência conforme" />
        <Divider />
        <Checkbox checked={semAvarias} onChange={setSemAvarias} label="Sem avarias" />
      </Card>

      <View style={styles.block}>
        <AppText variant="label">Evidência (opcional)</AppText>
        {/* Foto exige expo-image-picker (aprovação pendente). */}
        <AddMediaButton />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  compare: { flexDirection: 'row', gap: spacing.sm },
  box: { flex: 1, alignItems: 'center', gap: spacing.xs, padding: spacing.md, borderRadius: radius.card, borderWidth: 1 },
  declared: { backgroundColor: colors.surface, borderColor: colors.border },
  received: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  block: { gap: spacing.sm },
});
