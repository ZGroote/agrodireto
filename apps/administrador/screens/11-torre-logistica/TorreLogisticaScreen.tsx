import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Truck } from 'lucide-react-native';
import { Button, EmptyState, MapPlaceholder, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

type Aba = 'ativas' | 'atrasos';

/**
 * 11 · Torre logística (tab Operação) — cargas ativas e atrasadas no mapa.
 * Carga selecionada: ListRow com Truck, código LG, StatusPill (Em trânsito = info), ETA, atualizado e origem → destino.
 */
export default function TorreLogisticaScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('ativas');
  // Cargas virão do Supabase (Realtime de posição/ETA).
  const cargas: never[] = [];

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Torre logística" />}
      footer={<Button label="Ver carga" onPress={() => router.push(rotasAdministrador.pedidoCarga())} />}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'ativas', label: 'Ativas' },
          { key: 'atrasos', label: 'Atrasos' },
        ]}
      />
      {/* Mapa real exige react-native-maps (aprovação pendente). */}
      <MapPlaceholder height={160} />
      {cargas.length === 0 ? <EmptyState icon={Truck} title={aba === 'ativas' ? 'Nenhuma carga ativa' : 'Nenhuma carga atrasada'} /> : null}
    </Screen>
  );
}
