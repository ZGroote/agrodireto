import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, Card, Checkbox, EMPTY, MediaThumb, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 12 · Conferir coleta — verificação do lote antes de carregar. Param: ?carga= */
export default function ConferirColetaScreen() {
  const router = useRouter();
  const { carga } = useLocalSearchParams<{ carga?: string }>();
  const [embalagem, setEmbalagem] = useState(false);
  const [quantidade, setQuantidade] = useState(false);
  const [produto, setProduto] = useState(false);

  return (
    <Screen
      header={<ScreenHeader title="Conferir coleta" />}
      footer={
        <Button
          label="Continuar"
          disabled={!embalagem || !quantidade || !produto}
          onPress={() => router.push(rotasLogistica.pesoEvidencias({ carga }))}
        />
      }
    >
      <Card>
        <View style={styles.product}>
          <MediaThumb size={sizes.thumb + spacing.lg} />
          <View style={styles.flex}>
            <AppText variant="heading">{EMPTY}</AppText>
            <AppText variant="bodyStrong">{EMPTY}</AppText>
            <AppText variant="caption" color="textSecondary">
              {EMPTY}
            </AppText>
          </View>
        </View>
      </Card>

      <View style={styles.checks}>
        <AppText variant="label">Verificação da coleta</AppText>
        <Card>
          <Checkbox checked={embalagem} onChange={setEmbalagem} label="Embalagem íntegra" />
        </Card>
        <Card>
          <Checkbox checked={quantidade} onChange={setQuantidade} label="Quantidade conferida" description={EMPTY} />
        </Card>
        <Card>
          <Checkbox checked={produto} onChange={setProduto} label="Produto conforme pedido" description={EMPTY} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  product: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checks: { gap: spacing.sm },
});
