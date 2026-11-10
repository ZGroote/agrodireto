import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, Package, Store } from 'lucide-react-native';
import { Button, Card, EMPTY, ListRow, Screen, ScreenHeader } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 17 · Chegada ao comprador — confirma a chegada no destino. Param: ?carga= */
export default function ChegadaCompradorScreen() {
  const router = useRouter();
  const { carga } = useLocalSearchParams<{ carga?: string }>();

  return (
    <Screen
      header={<ScreenHeader title="Chegada ao comprador" />}
      footer={<Button label="Confirmar chegada" onPress={() => router.push(rotasLogistica.provaEntrega({ carga }))} />}
    >
      <Card>
        <ListRow icon={Store} title={EMPTY} subtitle={EMPTY} />
      </Card>
      <Card>
        <ListRow icon={CalendarDays} title="Entrega prevista" subtitle={EMPTY} />
      </Card>
      <Card>
        <ListRow icon={Package} title="Quantidade esperada" subtitle={EMPTY} />
      </Card>
    </Screen>
  );
}
