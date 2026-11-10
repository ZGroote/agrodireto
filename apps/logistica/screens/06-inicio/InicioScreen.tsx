import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Package, Truck, User } from 'lucide-react-native';
import { AppText, Button, Card, colors, EMPTY, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 06 · Início (tab) — próxima coleta do dia. Sem carga agendada, valores ficam "—". */
export default function InicioScreen() {
  const router = useRouter();
  // Próxima carga virá do Supabase (aceita + mais próxima no tempo).
  const verCarga = () => router.push(rotasLogistica.carga());

  return (
    <Screen
      withTabBar
      header={
        <ScreenHeader
          back={false}
          title="Início"
          // Central de notificações: sem mockup — fase de notificações.
          action={{ icon: Bell, label: 'Notificações' }}
        />
      }
    >
      <View style={styles.hello}>
        <View style={styles.avatar}>
          <User size={sizes.iconMd} color={colors.textSecondary} />
        </View>
        <View>
          <AppText variant="heading">{EMPTY}</AppText>
          <AppText variant="caption" color="textSecondary">
            {EMPTY}
          </AppText>
        </View>
      </View>

      <Card tone="soft" onPress={verCarga}>
        <View style={styles.next}>
          <Truck size={sizes.iconLg} color={colors.textPrimary} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong">Próxima coleta · {EMPTY}</AppText>
            <AppText variant="display">{EMPTY}</AppText>
            <AppText variant="body" color="textSecondary">
              {EMPTY} → {EMPTY}
            </AppText>
            <View style={styles.load}>
              <Package size={sizes.iconMd} color={colors.textPrimary} />
              <View>
                <AppText variant="bodyStrong">{EMPTY}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {EMPTY}
                </AppText>
              </View>
            </View>
          </View>
          <ChevronRight size={sizes.iconMd} color={colors.textPrimary} />
        </View>
      </Card>

      <Button label="Ver carga" onPress={verCarga} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  hello: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar / 2,
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  next: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  load: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
});
