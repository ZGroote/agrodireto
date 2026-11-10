import { useLocalSearchParams, useRouter } from 'expo-router';
import { ClipboardCheck, FileText, MapPinned, MessageSquare, Package } from 'lucide-react-native';
import { Card, Divider, EMPTY, KeyValueRow, ListRow, Screen, ScreenHeader, Timeline } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/** 17 · Detalhe do pedido — quantidade, linha do tempo e atalhos. Param: ?id= */
export default function DetalhePedidoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const pedido = id ?? `PED ${EMPTY}`;

  return (
    <Screen withTabBar header={<ScreenHeader title={`${pedido} · ${EMPTY}`} subtitle={`${EMPTY} · ${EMPTY}`} />}>
      <Card>
        <KeyValueRow icon={Package} label="Quantidade" value={EMPTY} />
      </Card>

      {/* Eventos virão do Supabase; sem pedido, todas as etapas ficam a fazer. */}
      <Timeline
        steps={[
          { title: 'Pagamento autorizado', caption: EMPTY, status: 'todo' },
          { title: 'Preparo do lote', caption: EMPTY, status: 'todo' },
          { title: 'Coleta', caption: EMPTY, status: 'todo' },
          { title: 'Em trânsito', caption: EMPTY, status: 'todo' },
        ]}
      />

      <Card>
        {/* Rastrear e Conferir não estão no mockup: únicos acessos às telas 18 e 19. */}
        <ListRow icon={MapPinned} title="Rastrear entrega" onPress={() => router.push(rotasCliente.rastrear({ pedido: id }))} />
        <Divider />
        <ListRow icon={ClipboardCheck} title="Conferir recebimento" onPress={() => router.push(rotasCliente.recebimento({ pedido: id }))} />
        <Divider />
        {/* Documentos do pedido (nota, comprovantes): sem mockup — fase de dados. */}
        <ListRow icon={FileText} title="Documentos" chevron />
        <Divider />
        <ListRow icon={MessageSquare} title="Mensagens" onPress={() => router.navigate(rotasCliente.mensagens)} />
      </Card>
    </Screen>
  );
}
