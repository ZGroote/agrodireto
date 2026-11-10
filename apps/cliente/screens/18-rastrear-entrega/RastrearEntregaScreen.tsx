import { View } from 'react-native';
import { Clock, MapPin, RefreshCw, Truck, User } from 'lucide-react-native';
import { Button, Divider, EMPTY, ListRow, MapPlaceholder, Screen, ScreenHeader } from '@agrodireto/ui';

/** 18 · Rastrear entrega — mapa, carga, rota, ETA e motorista. Param: ?pedido= */
export default function RastrearEntregaScreen() {
  return (
    <Screen
      header={<ScreenHeader title="Rastrear entrega" />}
      // Lista de eventos de rastreamento: sem mockup — fase de dados.
      footer={<Button label="Ver eventos" />}
    >
      {/* Mapa real exige react-native-maps (aprovação pendente). */}
      <MapPlaceholder height={140} />

      <View>
        <ListRow icon={Truck} title={EMPTY} />
        <Divider />
        <ListRow icon={MapPin} title={`${EMPTY} → ${EMPTY}`} />
        <Divider />
        <ListRow icon={Clock} title={`ETA: ${EMPTY}`} />
        <Divider />
        <ListRow icon={RefreshCw} title={`Atualizado: ${EMPTY}`} />
        <Divider />
        {/* Contato com o motorista: sem mockup. */}
        <ListRow icon={User} title={`${EMPTY} (motorista)`} chevron />
      </View>
    </Screen>
  );
}
