import { useLocalSearchParams, useRouter } from 'expo-router';
import { History, MessagesSquare, Package, Tag } from 'lucide-react-native';
import { Button, Card, Divider, EMPTY, EmptyState, KeyValueRow, ListRow, Screen, ScreenHeader, VStack } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/**
 * 10 · Negociação — propostas trocadas com o produtor e termos atuais.
 * Propostas: ChatBubble (mine = enviada pelo comprador). Param: ?id=
 */
export default function NegociacaoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  // Propostas virão do Supabase (histórico imutável da cotação).
  const propostas: never[] = [];

  return (
    <Screen
      header={<ScreenHeader title="Negociação" />}
      footer={<Button label="Aceitar proposta" onPress={() => router.push(rotasCliente.resumoCompra)} />}
    >
      <Card>
        <ListRow title={`${id ?? `COT ${EMPTY}`} · ${EMPTY}`} subtitle={`Proposta ${EMPTY}`} />
      </Card>

      {propostas.length === 0 ? <EmptyState icon={MessagesSquare} title="Nenhuma proposta recebida" /> : null}

      <VStack gap="xxs">
        <KeyValueRow icon={Package} label="Quantidade" value={EMPTY} />
        <KeyValueRow icon={Tag} label="Preço" value={EMPTY} />
        <Divider />
        {/* Histórico completo da negociação: sem mockup — fase de dados. */}
        <ListRow icon={History} title="Histórico da negociação" chevron />
      </VStack>
    </Screen>
  );
}
