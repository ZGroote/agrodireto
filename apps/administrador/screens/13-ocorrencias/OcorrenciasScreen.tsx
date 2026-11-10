import { TriangleAlert } from 'lucide-react-native';
import { Button, EmptyState, Screen, ScreenHeader } from '@agrodireto/ui';

/**
 * 13 · Ocorrências (tab Alertas) — ocorrências da Logística e divergências do Cliente.
 * Item: Card com TriangleAlert, código OCO, tipo · carga; linhas Severidade (StatusPill),
 * Responsável e Prazo; Descrição com chevron. "Assumir ocorrência" → pedidoCarga({ id }).
 */
export default function OcorrenciasScreen() {
  // Ocorrências virão do Supabase (Logística 16 · Cliente 20).
  const ocorrencias: never[] = [];

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Ocorrências" />}
      footer={<Button label="Assumir ocorrência" disabled={ocorrencias.length === 0} />}
    >
      {ocorrencias.length === 0 ? (
        <EmptyState icon={TriangleAlert} title="Nenhuma ocorrência aberta" description="Ocorrências de transporte e divergências de recebimento aparecem aqui." />
      ) : null}
    </Screen>
  );
}
