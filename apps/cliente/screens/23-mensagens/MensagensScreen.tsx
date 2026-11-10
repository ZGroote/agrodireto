import { useState } from 'react';
import { Headset, MessagesSquare } from 'lucide-react-native';
import { Card, EMPTY, EmptyState, ListRow, MessageInput, Screen, ScreenHeader, VStack } from '@agrodireto/ui';

/**
 * 23 · Mensagens (tab) — conversa do pedido com o produtor/transportadora e atalho de suporte.
 * Mensagens: ChatBubble (mine = enviada pelo comprador).
 */
export default function MensagensScreen() {
  const [texto, setTexto] = useState('');
  // Conversa virá do Supabase (Realtime), vinculada ao pedido em andamento.
  const mensagens: never[] = [];

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title={`PED ${EMPTY}`} subtitle={EMPTY} />}
      footer={
        <VStack gap="sm">
          {/* Envio e anexo reais entram na fase de dados. */}
          <MessageInput value={texto} onChangeText={setTexto} onSend={() => undefined} onAttach={() => undefined} />
          <Card>
            {/* Suporte: sem mockup — fase de atendimento. */}
            <ListRow icon={Headset} title="Suporte" chevron />
          </Card>
        </VStack>
      }
    >
      {mensagens.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="Nenhuma mensagem" description="A conversa do pedido em andamento aparece aqui." />
      ) : null}
    </Screen>
  );
}
