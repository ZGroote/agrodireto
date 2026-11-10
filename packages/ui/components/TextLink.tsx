import { Pressable, StyleSheet } from 'react-native';
import { spacing, type ColorToken } from '../theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress?: () => void;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

/** Link de texto: "Criar conta", "Recuperar acesso", "Ver previsão". */
export function TextLink({ label, onPress, color = 'primary', align = 'center' }: Props) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <AppText variant="label" color={color} align={align}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: spacing.sm },
  pressed: { opacity: 0.6 },
});
