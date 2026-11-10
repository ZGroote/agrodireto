import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, ChevronRight } from 'lucide-react-native';
import { AppText, colors, Divider, ListRow, MapaRota, Screen, ScreenHeader, sizes, spacing, StatusPill, Timeline } from '@agrodireto/ui';
import { useTransporte } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 21 · Acompanhar transporte — rota, ETA, mapa e linha do tempo. Param: ?pedido= */
export default function AcompanharTransporteScreen() {
  const router = useRouter();
  const { pedido } = useLocalSearchParams<{ pedido?: string }>();
  const t = useTransporte();

  return (
    <Screen
      header={
        <ScreenHeader title={`${t.cargaId} · ${t.pedidoId}`} titleAccessory={<StatusPill label="Em trânsito" tone="info" />} />
      }
    >
      <View style={styles.rota}>
        <AppText variant="heading">{t.origem}</AppText>
        <ArrowRight size={sizes.iconMd} color={colors.textPrimary} />
        <AppText variant="heading">{t.destino}</AppText>
      </View>
      <AppText variant="caption" color="textSecondary" style={styles.eta}>
        ETA: {t.eta}  |  Atualizado {t.atualizadoEm}
      </AppText>

      {/* Mapa ilustrativo: o mapa real exige react-native-maps (aprovação pendente). */}
      <MapaRota height={112} />

      <Timeline steps={t.eventos} />

      <Divider />
      <ListRow
        title="Registrar ocorrência"
        tone="primary"
        trailing={<ChevronRight size={sizes.iconMd} color={colors.textPrimary} />}
        chevron={false}
        onPress={() => router.push(rotasAgricultor.ocorrencia({ pedido }))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rota: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eta: { marginTop: -spacing.sm },
});
