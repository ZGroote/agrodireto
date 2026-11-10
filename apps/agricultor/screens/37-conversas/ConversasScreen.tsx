import { useRouter } from 'expo-router';
import { Building2, MessagesSquare } from 'lucide-react-native';
import { Card, EmptyState, IconBadge, ListRow, Screen, ScreenHeader, VStack } from '@agrodireto/ui';
import { useConversas } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 37 · Conversas (Mensagens) — uma conversa por pedido. Item abre a tela 23 naquela conversa. */
export default function ConversasScreen() {
  const router = useRouter();
  const conversas = useConversas();

  return (
    <Screen withTabBar header={<ScreenHeader title="Conversas" />}>
      {conversas.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="Nenhuma conversa" description="As conversas com compradores aparecem por pedido." />
      ) : (
        <VStack gap="sm">
          {conversas.map((c) => {
            const ultima = c.mensagens[c.mensagens.length - 1];
            return (
              <Card key={c.id}>
                <ListRow
                  leading={<IconBadge icon={Building2} />}
                  title={`${c.titulo} · ${c.subtitulo}`}
                  subtitle={ultima ? `${ultima.autor}: ${ultima.texto}` : undefined}
                  onPress={() => router.navigate(rotasAgricultor.abrirConversa({ conversa: c.id }))}
                />
              </Card>
            );
          })}
        </VStack>
      )}
    </Screen>
  );
}
