import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, Receipt } from 'lucide-react-native';
import {
  AlertBanner,
  AppText,
  brl,
  colors,
  Divider,
  EmptyState,
  HighlightCard,
  KeyValueRow,
  ListRow,
  Screen,
  ScreenHeader,
  SegmentedControl,
  sizes,
  spacing,
} from '@agrodireto/ui';
import { useFinanceiro } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

type Aba = 'receber' | 'extrato';

/** 22 · Financeiro — a receber (venda, taxa, repasse) e extrato. O mockup não tem título nesta tela. */
export default function FinanceiroScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('receber');
  const f = useFinanceiro();

  return (
    <Screen header={<ScreenHeader />}>
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'receber', label: 'A receber' },
          { key: 'extrato', label: 'Extrato' },
        ]}
      />

      {aba === 'receber' ? (
        <>
          <HighlightCard label="A receber" value={brl(f.aReceber)} onPress={() => router.push(rotasAgricultor.repasse)} />
          <View>
            <KeyValueRow label={`Venda (${f.vendaPedido})`} value={brl(f.venda)} />
            <KeyValueRow label={`Taxa (${String(f.taxaPercentual.toFixed(1)).replace('.', ',')}%)`} value={brl(-f.taxa)} />
          </View>
          <AlertBanner icon={Clock} tone="warning" title={f.statusRepasse} description={`Previsão: ${f.previsaoRepasse}`} />
          <Divider />
          <ListRow
            title="Ver repasse"
            tone="primary"
            trailing={<ChevronRight size={sizes.iconMd} color={colors.textPrimary} />}
            chevron={false}
            onPress={() => router.push(rotasAgricultor.repasse)}
          />
        </>
      ) : f.extrato.length === 0 ? (
        <EmptyState icon={Receipt} title="Nenhuma transação" description="Vendas, taxas e repasses aparecem aqui." />
      ) : (
        <View>
          {f.extrato.map((x, i) => (
            <View key={x.id}>
              <View style={styles.linha}>
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{x.titulo}</AppText>
                  <AppText variant="caption" color="textSecondary">
                    {x.legenda}
                  </AppText>
                </View>
                <AppText variant="bodyStrong" color={x.valor < 0 ? 'danger' : 'primary'}>
                  {brl(x.valor)}
                </AppText>
              </View>
              {i < f.extrato.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
});
