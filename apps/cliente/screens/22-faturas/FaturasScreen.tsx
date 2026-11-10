import { useState } from 'react';
import { FileText, Receipt } from 'lucide-react-native';
import { Button, Card, EmptyState, ListRow, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';

type Aba = 'pagar' | 'pagas';

/**
 * 22 · Faturas e financeiro — a pagar e pagas.
 * Item: Card com FileText, código PED, valor, StatusPill "Pago" e data do pagamento.
 */
export default function FaturasScreen() {
  const [aba, setAba] = useState<Aba>('pagar');
  // Faturas virão do Supabase (pagamentos via parceiro).
  const faturas: never[] = [];

  return (
    <Screen
      header={<ScreenHeader title="Faturas e financeiro" />}
      // Comprovante: sem mockup — fase de pagamentos.
      footer={<Button label="Ver comprovante" />}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'pagar', label: 'A pagar', count: faturas.length },
          { key: 'pagas', label: 'Pagas', count: 0 },
        ]}
      />
      <EmptyState icon={Receipt} title={aba === 'pagar' ? 'Nenhuma fatura a pagar' : 'Nenhuma fatura paga'} />
      <Card>
        <ListRow icon={FileText} title="Comprovante de pagamento" chevron />
      </Card>
    </Screen>
  );
}
