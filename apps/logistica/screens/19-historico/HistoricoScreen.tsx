import { History } from 'lucide-react-native';
import { Button, EmptyState, Screen, ScreenHeader } from '@agrodireto/ui';

/**
 * 19 · Histórico — viagens concluídas (a mais recente em destaque, depois "Viagem anterior").
 * Item: Card + ListRow com Truck, "LG · PED", "Entregue · data" e chevron.
 */
export default function HistoricoScreen() {
  // Lista virá do Supabase (cargas entregues da transportadora).
  const viagens: never[] = [];

  return (
    <Screen
      header={<ScreenHeader title="Histórico" />}
      // Comprovante da entrega: sem tela no mockup — entra na fase de dados (PDF/visualização da prova 18).
      footer={<Button label="Ver comprovante" />}
    >
      {viagens.length === 0 ? (
        <EmptyState icon={History} title="Nenhuma viagem concluída" description="As entregas confirmadas aparecem aqui." />
      ) : null}
    </Screen>
  );
}
