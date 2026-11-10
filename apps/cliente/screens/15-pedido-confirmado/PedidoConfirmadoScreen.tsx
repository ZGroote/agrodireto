import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck, Truck } from 'lucide-react-native';
import { AppText, Button, Card, colors, EMPTY, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/**
 * 15 · Pedido confirmado — código, total e entrega.
 * Com dados: banner de status do pagamento (ex.: "Pagamento autorizado", tone success).
 */
export default function PedidoConfirmadoScreen() {
  const router = useRouter();

  const acompanhar = () => {
    // Fecha o fluxo de compra e abre o pedido na tab Pedidos.
    router.dismissAll();
    router.navigate(rotasCliente.pedido());
  };

  return (
    <Screen header={<ScreenHeader />} footer={<Button label="Acompanhar pedido" onPress={acompanhar} />}>
      <View style={styles.hero}>
        <CircleCheck size={sizes.iconHero} color={colors.primary} strokeWidth={1.75} />
        <AppText variant="display">PED {EMPTY}</AppText>
      </View>

      <Card tone="soft">
        <AppText variant="caption" color="textSecondary">
          Total
        </AppText>
        <AppText variant="display" color="primary">
          R$ {EMPTY}
        </AppText>
      </Card>

      <Card>
        <ListRow icon={Truck} title="Entrega" subtitle={EMPTY} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
});
