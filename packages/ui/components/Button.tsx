import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, sizes, spacing } from '../theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'danger' | 'outline';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
};

const palette: Record<Variant, { bg: string; fg: 'textOnPrimary' | 'primary' | 'textPrimary'; border: string }> = {
  primary: { bg: colors.primary, fg: 'textOnPrimary', border: colors.primary },
  danger: { bg: colors.danger, fg: 'textOnPrimary', border: colors.danger },
  outline: { bg: colors.surface, fg: 'primary', border: colors.border },
  secondary: { bg: colors.transparent, fg: 'textPrimary', border: colors.transparent },
};

/**
 * Botão do design system.
 * - primary: "Continuar" (verde cheio)
 * - secondary: "Cancelar" (só texto)
 * - danger: "Bloquear lote"
 * - outline: ação secundária com contorno
 * - disabled: fundo cinza claro, texto apagado
 */
export function Button({ label, onPress, variant = 'primary', disabled, loading, icon: Icon }: ButtonProps) {
  const p = palette[variant];
  const isDisabled = disabled || loading;
  const fgColor = isDisabled && variant !== 'secondary' ? 'disabledText' : p.fg;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: p.bg, borderColor: p.border },
        isDisabled && variant !== 'secondary' && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[fgColor]} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={sizes.iconMd} color={colors[fgColor]} /> : null}
          <AppText variant="button" color={fgColor}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.buttonHeight,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
