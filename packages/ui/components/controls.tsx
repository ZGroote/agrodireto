import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Check, Star } from 'lucide-react-native';
import { colors, radius, sizes, spacing } from '../theme';
import { AppText } from './AppText';

/* -------------------------------- Checkbox -------------------------------- */

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
};

/** Checkbox verde com check branco ("Li e concordo…", "Embalagem íntegra"). */
export function Checkbox({ checked, onChange, label, description }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={styles.checkRow}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Check size={14} color={colors.textOnPrimary} strokeWidth={3} /> : null}
      </View>
      {label ? (
        <View style={styles.flex}>
          <AppText variant="body">{label}</AppText>
          {description ? (
            <AppText variant="caption" color="textSecondary">
              {description}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

/* --------------------------------- Toggle --------------------------------- */

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
};

/** Switch com label à esquerda (Privacidade, Papéis e permissões). */
export function Toggle({ value, onChange, label, description }: ToggleProps) {
  return (
    <View style={styles.toggleRow}>
      {label ? (
        <View style={styles.flex}>
          <AppText variant="bodyStrong">{label}</AppText>
          {description ? (
            <AppText variant="caption" color="textSecondary">
              {description}
            </AppText>
          ) : null}
        </View>
      ) : null}
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.border}
        accessibilityLabel={label}
      />
    </View>
  );
}

/* ------------------------------- RatingStars ------------------------------ */

type RatingStarsProps = {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
};

/** Estrelas de avaliação (Cliente · Avaliar entrega). */
export function RatingStars({ value, onChange, max = 5 }: RatingStarsProps) {
  return (
    <View style={styles.stars} accessibilityRole="adjustable" accessibilityValue={{ min: 0, max, now: value }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value;
        return (
          <Pressable key={i} onPress={() => onChange?.(i + 1)} hitSlop={4} disabled={!onChange}>
            <Star
              size={sizes.iconMd}
              color={filled ? colors.warning : colors.border}
              fill={filled ? colors.warning : colors.transparent}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stars: { flexDirection: 'row', gap: spacing.xs },
});
