import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, CircleDollarSign, Clock, Truck, type LucideIcon } from 'lucide-react-native';
import { AppText, Button, Card, colors, EMPTY, ListRow, MediaThumb, Screen, ScreenHeader, sizes, spacing, TextLink } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 08 · Detalhe da carga — produto, veículo, janelas e frete. Param: ?id= */
export default function DetalheCargaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <Screen
      header={<ScreenHeader title="Detalhe da carga" />}
      footer={
        <>
          <Button label="Aceitar carga" onPress={() => router.dismissTo(rotasLogistica.agenda)} />
          <TextLink label="Recusar" color="textPrimary" onPress={() => router.back()} />
        </>
      }
    >
      <Card>
        <ListRow icon={Truck} title={`${id ?? EMPTY} · PED ${EMPTY}`} subtitle={`Lote ${EMPTY}`} />
      </Card>

      <Card>
        <View style={styles.product}>
          <MediaThumb size={sizes.thumb + spacing.lg} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong">{EMPTY}</AppText>
            <AppText variant="caption" color="textSecondary">
              {EMPTY}
            </AppText>
            <AppText variant="caption">Total: {EMPTY}</AppText>
          </View>
        </View>
      </Card>

      <View style={styles.info}>
        <InfoLine icon={Truck} label="Veículo:" value={EMPTY} />
        <InfoLine icon={CalendarDays} label="Coleta:" value={EMPTY} />
        <InfoLine icon={Clock} label="Entrega:" value={EMPTY} />
        <InfoLine icon={CircleDollarSign} label="Frete:" value={`R$ ${EMPTY}`} strong />
      </View>
    </Screen>
  );
}

/** "Veículo: Baú · 1.000 kg" — rótulo e valor na mesma linha, como no mockup. */
function InfoLine({ icon: Icon, label, value, strong }: { icon: LucideIcon; label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.line}>
      <Icon size={sizes.iconMd} color={colors.textPrimary} />
      <AppText variant="body" color="textSecondary">
        {label}{' '}
        <AppText variant={strong ? 'bodyStrong' : 'body'}>{value}</AppText>
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  info: { gap: spacing.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1, gap: spacing.xxs },
  product: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
