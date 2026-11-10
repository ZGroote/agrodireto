/**
 * Paleta AgroDireto — extraída das amostras no rodapé dos mockups (mockups/*.jpeg).
 * Toda cor usada no app deve vir daqui. Não hardcode cor em tela.
 */
export const colors = {
  // Marca
  primary: '#245943',
  primaryPressed: '#1C4735',
  primarySoft: '#EBF0E2',
  primarySoftAlt: '#E8F0E2',

  // Neutros
  background: '#F7F8F4',
  surface: '#FFFFFF',
  textPrimary: '#172C22',
  textSecondary: '#667368',
  textOnPrimary: '#FFFFFF',
  border: '#E2E7DF',
  disabled: '#E2E7DF',
  disabledText: '#8A958C',
  placeholder: '#EEF1EB',

  // Estados
  success: '#245943',
  successSoft: '#EBF0E2',
  warning: '#A66825',
  warningSoft: '#FBF1E4',
  info: '#386E93',
  infoSoft: '#E6EEF4',
  danger: '#B64242',
  dangerSoft: '#F8E8E8',

  // Utilitários
  overlay: 'rgba(23, 44, 34, 0.45)',
  shadow: '#172C22',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
