import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Package, Truck, User } from 'lucide-react-native';
import { AppText, Button, Card, Divider, EMPTY, ListRow, Screen, ScreenHeader, spacing, Timeline } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

/** 12 · Pedido e carga — pedido, lote, carga, rota, motorista e cadeia de custódia. Param: ?id= */
export default function PedidoCargaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <Screen
      header={<ScreenHeader title="Pedido e carga" />}
      // "Abrir operação" abre um caso comercial sobre o pedido (14 · Disputa comercial).
      footer={<Button label="Abrir operação" onPress={() => router.push(rotasAdministrador.disputa({ id }))} />}
    >
      <Card>
        <ListRow icon={Package} title={id ?? `PED ${EMPTY}`} />
        <Divider />
        <ListRow icon={Package} title={`${EMPTY} · ${EMPTY}`} />
        <Divider />
        <ListRow icon={Truck} title={EMPTY} />
      </Card>
      <Card>
        <ListRow icon={MapPin} title={`${EMPTY} → ${EMPTY}`} />
        <Divider />
        <ListRow icon={User} title={`Motorista: ${EMPTY}`} />
      </Card>

      <View style={styles.section}>
        <AppText variant="heading">Cadeia de custódia</AppText>
        {/* Cada evento abre suas evidências (fotos, assinatura) na fase de dados. */}
        <Timeline
          steps={[
            { title: 'Coleta realizada', caption: EMPTY, status: 'todo' },
            { title: 'Em trânsito', caption: EMPTY, status: 'todo' },
            { title: 'Entrega', caption: EMPTY, status: 'todo' },
          ]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
});
