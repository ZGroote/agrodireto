import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { Button, Card, ChartPlaceholder, EMPTY, Screen, ScreenHeader, SelectField, type SelectOption, spacing, StatTile } from '@agrodireto/ui';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** Últimos 12 meses, a partir do mês atual ("Novembro de 2026"). */
function ultimosMeses(): SelectOption[] {
  const hoje = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    return { value: `${d.getFullYear()}-${d.getMonth() + 1}`, label: `${MESES[d.getMonth()]} de ${d.getFullYear()}` };
  });
}

/** 16 · Relatórios — GMV, entregas no prazo e evolução no período. */
export default function RelatoriosScreen() {
  const periodos = useMemo(() => ultimosMeses(), []);
  const [periodo, setPeriodo] = useState(periodos[0].value);

  return (
    <Screen
      header={<ScreenHeader title="Relatórios" />}
      // Exportação (CSV/PDF): sem mockup — fase de dados.
      footer={<Button label="Exportar relatório" />}
    >
      <SelectField label="Período" icon={CalendarDays} value={periodo} options={periodos} onChange={setPeriodo} />

      <View style={styles.tiles}>
        <View style={styles.flex}>
          <Card tone="soft">
            <StatTile label="GMV" value={`R$ ${EMPTY}`} />
          </Card>
        </View>
        <View style={styles.flex}>
          <Card tone="soft">
            <StatTile label="Entregas no prazo" value={EMPTY} />
          </Card>
        </View>
      </View>

      {/* Gráfico real exige lib de gráfico (aprovação pendente). */}
      <ChartPlaceholder />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
