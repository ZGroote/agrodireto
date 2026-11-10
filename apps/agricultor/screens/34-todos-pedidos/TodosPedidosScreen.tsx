import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import { EmptyState, Screen, ScreenHeader, SegmentedControl, VStack } from '@agrodireto/ui';
import { PedidoItem } from '@/components/PedidoItem';
import { usePedidos } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

type Aba = 'andamento' | 'concluidos';

/** 34 · Todos os pedidos (Pedidos) — em andamento e concluídos. Item abre o pedido na tela 18. */
export default function TodosPedidosScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('andamento');
  const pedidos = usePedidos();
  const andamento = pedidos.filter((p) => p.status !== 'concluido');
  const concluidos = pedidos.filter((p) => p.status === 'concluido');
  const lista = aba === 'andamento' ? andamento : concluidos;

  return (
    <Screen withTabBar header={<ScreenHeader title="Todos os pedidos" />}>
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'andamento', label: 'Em andamento', count: andamento.length },
          { key: 'concluidos', label: 'Concluídos', count: concluidos.length },
        ]}
      />
      {lista.length === 0 ? (
        <EmptyState icon={Package} title={aba === 'andamento' ? 'Nenhum pedido em andamento' : 'Nenhum pedido concluído'} />
      ) : (
        <VStack gap="md">
          {lista.map((p) => (
            <PedidoItem key={p.id} pedido={p} onPress={() => router.navigate(rotasAgricultor.pedido({ pedido: p.id }))} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}
