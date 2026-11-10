import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheck, MapPin, Package, Sigma, Tag } from 'lucide-react-native';
import { AppText, Button, Card, colors, EMPTY, KeyValueRow, MediaThumb, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/** 12 · Resumo da compra — produto, origem, quantidade, preço, subtotal, padrão e embalagem. */
export default function ResumoCompraScreen() {
  const router = useRouter();

  return (
    <Screen header={<ScreenHeader title="Resumo da compra" />} footer={<Button label="Continuar" onPress={() => router.push(rotasCliente.entrega)} />}>
      <Card>
        <View style={styles.product}>
          <MediaThumb size={sizes.thumb} />
          <View style={styles.flex}>
            <AppText variant="heading">{EMPTY}</AppText>
            <AppText variant="bodyStrong">{EMPTY}</AppText>
          </View>
        </View>
      </Card>

      <View style={styles.origin}>
        <MapPin size={sizes.iconSm} color={colors.textSecondary} />
        <AppText variant="caption" color="textSecondary">
          {EMPTY}
        </AppText>
      </View>

      <Card>
        <KeyValueRow icon={Package} label="Quantidade" value={EMPTY} />
        <KeyValueRow icon={Tag} label="Preço" value={EMPTY} />
        <KeyValueRow icon={Sigma} label="Subtotal" value={`R$ ${EMPTY}`} />
      </Card>
      <Card>
        <KeyValueRow icon={BadgeCheck} label="Padrão" value={EMPTY} />
        <KeyValueRow icon={Package} label="Embalagem" value={EMPTY} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  product: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  origin: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: -spacing.sm },
});
