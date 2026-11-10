import type { ViewStyle } from 'react-native';
import { colors } from './colors';

/** Escala base 4. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  /** Padding lateral padrão de tela */
  screen: 16,
} as const;

export const radius = {
  sm: 6,
  input: 10,
  button: 10,
  media: 10,
  card: 12,
  pill: 999,
} as const;

export const borderWidth = {
  hairline: 1,
  focus: 1.5,
} as const;

/** Sombras quase imperceptíveis — os cards dependem mais da borda. */
export const shadows = {
  none: {},
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  floating: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
} as const satisfies Record<string, ViewStyle>;

export const sizes = {
  buttonHeight: 48,
  inputHeight: 44,
  rowMinHeight: 52,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  /** Ícone de destaque de estado (Coleta registrada, Sem conexão) */
  iconHero: 48,
  tabBarHeight: 60,
  headerHeight: 52,
  thumb: 56,
  avatar: 40,
} as const;
