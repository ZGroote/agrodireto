import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Leaf, Package } from 'lucide-react-native';
import { AppText, brl, Button, Card, colors, ListRow, Screen, ScreenHeader, sizes, spacing, StatusPill, Timeline } from '@agrodireto/ui';
import { STATUS_PEDIDO } from '@/components/PedidoItem';
import { usePedido } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 18 · Pedidos (tab) — pedido em andamento e linha do tempo. Param: ?pedido= (padrão: o pedido ativo). */
export default function PedidosScreen() {
  const router = useRouter();
  const { pedido: id } = useLocalSearchParams<{ pedido?: string }>();
  const pedido = usePedido(id);
  const status = STATUS_PEDIDO[pedido.status];
  const concluido = pedido.status === 'concluido';

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title={pedido.id} titleAccessory={<StatusPill label={status.label} tone={status.tone} />} subtitle={pedido.comprador} />}
      footer={!concluido ? <Button label="Preparar lote" onPress={() => router.push(rotasAgricultor.prepararColeta({ pedido: pedido.id }))} /> : undefined}
    >
      <View style={styles.resumo}>
        <Linha icon={Package} texto={`${pedido.quantidadeKg} kg · ${pedido.embalagem}`} />
        <Linha icon={Leaf} texto={brl(pedido.valor)} />
      </View>

      <Timeline steps={pedido.eventos} />

      {/* Não está no mockup: a tab Pedidos mostra o pedido ativo; aqui se chega à lista completa. */}
      <Card>
        <ListRow title="Todos os pedidos" tone="primary" onPress={() => router.push(rotasAgricultor.todosPedidos)} />
      </Card>
    </Screen>
  );
}

function Linha({ icon: Icon, texto }: { icon: typeof Package; texto: string }) {
  return (
    <View style={styles.linha}>
      <Icon size={sizes.iconMd} color={colors.textSecondary} />
      <AppText variant="body">{texto}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  resumo: { gap: spacing.md },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
