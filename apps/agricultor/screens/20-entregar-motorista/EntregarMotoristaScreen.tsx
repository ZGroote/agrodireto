import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, AssinaturaDecorativa, Button, Card, Checkbox, Divider, Foto, kg, Screen, ScreenHeader, spacing } from '@agrodireto/ui';
import { usePedido } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 20 · Entregar ao motorista — conferência, evidência e assinatura. Param: ?pedido= */
export default function EntregarMotoristaScreen() {
  const router = useRouter();
  const { pedido: id } = useLocalSearchParams<{ pedido?: string }>();
  const pedido = usePedido(id);
  const [quantidade, setQuantidade] = useState(true);
  const [embalagem, setEmbalagem] = useState(true);
  const [foto, setFoto] = useState(true);
  const [assinatura, setAssinatura] = useState(true);

  return (
    <Screen
      header={<ScreenHeader title={`${pedido.loteId} · ${pedido.id}`} subtitle="Confirme a entrega do lote." />}
      footer={
        <Button
          label="Confirmar entrega"
          disabled={!quantidade || !embalagem}
          onPress={() => router.replace(rotasAgricultor.transporte({ pedido: pedido.id }))}
        />
      }
    >
      <Card>
        <Checkbox checked={quantidade} onChange={setQuantidade} label="Quantidade conferida" description={`${kg(pedido.quantidadeKg)} (${pedido.embalagem})`} />
        <Divider />
        <Checkbox checked={embalagem} onChange={setEmbalagem} label="Embalagem íntegra" description="Caixas em boas condições." />
      </Card>

      <View style={styles.evid}>
        <AppText variant="label">Evidência da entrega</AppText>
        <View style={styles.row}>
          {/* Foto e assinatura reais exigem expo-image-picker e uma lib de desenho (aprovação pendente). */}
          <View style={styles.flex}>{foto ? <Foto tipo="caixas" height={104} onRemove={() => setFoto(false)} /> : null}</View>
          <View style={styles.flex}>{assinatura ? <AssinaturaDecorativa height={104} /> : null}</View>
        </View>
        {assinatura ? (
          <AppText variant="caption" color="textSecondary" onPress={() => setAssinatura(false)}>
            Remover assinatura
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  evid: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
