import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleCheck, MapPin, Package } from 'lucide-react-native';
import { AppText, Button, Card, colors, EMPTY, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 14 · Iniciar transporte — confirmação da coleta e início da viagem. Param: ?carga= */
export default function IniciarTransporteScreen() {
  const router = useRouter();
  const { carga } = useLocalSearchParams<{ carga?: string }>();

  return (
    <Screen
      header={<ScreenHeader />}
      footer={<Button label="Iniciar viagem" onPress={() => router.push(rotasLogistica.emTransito({ carga }))} />}
    >
      <Card tone="soft">
        <View style={styles.done}>
          <CircleCheck size={sizes.iconHero} color={colors.primary} strokeWidth={1.75} />
          <AppText variant="title">Coleta registrada</AppText>
        </View>
      </Card>

      <Card>
        <ListRow icon={Package} title={EMPTY} subtitle={EMPTY} />
      </Card>
      <Card>
        <ListRow icon={MapPin} title="Destino" subtitle={EMPTY} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  done: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxxl },
});
