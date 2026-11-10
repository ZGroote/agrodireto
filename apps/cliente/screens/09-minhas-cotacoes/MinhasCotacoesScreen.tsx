import { useState } from 'react';
import { useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { Card, EmptyState, ListRow, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

type Aba = 'abertas' | 'respondidas' | 'encerradas';

const VAZIO: Record<Aba, string> = {
  abertas: 'Nenhuma cotação aberta',
  respondidas: 'Nenhuma cotação respondida',
  encerradas: 'Nenhuma cotação encerrada',
};

/**
 * 09 · Minhas cotações — abertas, respondidas e encerradas.
 * Item: Card com código COT, oferta · quantidade, fornecedor, StatusPill ("Resposta recebida").
 */
export default function MinhasCotacoesScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('abertas');
  // Lista virá do Supabase (cotações da empresa).
  const cotacoes: never[] = [];

  return (
    <Screen withTabBar header={<ScreenHeader title="Minhas cotações" />}>
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'abertas', label: 'Abertas', count: cotacoes.length },
          { key: 'respondidas', label: 'Respondidas', count: 0 },
          { key: 'encerradas', label: 'Encerradas', count: 0 },
        ]}
      />
      <EmptyState icon={FileText} title={VAZIO[aba]} />
      <Card>
        <ListRow title="Ver proposta" tone="primary" onPress={() => router.push(rotasCliente.negociacao())} />
      </Card>
    </Screen>
  );
}
