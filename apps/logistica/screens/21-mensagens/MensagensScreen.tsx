import { useState } from 'react';
import { MessagesSquare, Truck } from 'lucide-react-native';
import { Card, EMPTY, EmptyState, ListRow, MessageInput, Screen, ScreenHeader } from '@agrodireto/ui';

/**
 * 21 · Mensagens (tab) — conversa da carga em andamento com o comprador/operação.
 * Mensagens: ChatBubble (mine = enviada pela transportadora).
 */
export default function MensagensScreen() {
  const [texto, setTexto] = useState('');
  // Conversa virá do Supabase (Realtime), vinculada à carga em andamento.
  const mensagens: never[] = [];

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Mensagens" />}
      // Envio real entra na fase de dados; sem backend, não há para onde enviar.
      footer={<MessageInput value={texto} onChangeText={setTexto} onSend={() => undefined} />}
    >
      <Card>
        <ListRow icon={Truck} title={`${EMPTY} · ${EMPTY}`} />
      </Card>
      {mensagens.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="Nenhuma mensagem" description="A conversa da carga em andamento aparece aqui." />
      ) : null}
    </Screen>
  );
}
