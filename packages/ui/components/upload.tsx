import { Pressable, StyleSheet, View } from 'react-native';
import { Plus, type LucideIcon } from 'lucide-react-native';
import { colors, radius, sizes, spacing } from '../theme';
import { AppText } from './AppText';

type Props = {
  icon: LucideIcon;
  label: string;
  descricao?: string;
  onPress: () => void;
};

/** Campo de envio de arquivo (foto ou vídeo): cartão tracejado com ícone, rótulo e dica de formato. */
export function CampoUpload({ icon: Icon, label, descricao, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Adicionar ${label.toLowerCase()}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.icone}>
        <Icon size={sizes.iconLg} color={colors.primary} />
        <View style={styles.mais}>
          <Plus size={10} color={colors.textOnPrimary} strokeWidth={3} />
        </View>
      </View>
      <AppText variant="bodyStrong" align="center">
        {label}
      </AppText>
      {descricao ? (
        <AppText variant="caption" color="textSecondary" align="center">
          {descricao}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  icone: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  mais: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
