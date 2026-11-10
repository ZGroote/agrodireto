import { useRouter } from 'expo-router';
import { Clock, Landmark } from 'lucide-react-native';
import { AlertBanner, brl, Card, HighlightCard, KeyValueRow, ListRow, Screen, ScreenHeader, Timeline, VStack } from '@agrodireto/ui';
import { useDadosBancarios, useFinanceiro } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 36 · Detalhe do repasse — valor líquido, composição, situação e conta de destino. */
export default function DetalheRepasseScreen() {
  const router = useRouter();
  const f = useFinanceiro();
  const banco = useDadosBancarios();

  return (
    <Screen header={<ScreenHeader title="Repasse" subtitle={f.vendaPedido} />}>
      <HighlightCard label="Líquido a receber" value={brl(f.aReceber)} />

      <Card>
        <KeyValueRow label={`Venda (${f.vendaPedido})`} value={brl(f.venda)} />
        <KeyValueRow label={`Taxa (${String(f.taxaPercentual.toFixed(1)).replace('.', ',')}%)`} value={brl(-f.taxa)} />
      </Card>

      <AlertBanner icon={Clock} tone="warning" title={f.statusRepasse} description={`Previsão: ${f.previsaoRepasse}`} />

      <VStack gap="sm">
        <Timeline
          steps={[
            { title: 'Pagamento autorizado', caption: '05/11, 06h12', status: 'done' },
            { title: 'Recebimento confirmado', caption: 'Pelo comprador', status: 'current' },
            { title: 'Repasse liberado', caption: `Previsão: ${f.previsaoRepasse}`, status: 'todo' },
          ]}
        />
      </VStack>

      <Card>
        <ListRow
          icon={Landmark}
          title="Conta de destino"
          subtitle={`${banco.banco} · ag. ${banco.agencia} · conta ${banco.conta}`}
          onPress={() => router.push(rotasAgricultor.dadosBancarios)}
        />
      </Card>
    </Screen>
  );
}
