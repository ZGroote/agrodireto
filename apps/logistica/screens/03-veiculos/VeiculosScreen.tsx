import { useRouter } from 'expo-router';
import { Truck } from 'lucide-react-native';
import { Button, EmptyState, Screen, ScreenHeader } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/**
 * 03 · Veículos — frota da transportadora (tipo, capacidade, placa, situação).
 * Item: ListRow com ícone Truck, "Baú · 1.000 kg", placa e VerifiedBadge "Regular".
 */
export default function VeiculosScreen() {
  const router = useRouter();
  // Lista virá do Supabase.
  const veiculos: never[] = [];

  return (
    <Screen
      header={<ScreenHeader title="Veículos" />}
      footer={
        <>
          {/* Formulário de veículo: sem mockup — entra na fase de dados. */}
          <Button label="Adicionar veículo" />
          {/* "Continuar" não está no mockup: liga o cadastro 02 → 03 → 04 → 05. */}
          <Button label="Continuar" variant="secondary" onPress={() => router.push(rotasLogistica.motoristas)} />
        </>
      }
    >
      {veiculos.length === 0 ? (
        <EmptyState icon={Truck} title="Nenhum veículo cadastrado" description="Cadastre os veículos que vão operar as cargas." />
      ) : null}
    </Screen>
  );
}
