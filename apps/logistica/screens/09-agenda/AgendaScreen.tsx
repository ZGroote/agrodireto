import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, CalendarX, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { AppText, Button, Card, colors, EmptyState, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const formatar = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;

/**
 * 09 · Agenda (tab) — coletas e entregas do dia, em ordem.
 * Com dados: Timeline (components/Timeline.tsx) com "07h – 08h · Coleta · local".
 */
export default function AgendaScreen() {
  const router = useRouter();
  const [dia, setDia] = useState(() => new Date());
  // Paradas do dia virão do Supabase (cargas aceitas no dia selecionado).
  const paradas: never[] = [];

  const mover = (delta: number) =>
    setDia((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Agenda" />}
      footer={<Button label="Abrir rota" onPress={() => router.push(rotasLogistica.rotaColeta())} />}
    >
      <Card padded={false}>
        <View style={styles.stepper}>
          <Pressable onPress={() => mover(-1)} hitSlop={8} accessibilityLabel="Dia anterior" style={styles.arrow}>
            <ChevronLeft size={sizes.iconMd} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.day}>
            <CalendarDays size={sizes.iconMd} color={colors.primary} />
            <AppText variant="heading">{formatar(dia)}</AppText>
          </View>
          <Pressable onPress={() => mover(1)} hitSlop={8} accessibilityLabel="Próximo dia" style={styles.arrow}>
            <ChevronRight size={sizes.iconMd} color={colors.textPrimary} />
          </Pressable>
        </View>
      </Card>

      {paradas.length === 0 ? (
        <EmptyState icon={CalendarX} title="Nenhuma coleta ou entrega neste dia" description="Cargas aceitas aparecem na agenda do dia da coleta." />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  arrow: { padding: spacing.sm },
  day: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
