import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, CalendarX, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react-native';
import { AppText, Button, Card, colors, Divider, EMPTY, EmptyState, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

const formatar = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} (${DIAS[d.getDay()]})`;

/**
 * 09 · Inspeções — próxima inspeção e agenda do dia.
 * Item da agenda: ListRow com status (check = concluída), "07h · local" e chevron → inspecionar({ id }).
 */
export default function InspecoesScreen() {
  const router = useRouter();
  const [dia, setDia] = useState(() => new Date());
  // Inspeções virão do Supabase (agenda do dia selecionado).
  const agenda: never[] = [];

  const mover = (delta: number) => setDia((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));

  return (
    <Screen
      header={<ScreenHeader title="Inspeções" />}
      // Agendamento: sem mockup — fase de dados.
      footer={<Button label="Agendar inspeção" />}
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

      <Card onPress={() => router.push(rotasAdministrador.inspecionar())}>
        <ListRow icon={Clock} title={`Próxima inspeção · ${EMPTY}`} />
        <Divider />
        <ListRow icon={User} title={`Inspetor(a): ${EMPTY}`} />
      </Card>

      <View style={styles.section}>
        <AppText variant="heading">Agenda do dia</AppText>
        {agenda.length === 0 ? <EmptyState icon={CalendarX} title="Nenhuma inspeção neste dia" /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  arrow: { padding: spacing.sm },
  day: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.sm },
});
