import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleOff, Copy, Ellipsis, MapPin, Pencil, Share2, ShieldCheck } from 'lucide-react-native';
import {
  AcaoSheet,
  ActionSheet,
  AppText,
  colors,
  Divider,
  kg,
  KeyValueRow,
  ListRow,
  QRDecorativo,
  Screen,
  ScreenHeader,
  sizes,
  spacing,
  StatusPill,
} from '@agrodireto/ui';
import { STATUS_LOTE } from '@/components/LoteItem';
import { useLote } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 15 · Detalhe do lote — código, status, quantidades, QR e ações. Param: ?id= */
export default function DetalheLoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const lote = useLote(id);
  const status = STATUS_LOTE[lote.status];
  const [menu, setMenu] = useState(false);

  const acoes: AcaoSheet[] = [
    { label: 'Compartilhar QR do lote', icon: Share2, onPress: () => undefined },
    { label: 'Ver inspeções', icon: ShieldCheck, onPress: () => router.push(rotasAgricultor.inspecoes({ id: lote.id })) },
    { label: 'Duplicar lote', icon: Copy, onPress: () => router.push(rotasAgricultor.novoLote) },
    { label: 'Encerrar lote', icon: CircleOff, tone: 'danger', onPress: () => router.back() },
  ];

  return (
    <Screen
      header={
        <ScreenHeader
          title={lote.id}
          titleAccessory={<StatusPill label={status.label} tone={status.tone} />}
          action={{ icon: Ellipsis, label: 'Mais opções', onPress: () => setMenu(true) }}
        />
      }
    >
      <View style={styles.head}>
        <AppText variant="heading">{lote.produto}</AppText>
        <View style={styles.loc}>
          <MapPin size={sizes.iconSm} color={colors.textSecondary} />
          <AppText variant="caption" color="textSecondary">
            {lote.local}
          </AppText>
        </View>
      </View>

      <View>
        <KeyValueRow label="Quantidade total" value={kg(lote.quantidadeKg)} />
        <View style={styles.qr}>
          <AppText variant="body" color="textSecondary">
            QR do lote
          </AppText>
          <QRDecorativo valor={lote.id} size={96} />
        </View>
        <KeyValueRow label="Reservado" value={kg(lote.reservadoKg)} />
      </View>

      <View>
        <ListRow icon={ShieldCheck} title="Inspeções" onPress={() => router.push(rotasAgricultor.inspecoes({ id: lote.id }))} />
        <Divider />
        <ListRow icon={Pencil} title="Editar lote" onPress={() => router.push(rotasAgricultor.novoLote)} />
      </View>

      <ActionSheet visible={menu} onClose={() => setMenu(false)} title={lote.id} acoes={acoes} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: spacing.xs },
  loc: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  qr: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: spacing.sm },
});
