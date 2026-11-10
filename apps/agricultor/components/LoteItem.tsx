import { StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { AppText, Card, colors, Foto, kg, sizes, spacing, StatusPill, type StatusTone } from '@agrodireto/ui';
import type { Lote, StatusLote } from '@/types';

export const STATUS_LOTE: Record<StatusLote, { label: string; tone: StatusTone }> = {
  rascunho: { label: 'Rascunho', tone: 'neutral' },
  publicado: { label: 'Publicado', tone: 'success' },
  reservado: { label: 'Reservado', tone: 'info' },
  encerrado: { label: 'Encerrado', tone: 'neutral' },
};

/** Cartão de lote (10 · Meus lotes): foto, código, produto, quantidade e status. */
export function LoteItem({ lote, onPress }: { lote: Lote; onPress: () => void }) {
  const s = STATUS_LOTE[lote.status];
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <Foto tipo={lote.foto} size={sizes.thumb} />
        <View style={styles.body}>
          <AppText variant="bodyStrong">{lote.id}</AppText>
          <AppText variant="caption" color="textSecondary">
            {lote.produto}
          </AppText>
          <View style={styles.base}>
            <AppText variant="caption">{kg(lote.quantidadeKg)}</AppText>
            <StatusPill label={s.label} tone={s.tone} />
          </View>
        </View>
        <ChevronRight size={sizes.iconMd} color={colors.textSecondary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  body: { flex: 1, gap: spacing.xxs },
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
