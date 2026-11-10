import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Truck } from 'lucide-react-native';
import { AppText, Button, Card, Checkbox, ListRow, Screen, ScreenHeader, kg, spacing } from '@agrodireto/ui';
import { usePedido } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 19 · Preparar coleta — checklist do lote pronto e carga/motorista. Param: ?pedido= */
export default function PrepararColetaScreen() {
  const router = useRouter();
  const { pedido: id } = useLocalSearchParams<{ pedido?: string }>();
  const pedido = usePedido(id);
  const [colheita, setColheita] = useState(true);
  const [embalagem, setEmbalagem] = useState(true);
  const [etiqueta, setEtiqueta] = useState(false);
  const pronto = colheita && embalagem && etiqueta;

  return (
    <Screen
      header={<ScreenHeader title="Preparar coleta" />}
      footer={
        <Button
          label="Confirmar lote pronto"
          disabled={!pronto}
          onPress={() => router.push(rotasAgricultor.entregarMotorista({ pedido: pedido.id }))}
        />
      }
    >
      <View style={styles.sub}>
        <AppText variant="bodyStrong">
          {pedido.id} · {pedido.cargaId}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          Coleta: {pedido.retirada}
        </AppText>
      </View>

      <Card>
        <Checkbox checked={colheita} onChange={setColheita} label="Colheita realizada" description="Em 05/11/2026" />
      </Card>
      <Card>
        <Checkbox checked={embalagem} onChange={setEmbalagem} label={pedido.embalagem} description={`Total: ${kg(pedido.quantidadeKg)}`} />
      </Card>
      <Card>
        <Checkbox checked={etiqueta} onChange={setEtiqueta} label="Etiqueta do lote" description="Aplicar em todas as caixas." />
      </Card>
      <Card>
        <ListRow icon={Truck} title={pedido.cargaId} subtitle={`Motorista: ${pedido.motorista}`} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { gap: spacing.xxs, marginTop: -spacing.sm },
});
