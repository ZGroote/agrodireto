import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, MapPin } from 'lucide-react-native';
import { Button, Divider, EMPTY, KeyValueRow, ListRow, MapPlaceholder, Screen, ScreenHeader, VStack } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 10 · Rota da coleta — mapa até o produtor e chegada prevista. Param: ?carga= */
export default function RotaColetaScreen() {
  const router = useRouter();
  const { carga } = useLocalSearchParams<{ carga?: string }>();

  return (
    <Screen
      header={<ScreenHeader title="Rota da coleta" />}
      // Na integração, "Navegar" abre o app de mapas com o endereço; aqui segue o fluxo da operação.
      footer={<Button label="Navegar" onPress={() => router.push(rotasLogistica.chegadaProdutor({ carga }))} />}
    >
      {/* Mapa real exige react-native-maps (aprovação pendente). */}
      <MapPlaceholder height={180} />

      <VStack gap="xs">
        <ListRow icon={MapPin} title={EMPTY} subtitle={EMPTY} />
        <Divider />
        <KeyValueRow icon={Clock} label="Chegada prevista" value={EMPTY} strong />
      </VStack>
    </Screen>
  );
}
