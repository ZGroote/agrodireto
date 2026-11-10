import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, MapPin, RefreshCw, Truck } from 'lucide-react-native';
import { AppText, Button, colors, Divider, EMPTY, KeyValueRow, ListRow, MapPlaceholder, radius, Screen, ScreenHeader, spacing, TextLink } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 15 · Em trânsito — rota até o comprador, ETA e status. Param: ?carga= */
export default function EmTransitoScreen() {
  const router = useRouter();
  const { carga } = useLocalSearchParams<{ carga?: string }>();

  return (
    <Screen
      header={<ScreenHeader title="Em trânsito" />}
      footer={
        <>
          {/* Na integração, "Atualizar status" envia posição/ETA; o passo seguinte é a chegada ao comprador. */}
          <Button label="Atualizar status" onPress={() => router.push(rotasLogistica.chegadaComprador({ carga }))} />
          {/* Não está no mockup: único acesso à 16 · Registrar ocorrência. */}
          <TextLink label="Registrar ocorrência" color="danger" onPress={() => router.push(rotasLogistica.ocorrencia({ carga }))} />
        </>
      }
    >
      {/* Mapa real exige react-native-maps (aprovação pendente). */}
      <MapPlaceholder height={140} />

      <View>
        <ListRow icon={Truck} title={`${carga ?? EMPTY} · PED ${EMPTY}`} />
        <Divider />
        <ListRow icon={MapPin} title={`${EMPTY} → ${EMPTY}`} />
        <Divider />
        <KeyValueRow icon={Clock} label="Chegada prevista" value={EMPTY} />
        <KeyValueRow icon={RefreshCw} label="Atualizado em" value={EMPTY} />
      </View>

      <View style={styles.status}>
        <AppText variant="bodyStrong" color="info">
          Em trânsito
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.infoSoft,
  },
});
