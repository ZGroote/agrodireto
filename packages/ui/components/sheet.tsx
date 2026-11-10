import { Modal, Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, sizes, spacing } from '../theme';
import type { ColorToken } from '../theme';
import { AppText } from './AppText';

export type AcaoSheet = { label: string; icon?: LucideIcon; tone?: ColorToken; onPress: () => void };

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  acoes: AcaoSheet[];
};

/** Folha de ações na base da tela (menu "...", opções). Fecha ao tocar fora ou em Cancelar. */
export function ActionSheet({ visible, onClose, title, acoes }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar" />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        {title ? (
          <AppText variant="heading" style={styles.title}>
            {title}
          </AppText>
        ) : null}
        {acoes.map((a) => {
          const Icon = a.icon;
          const cor: ColorToken = a.tone ?? 'textPrimary';
          return (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                a.onPress();
              }}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
            >
              {Icon ? <Icon size={sizes.iconMd} color={colors[cor === 'textPrimary' ? 'textSecondary' : cor]} /> : null}
              <AppText variant="bodyStrong" color={cor}>
                {a.label}
              </AppText>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
          <AppText variant="bodyStrong" color="textSecondary" align="center">
            Cancelar
          </AppText>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card + 4,
    borderTopRightRadius: radius.card + 4,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.sm },
  title: { paddingVertical: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: sizes.rowMinHeight - 8 },
  cancel: { marginTop: spacing.sm, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  pressed: { opacity: 0.6 },
});
