import { useState } from 'react';
import { Activity, CreditCard, MapPin } from 'lucide-react-native';
import { Button, Card, EMPTY, EmptyState, ListRow, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';

type Aba = 'eventos' | 'webhooks' | 'recursos';

/**
 * 22 · Integrações — status dos provedores e eventos/webhooks.
 * Item de evento: ícone de status, código EVT, data/hora e StatusPill (Falha = danger).
 */
export default function IntegracoesScreen() {
  const [aba, setAba] = useState<Aba>('eventos');
  // Status e eventos virão das Edge Functions (health check + log de webhooks).
  const itens: never[] = [];

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Integrações" />}
      // Reprocessamento real: Edge Function.
      footer={<Button label="Reprocessar evento" disabled={itens.length === 0} />}
    >
      <Card>
        <ListRow icon={CreditCard} title="Pagamentos" subtitle={EMPTY} chevron />
      </Card>
      <Card>
        <ListRow icon={MapPin} title="Mapas" subtitle={EMPTY} chevron />
      </Card>

      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'eventos', label: 'Eventos' },
          { key: 'webhooks', label: 'Webhooks' },
          { key: 'recursos', label: 'Recursos' },
        ]}
      />
      <EmptyState icon={Activity} title={aba === 'eventos' ? 'Nenhum evento' : aba === 'webhooks' ? 'Nenhum webhook' : 'Nenhum recurso'} />
    </Screen>
  );
}
