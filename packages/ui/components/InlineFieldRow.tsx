import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText } from './AppText';
import { colors, sizes, spacing } from '../theme';

type Props = {
  label: string;
  icon?: LucideIcon;
  /** Campo à direita (SelectField, TextField ou Toggle) — sem label próprio */
  children: ReactNode;
};

/**
 * Linha "ícone + rótulo à esquerda, campo à direita" do mockup do Cliente
 * (Cliente 04, 08, 20 · Administrador 10).
 */
export function InlineFieldRow({ label, icon: Icon, children }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.label}>
        {Icon ? <Icon size={sizes.iconMd} color={colors.textPrimary} /> : null}
        <AppText variant="label">{label}</AppText>
      </View>
      <View style={styles.field}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  field: { flex: 1.2 },
});
