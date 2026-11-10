import { useState } from 'react';
import { Landmark } from 'lucide-react-native';
import { Button, EmptyState, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';

type Aba = 'pagamentos' | 'repasses';

/**
 * 15 · Conciliação — pagamentos dos compradores e repasses aos agricultores.
 * Item: Card com PED, Total do pedido, Status do pagamento (VerifiedBadge), PSP;
 * e card de Repasse ao agricultor com AlertBanner de status (ex.: "Aguardando recebimento").
 */
export default function ConciliacaoScreen() {
  const [aba, setAba] = useState<Aba>('pagamentos');
  // Pagamentos e repasses virão do Supabase (webhooks do PSP).
  const itens: never[] = [];

  return (
    <Screen
      header={<ScreenHeader title="Conciliação" />}
      // Conciliação real: Edge Function (nunca no client).
      footer={<Button label={aba === 'pagamentos' ? 'Conciliar pagamento' : 'Conciliar repasse'} disabled={itens.length === 0} />}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'pagamentos', label: 'Pagamentos' },
          { key: 'repasses', label: 'Repasses' },
        ]}
      />
      <EmptyState icon={Landmark} title={aba === 'pagamentos' ? 'Nenhum pagamento a conciliar' : 'Nenhum repasse a conciliar'} />
    </Screen>
  );
}
