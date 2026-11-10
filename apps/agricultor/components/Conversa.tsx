import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText, Card, ChatBubble, colors, IconBadge, spacing } from '@agrodireto/ui';
import type { Conversa, Mensagem } from '@/types';

/** Cabeçalho da conversa: ícone, código do pedido e interlocutor. */
export function ConversaCabecalho({ conversa, icon, onPress }: { conversa: Conversa; icon: LucideIcon; onPress?: () => void }) {
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <IconBadge icon={icon} />
        <View style={styles.flex}>
          <AppText variant="bodyStrong">{conversa.titulo}</AppText>
          <AppText variant="caption" color="textSecondary">
            {conversa.subtitulo}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

/** Balões da conversa, na ordem. */
export function ConversaMensagens({ mensagens }: { mensagens: Mensagem[] }) {
  return (
    <View style={styles.lista}>
      {mensagens.map((m) => (
        <ChatBubble key={m.id} author={m.autor} time={m.hora} text={m.texto} mine={m.minha} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  lista: { gap: spacing.md, borderColor: colors.transparent },
});
