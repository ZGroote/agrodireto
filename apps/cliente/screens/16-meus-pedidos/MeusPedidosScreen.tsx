import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import { Card, EmptyState, ListRow, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

type Aba = 'andamento' | 'concluidos';

/**
 * 16 · Meus pedidos (tab) — em andamento e concluídos.
 * Item: Card com Package, código PED, StatusPill (Em trânsito = info, Concluído = success),
 * oferta · quantidade, chegada prevista/entrega e chevron → rotasCliente.pedido({ id }).
 */
export default function MeusPedidosScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('andamento');
  // Lista virá do Supabase.
  const pedidos: never[] = [];

  return (
    <Screen withTabBar header={<ScreenHeader title="Meus pedidos" />}>
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'andamento', label: 'Em andamento', count: pedidos.length },
          { key: 'concluidos', label: 'Concluídos', count: 0 },
        ]}
      />
      <EmptyState icon={Package} title={aba === 'andamento' ? 'Nenhum pedido em andamento' : 'Nenhum pedido concluído'} />
      <Card>
        <ListRow title="Ver pedido" tone="primary" onPress={() => router.push(rotasCliente.pedido())} />
      </Card>
    </Screen>
  );
}
