import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Building2, FileText, Package, Search, Truck } from 'lucide-react-native';
import { AppText, Button, Card, colors, EMPTY, ListRow, radius, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/** 02 · Início (tab) — resumo do dia do comprador. Contagens e próxima entrega virão do Supabase. */
export default function InicioScreen() {
  const router = useRouter();

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
      footer={<Button label="Ver ofertas" onPress={() => router.navigate(rotasCliente.ofertas)} />}
    >
      <View style={styles.company}>
        <View style={styles.avatar}>
          <Building2 size={sizes.iconMd} color={colors.primary} />
        </View>
        <View>
          <AppText variant="heading">{EMPTY}</AppText>
          <AppText variant="caption" color="textSecondary">
            {EMPTY}
          </AppText>
        </View>
      </View>

      {/* Atalho para a busca: abre a tab Ofertas, onde fica o campo de busca. */}
      <Pressable
        onPress={() => router.navigate(rotasCliente.ofertas)}
        accessibilityRole="search"
        style={({ pressed }) => [styles.search, pressed && styles.pressed]}
      >
        <Search size={sizes.iconMd} color={colors.textSecondary} />
        <AppText variant="body" color="textSecondary">
          Buscar produtos
        </AppText>
      </Pressable>

      <Card>
        <ListRow icon={Truck} title="Nenhuma entrega hoje" onPress={() => router.navigate(rotasCliente.pedidos)} />
      </Card>
      <Card>
        <ListRow icon={FileText} title="Nenhuma cotação aberta" onPress={() => router.push(rotasCliente.cotacoes)} />
      </Card>
      <Card>
        <ListRow icon={Package} title="Minhas demandas de compra" subtitle="Publicar o que sua empresa precisa em SP" onPress={() => router.push(rotasCliente.demandas)} />
      </Card>

      <View style={styles.section}>
        <AppText variant="heading">Próxima entrega</AppText>
        <Card>
          <ListRow icon={Package} title={`PED ${EMPTY}`} subtitle={EMPTY} onPress={() => router.navigate(rotasCliente.pedido())} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  company: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar / 2,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: sizes.inputHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  section: { gap: spacing.sm },
});
