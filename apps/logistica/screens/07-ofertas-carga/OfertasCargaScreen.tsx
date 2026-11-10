import { useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import { Button, EmptyState, Screen, ScreenHeader } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/**
 * 07 · Ofertas de carga (tab Cargas) — cargas compatíveis com a frota.
 * Item: Card + ListRow com ícone Package, "Origem → Destino", "peso · data",
 * "Frete: R$ x" e chevron → rotasLogistica.carga({ id }).
 */
export default function OfertasCargaScreen() {
  const router = useRouter();
  // Lista virá do Supabase (ofertas abertas compatíveis com veículo e região).
  const ofertas: never[] = [];

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Ofertas de carga" />}
      footer={<Button label="Ver oferta" onPress={() => router.push(rotasLogistica.carga())} />}
    >
      {ofertas.length === 0 ? (
        <EmptyState icon={Package} title="Nenhuma oferta de carga" description="As cargas compatíveis com seus veículos aparecem aqui." />
      ) : null}
    </Screen>
  );
}
