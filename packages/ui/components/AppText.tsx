import { Text, type TextProps } from 'react-native';
import { colors, typography, type ColorToken, type TypographyToken } from '../theme';

export type AppTextProps = TextProps & {
  variant?: TypographyToken;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

/** Texto do app. Sempre via tokens de tipografia e cor. */
export function AppText({
  variant = 'body',
  color = 'textPrimary',
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[typography[variant], { color: colors[color] }, align ? { textAlign: align } : null, style]}
    />
  );
}

/** Valor exibido quando ainda não há dado real. */
export const EMPTY = '—';
