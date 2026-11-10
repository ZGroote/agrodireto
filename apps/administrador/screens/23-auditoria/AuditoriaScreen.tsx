import { History } from 'lucide-react-native';
import { EmptyState, Screen, ScreenHeader } from '@agrodireto/ui';

/**
 * 23 · Auditoria — registro imutável das decisões (quem, o quê, quando, motivo, antes e depois).
 * Item: linha do tempo com autor, objeto · ação, data/hora, card Motivo, card Antes e card Depois (soft).
 */
export default function AuditoriaScreen() {
  // Registros virão do Supabase (tabela de auditoria, só leitura).
  const registros: never[] = [];

  return (
    <Screen withTabBar header={<ScreenHeader title="Auditoria" />}>
      {registros.length === 0 ? (
        <EmptyState icon={History} title="Nenhum registro de auditoria" description="Aprovações, bloqueios e decisões de disputa aparecem aqui." />
      ) : null}
    </Screen>
  );
}
