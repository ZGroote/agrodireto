import { useState } from 'react';
import { ArrowLeftRight, Package, Percent, Settings2 } from 'lucide-react-native';
import { Button, Card, Divider, EMPTY, EmptyState, ListRow, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';

type Aba = 'comercial' | 'pagamento' | 'logistica';

/**
 * 20 · Regras da operação — comissão, liberação de repasse, requisitos de coleta.
 * Valores virão do Supabase (tabela de configuração); aplicados só no servidor.
 */
export default function RegrasOperacaoScreen() {
  const [aba, setAba] = useState<Aba>('comercial');

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Regras da operação" />}
      // Edição dos valores: sem mockup — fase de dados.
      footer={<Button label="Salvar regras" />}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'comercial', label: 'Comercial' },
          { key: 'pagamento', label: 'Pagamento' },
          { key: 'logistica', label: 'Logística' },
        ]}
      />

      {aba === 'comercial' ? (
        <Card>
          <ListRow icon={Percent} title="Comissão" value={EMPTY} />
          <Divider />
          <ListRow icon={ArrowLeftRight} title="Liberação de repasse" subtitle={EMPTY} />
          <Divider />
          <ListRow icon={Package} title="Requisitos de coleta" subtitle={EMPTY} />
        </Card>
      ) : (
        // Regras de Pagamento e Logística: o mockup só mostra a aba Comercial.
        <EmptyState icon={Settings2} title="Nenhuma regra configurada" />
      )}
    </Screen>
  );
}
