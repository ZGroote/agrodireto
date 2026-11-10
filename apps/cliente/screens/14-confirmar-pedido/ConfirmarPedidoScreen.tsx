import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleDollarSign, CreditCard, FileText, Package, Truck, User } from 'lucide-react-native';
import { AppText, Button, Card, Checkbox, colors, EMPTY, KeyValueRow, ListRow, radius, Screen, ScreenHeader, spacing } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/** 14 · Confirmar pedido — valores, pagamento, aprovador e aceite dos termos. */
export default function ConfirmarPedidoScreen() {
  const router = useRouter();
  const [aceite, setAceite] = useState(false);

  return (
    <Screen
      header={<ScreenHeader title="Confirmar pedido" />}
      // Pedido real: Edge Function cria o pedido e autoriza o pagamento (nunca no client).
      footer={<Button label="Confirmar pedido" disabled={!aceite} onPress={() => router.replace(rotasCliente.pedidoConfirmado)} />}
    >
      <View>
        <KeyValueRow icon={Package} label="Produtos" value={`R$ ${EMPTY}`} />
        <KeyValueRow icon={Truck} label="Frete" value={`R$ ${EMPTY}`} />
        <KeyValueRow icon={FileText} label="Taxa" value={`R$ ${EMPTY}`} />
        <KeyValueRow icon={CircleDollarSign} label="Tributos" value={EMPTY} />
        <View style={styles.total}>
          <AppText variant="bodyStrong">TOTAL</AppText>
          <AppText variant="display" color="primary">
            R$ {EMPTY}
          </AppText>
        </View>
      </View>

      <Card>
        {/* Escolha do meio de pagamento: sem mockup — fase de pagamentos. */}
        <ListRow icon={CreditCard} title="Pagamento" subtitle={EMPTY} chevron />
      </Card>
      <Card>
        <ListRow icon={User} title="Responsável pela aprovação" subtitle={EMPTY} />
      </Card>

      <Checkbox checked={aceite} onChange={setAceite} label="Concordo com os termos da compra." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.input,
    backgroundColor: colors.primarySoft,
  },
});
