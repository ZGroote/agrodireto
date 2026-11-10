import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

export type Segment<K extends string> = { key: K; label: string; count?: number };

type Props<K extends string> = {
  segments: Segment<K>[];
  value: K;
  onChange: (key: K) => void;
};

/** Pills de alternância: "Disponíveis (1) | Histórico (1)". Ativo = verde cheio. */
export function SegmentedControl<K extends string>({ segments, value, onChange }: Props<K>) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {segments.map((s) => {
        const active = s.key === value;
        const text = s.count === undefined ? s.label : `${s.label} (${s.count})`;
        return (
          <Pressable
            key={s.key}
            onPress={() => onChange(s.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && styles.itemActive]}
          >
            <AppText variant="label" color={active ? 'textOnPrimary' : 'textSecondary'} numberOfLines={1}>
              {text}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm - 1,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.button - 3,
  },
  itemActive: { backgroundColor: colors.primary },
});
