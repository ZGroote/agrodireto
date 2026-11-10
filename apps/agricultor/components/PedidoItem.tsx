import { StyleSheet, View } from 'react-native';
import { ChevronRight, Package } from 'lucide-react-native';
import { AppText, Card, colors, kg, sizes, spacing, StatusPill, type StatusTone } from '@agrodireto/ui';
import type { Pedido, StatusPedido } from '@/types';

export const STATUS_PEDIDO: Record<StatusPedido, { label: string; tone: StatusTone }> = {
  'em-preparacao': { label: 'Em preparação', tone: 'info' },
  'aguardando-coleta': { label: 'Aguardando coleta', tone: 'warning' },
  'em-transito': { label: 'Em trânsito', tone: 'info' },
  concluido: { label: 'Concluído', tone: 'success' },
};

/** Cartão de pedido (34 · Todos os pedidos). */
export function PedidoItem({ pedido, onPress }: { pedido: Pedido; onPress: () => void }) {
  const s = STATUS_PEDIDO[pedido.status];
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <Package size={sizes.iconLg} color={colors.textSecondary} />
        <View style={styles.flex}>
          <View style={styles.topo}>
            <AppText variant="bodyStrong">{pedido.id}</AppText>
            <StatusPill label={s.label} tone={s.tone} />
          </View>
          <AppText variant="caption" color="textSecondary">
            {pedido.loteId} · {kg(pedido.quantidadeKg)}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {pedido.situacao}
          </AppText>
        </View>
        <ChevronRight size={sizes.iconMd} color={colors.textSecondary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xxs },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
