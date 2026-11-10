import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { AlertBanner, AppText, Button, Divider, RatingStars, Screen, ScreenHeader, spacing } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

type Criterio = 'produto' | 'conformidade' | 'comunicacao' | 'transporte';

const CRITERIOS: { key: Criterio; label: string }[] = [
  { key: 'produto', label: 'Produto' },
  { key: 'conformidade', label: 'Conformidade' },
  { key: 'comunicacao', label: 'Comunicação' },
  { key: 'transporte', label: 'Transporte' },
];

/** 21 · Avaliar entrega — nota de 1 a 5 por critério. Param: ?pedido= */
export default function AvaliarEntregaScreen() {
  const router = useRouter();
  const [notas, setNotas] = useState<Record<Criterio, number>>({ produto: 0, conformidade: 0, comunicacao: 0, transporte: 0 });

  const completo = CRITERIOS.every((c) => notas[c.key] > 0);

  return (
    <Screen
      header={<ScreenHeader title="Avaliar entrega" />}
      // Envio real: insert da avaliação (alimenta a nota do fornecedor na 05).
      footer={<Button label="Enviar avaliação" disabled={!completo} onPress={() => router.dismissTo(rotasCliente.pedidos)} />}
    >
      {/* Chega-se aqui ao confirmar o recebimento (19): o pedido está entregue. */}
      <AlertBanner icon={CircleCheck} tone="success" title="Pedido entregue." />

      <View>
        {CRITERIOS.map((c, i) => (
          <View key={c.key}>
            <View style={styles.row}>
              <AppText variant="body">{c.label}</AppText>
              <RatingStars value={notas[c.key]} onChange={(v) => setNotas((n) => ({ ...n, [c.key]: v }))} />
            </View>
            {i < CRITERIOS.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
});
