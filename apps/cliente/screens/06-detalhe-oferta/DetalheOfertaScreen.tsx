import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, Package, QrCode, ShieldCheck, Tag } from 'lucide-react-native';
import { Button, Divider, EMPTY, ImagePlaceholder, KeyValueRow, ListRow, Screen, ScreenHeader, VStack } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/** 06 · Detalhe da oferta — disponível, preço, colheita, QR e inspeções. Param: ?id= */
export default function DetalheOfertaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <Screen
      header={<ScreenHeader title={id ?? EMPTY} subtitle={`${EMPTY} · ${EMPTY}`} />}
      footer={<Button label="Solicitar cotação" onPress={() => router.push(rotasCliente.solicitarCotacao({ oferta: id }))} />}
    >
      <ImagePlaceholder height={150} />

      <VStack gap="xxs">
        <KeyValueRow icon={Package} label="Disponível" value={EMPTY} />
        <KeyValueRow icon={Tag} label="Preço" value={EMPTY} />
        <KeyValueRow icon={CalendarDays} label="Colheita" value={EMPTY} />
        <Divider />
        {/* QR do lote: exige lib de QR (aprovação). Inspeções: telas do Administrador (Lote D). */}
        <ListRow icon={QrCode} title="QR do lote" chevron />
        <Divider />
        <ListRow icon={ShieldCheck} title="Inspeções" chevron />
      </VStack>
    </Screen>
  );
}
