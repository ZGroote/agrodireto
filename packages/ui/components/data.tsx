import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, radius, sizes, spacing } from '../theme';
import { AppText } from './AppText';

/* ------------------------------ CalendarMonth ----------------------------- */

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

type CalendarMonthProps = {
  /** Dias (1–31) do mês exibido que devem ficar destacados (ex.: janela de colheita) */
  highlighted?: number[];
  onMonthChange?: (year: number, month: number) => void;
};

/** Calendário mensal com navegação (Agricultor · Minha produção). Começa no mês atual. */
export function CalendarMonth({ highlighted = [], onMonthChange }: CalendarMonthProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1).getDay();
    const days = new Date(cursor.year, cursor.month + 1, 0).getDate();
    return [...Array<number | null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [cursor]);

  const move = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      const next = { year: d.getFullYear(), month: d.getMonth() };
      onMonthChange?.(next.year, next.month);
      return next;
    });
  };

  return (
    <View style={styles.cal}>
      <View style={styles.calHeader}>
        <Pressable onPress={() => move(-1)} hitSlop={10} accessibilityLabel="Mês anterior">
          <ChevronLeft size={sizes.iconMd} color={colors.textPrimary} />
        </Pressable>
        <AppText variant="bodyStrong">
          {MONTHS[cursor.month]} {cursor.year}
        </AppText>
        <Pressable onPress={() => move(1)} hitSlop={10} accessibilityLabel="Próximo mês">
          <ChevronRight size={sizes.iconMd} color={colors.textPrimary} />
        </Pressable>
      </View>
      <View style={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <View key={`w${i}`} style={styles.cell}>
            <AppText variant="caption" color="textSecondary">
              {w}
            </AppText>
          </View>
        ))}
        {cells.map((d, i) => {
          const on = d !== null && highlighted.includes(d);
          return (
            <View key={`d${i}`} style={styles.cell}>
              {d !== null ? (
                <View style={[styles.day, on && styles.dayOn]}>
                  <AppText variant={on ? 'bodyStrong' : 'body'} color={on ? 'primary' : 'textPrimary'}>
                    {d}
                  </AppText>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ----------------------------- ComparisonTable ---------------------------- */

type ComparisonTableProps = {
  columns: string[];
  rows: { label: string; values: string[] }[];
};

/** Tabela de comparação lado a lado (Cliente · Comparar ofertas). */
export function ComparisonTable({ columns, rows }: ComparisonTableProps) {
  return (
    <View style={styles.table}>
      <View style={styles.tRow}>
        <View style={styles.tLabel} />
        {columns.map((c) => (
          <View key={c} style={[styles.tCell, styles.tHead]}>
            <AppText variant="label" align="center">
              {c}
            </AppText>
          </View>
        ))}
      </View>
      {rows.map((r) => (
        <View key={r.label} style={[styles.tRow, styles.tRowBorder]}>
          <View style={styles.tLabel}>
            <AppText variant="caption" color="textSecondary">
              {r.label}
            </AppText>
          </View>
          {r.values.map((v, i) => (
            <View key={`${r.label}-${i}`} style={styles.tCell}>
              <AppText variant="bodyStrong" align="center">
                {v}
              </AppText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/* --------------------------------- StatTile ------------------------------- */

/** Indicador grande (GMV, Entregas no prazo). */
export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="display" color="primary">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  cal: { gap: spacing.sm },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: spacing.xs },
  day: { width: 34, height: 30, borderRadius: radius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.primarySoft },
  table: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  tRow: { flexDirection: 'row' },
  tRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  tLabel: { flex: 1.1, padding: spacing.sm, justifyContent: 'center' },
  tCell: { flex: 1, padding: spacing.sm, justifyContent: 'center' },
  tHead: { backgroundColor: colors.primarySoft },
  stat: { flex: 1, gap: spacing.xs },
});
