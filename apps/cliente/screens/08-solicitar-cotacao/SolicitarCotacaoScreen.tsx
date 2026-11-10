import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, FileText, Package } from 'lucide-react-native';
import { AppText, Button, Card, EMPTY, InlineFieldRow, MediaThumb, Screen, ScreenHeader, sizes, spacing, TextField } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/** 08 · Solicitar cotação — quantidade, embalagem e data de entrega para uma oferta. Param: ?oferta= */
export default function SolicitarCotacaoScreen() {
  const router = useRouter();
  const { oferta } = useLocalSearchParams<{ oferta?: string }>();
  const [quantidade, setQuantidade] = useState('');
  const [embalagem, setEmbalagem] = useState('');
  const [entrega, setEntrega] = useState('');

  const valido = quantidade.trim().length > 0 && entrega.trim().length === 10;

  return (
    <Screen
      header={<ScreenHeader title="Solicitar cotação" />}
      // Envio real: insert da cotação no Supabase (o produtor responde na 16/17 do Agricultor).
      footer={<Button label="Enviar cotação" disabled={!valido} onPress={() => router.dismissTo(rotasCliente.cotacoes)} />}
    >
      <Card>
        <View style={styles.product}>
          <MediaThumb size={sizes.thumb} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong">
              {oferta ?? EMPTY} · {EMPTY}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {EMPTY}
            </AppText>
          </View>
        </View>
      </Card>

      <InlineFieldRow icon={Package} label="Quantidade">
        <TextField placeholder="0" suffix="kg" keyboardType="numeric" value={quantidade} onChangeText={setQuantidade} />
      </InlineFieldRow>
      <InlineFieldRow icon={FileText} label="Embalagem">
        <TextField placeholder="Ex.: caixas de 20 kg" value={embalagem} onChangeText={setEmbalagem} />
      </InlineFieldRow>
      <InlineFieldRow icon={CalendarDays} label="Entrega">
        <TextField placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} value={entrega} onChangeText={setEntrega} />
      </InlineFieldRow>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  product: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
