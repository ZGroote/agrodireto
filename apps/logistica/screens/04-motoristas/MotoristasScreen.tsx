import { useRouter } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { Button, EmptyState, Screen, ScreenHeader } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/**
 * 04 · Motoristas — motoristas com CNH e veículo vinculado.
 * Item: ListRow com avatar, nome, VerifiedBadge "CNH verificada" e, abaixo,
 * seção "Veículo vinculado" (ListRow com Truck, tipo · capacidade, placa).
 */
export default function MotoristasScreen() {
  const router = useRouter();
  // Lista virá do Supabase.
  const motoristas: never[] = [];

  return (
    <Screen
      header={<ScreenHeader title="Motoristas" />}
      footer={
        <>
          {/* Fluxo de vínculo: sem mockup — entra na fase de dados. */}
          <Button label="Vincular motorista" />
          <Button label="Continuar" variant="secondary" onPress={() => router.push(rotasLogistica.documentos)} />
        </>
      }
    >
      {motoristas.length === 0 ? (
        <EmptyState icon={UserRound} title="Nenhum motorista vinculado" description="Vincule motoristas com CNH verificada a um veículo." />
      ) : null}
    </Screen>
  );
}
