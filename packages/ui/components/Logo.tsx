import { StyleSheet, View } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { AppText } from './AppText';

type Props = {
  /** Nome do perfil abaixo da marca: "Agricultor", "Logística"… */
  subtitle?: string;
  size?: 'md' | 'lg';
};

/**
 * PLACEHOLDER da marca AgroDireto (folha + texto).
 * Substituir pelo SVG/PNG oficial quando o asset for fornecido (ver DOC/assets-pendentes.md).
 */
export function Logo({ subtitle, size = 'md' }: Props) {
  const icon = size === 'lg' ? 40 : 30;
  return (
    <View style={styles.wrap} accessibilityLabel={`AgroDireto${subtitle ? ` ${subtitle}` : ''}`}>
      <Leaf size={icon} color={colors.primary} fill={colors.primary} />
      <AppText variant={size === 'lg' ? 'display' : 'title'} color="primary">
        AgroDireto
      </AppText>
      {subtitle ? (
        <AppText variant="body" color="textPrimary">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs },
});
