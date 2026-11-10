import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, Package } from 'lucide-react-native';
import { AppText, Button, Card, ChecklistRow, EMPTY, KeyValueRow, MediaThumb, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

/** 07 · Revisão de lotes — dados do lote e completude (cadastro, evidências, inspeção). Param: ?id= */
export default function RevisaoLotesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <Screen
      header={<ScreenHeader title="Revisão de lotes" />}
      footer={<Button label="Revisar lote" onPress={() => router.push(rotasAdministrador.rastreabilidade({ id }))} />}
    >
      <Card>
        <View style={styles.product}>
          <MediaThumb size={sizes.thumb + spacing.lg} />
          <View style={styles.flex}>
            <AppText variant="heading">{id ?? EMPTY}</AppText>
            <AppText variant="bodyStrong">{EMPTY}</AppText>
            <AppText variant="caption" color="textSecondary">
              {EMPTY}
            </AppText>
          </View>
        </View>
      </Card>

      <Card>
        <KeyValueRow icon={Package} label="Quantidade" value={EMPTY} />
        <KeyValueRow icon={CalendarDays} label="Janela de coleta" value={EMPTY} />
      </Card>

      {/* Completude calculada no servidor; sem lote, nada está concluído. */}
      <View style={styles.section}>
        <AppText variant="heading">Completude do lote</AppText>
        <ChecklistRow title="Cadastro do lote" status="todo" />
        <ChecklistRow title="Evidências de origem" status="todo" />
        <ChecklistRow title="Inspeção agendada" status="todo" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  product: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  section: { gap: spacing.xs },
});
