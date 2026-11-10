import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Receipt } from 'lucide-react-native';
import { AppText, Button, Card, colors, EMPTY, EmptyState, KeyValueRow, radius, Screen, ScreenHeader, SegmentedControl, spacing } from '@agrodireto/ui';

type Aba = 'repasse' | 'extrato';

/**
 * 20 · Repasses — frete, ajustes e líquido a receber; extrato.
 * Com dados: AlertBanner de status (ex.: tone="warning" "Aguardando conferência").
 */
export default function RepassesScreen() {
  const [aba, setAba] = useState<Aba>('repasse');

  return (
    <Screen
      header={<ScreenHeader title="Repasses" />}
      // Detalhe do repasse: sem mockup — fase financeira.
      footer={aba === 'repasse' ? <Button label="Ver repasse" /> : undefined}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'repasse', label: 'Repasse' },
          { key: 'extrato', label: 'Extrato' },
        ]}
      />

      {aba === 'repasse' ? (
        <Card>
          <KeyValueRow label="Frete" value={`R$ ${EMPTY}`} />
          <KeyValueRow label="Ajustes" value={`R$ ${EMPTY}`} />
          <View style={styles.net}>
            <AppText variant="heading">Líquido a receber</AppText>
            <AppText variant="heading">R$ {EMPTY}</AppText>
          </View>
        </Card>
      ) : (
        <EmptyState icon={Receipt} title="Nenhuma transação" description="Fretes, ajustes e repasses aparecem aqui." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  net: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.input,
    backgroundColor: colors.primarySoft,
  },
});
