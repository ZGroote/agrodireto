import { colors, fontFamily, sizes } from '../../theme';

/**
 * Estilo da tab bar inferior, igual em todos os perfis (mockups):
 * fundo branco, borda fina no topo, ativo verde, inativo cinza, rótulo 10px.
 */
export const tabBarScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textSecondary,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    minHeight: sizes.tabBarHeight,
  },
  tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 10 },
  sceneStyle: { backgroundColor: colors.background },
} as const;
