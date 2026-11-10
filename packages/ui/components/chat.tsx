import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Paperclip, Send } from 'lucide-react-native';
import { colors, radius, sizes, spacing, typography } from '../theme';
import { AppText } from './AppText';

type ChatBubbleProps = {
  author: string;
  time: string;
  text: string;
  mine?: boolean;
};

/** Balão de mensagem. Minhas mensagens em verde-claro, alinhadas à direita. */
export function ChatBubble({ author, time, text, mine }: ChatBubbleProps) {
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      <View style={styles.meta}>
        <AppText variant="label">{author}</AppText>
        <AppText variant="caption" color="textSecondary">
          {' · '}
          {time}
        </AppText>
      </View>
      <AppText variant="body">{text}</AppText>
    </View>
  );
}

type MessageInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach?: () => void;
};

/** Campo "Digite uma mensagem…" com anexo e enviar. */
export function MessageInput({ value, onChangeText, onSend, onAttach }: MessageInputProps) {
  const canSend = value.trim().length > 0;
  return (
    <View style={styles.inputRow}>
      <Pressable onPress={onAttach} hitSlop={8} accessibilityLabel="Anexar">
        <Paperclip size={sizes.iconMd} color={colors.textSecondary} />
      </Pressable>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Digite uma mensagem…"
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="Mensagem"
      />
      <Pressable onPress={onSend} disabled={!canSend} hitSlop={8} accessibilityLabel="Enviar">
        <Send size={sizes.iconMd} color={canSend ? colors.primary : colors.disabledText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bubble: { padding: spacing.md, borderRadius: radius.card, gap: spacing.xs, maxWidth: '88%' },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primarySoft },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.placeholder },
  meta: { flexDirection: 'row', alignItems: 'center' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: sizes.inputHeight,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: spacing.sm },
});
