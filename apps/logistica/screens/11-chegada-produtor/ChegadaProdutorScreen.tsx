import { useLocalSearchParams, useRouter } from 'expo-router';
import { House, MapPin, Truck } from 'lucide-react-native';
import { AlertBanner, Button, Card, EMPTY, ListRow, Screen, ScreenHeader } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 11 · Chegada ao produtor — confirma a chegada na origem. Param: ?carga= */
export default function ChegadaProdutorScreen() {
  const router = useRouter();
  const { carga } = useLocalSearchParams<{ carga?: string }>();

  return (
    <Screen
      header={<ScreenHeader title="Chegada ao produtor" />}
      footer={<Button label="Confirmar chegada" onPress={() => router.push(rotasLogistica.conferirColeta({ carga }))} />}
    >
      <Card>
        <ListRow icon={House} title={EMPTY} subtitle={EMPTY} />
      </Card>
      <Card>
        <ListRow icon={Truck} title={`${carga ?? EMPTY} · PED ${EMPTY}`} subtitle={`Lote ${EMPTY}`} />
      </Card>

      {/*
        Mockup mostra a permissão já concedida (verde). Sem expo-location (aprovação pendente),
        o estado real é "não autorizada". Com a lib: tone="success" + "concedida para esta operação".
      */}
      <AlertBanner icon={MapPin} tone="warning" title="Localização não autorizada" description="A permissão é pedida só para esta operação." />
    </Screen>
  );
}
