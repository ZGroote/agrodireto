import type { TextStyle } from 'react-native';

/**
 * Tipografia — mockup indica SF Pro; usamos Inter (Google Fonts), a mais próxima.
 * Os nomes das famílias batem com as chaves carregadas em app/_layout.tsx.
 */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  /** Valores em destaque: "R$ 2.352", códigos de lote */
  display: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  /** Título da tela: "Criar conta", "Meus lotes" */
  title: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  /** Título de card / seção */
  heading: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22 },
  /** Texto de linha */
  body: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  /** Valores em linha: "2.000 kg" */
  bodyStrong: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 20 },
  /** Labels de input, botões de texto */
  label: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18 },
  /** Texto de botão */
  button: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 20 },
  /** Metadados: "05/11/2026 · 07h40" */
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  /** Tab bar e pills */
  micro: { fontFamily: fontFamily.medium, fontSize: 10, lineHeight: 13 },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
