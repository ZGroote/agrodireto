import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown, Heart, Leaf, MapPin, Weight, type LucideIcon } from 'lucide-react-native';
import { AppText, colors, EmptyState, radius, Screen, ScreenHeader, SearchField, sizes, spacing, TextLink } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/**
 * 03 · Ofertas (tab) — busca e lista de ofertas.
 * Item: Card com MediaThumb, código, produto, fornecedor · cidade, disponível, preço/kg
 * e chevron → rotasCliente.oferta({ id }).
 */
export default function OfertasScreen() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  // Lista virá do Supabase (ofertas publicadas, filtradas por busca e filtros).
  const ofertas: never[] = [];

  return (
    <Screen
      withTabBar
      header={
        <ScreenHeader
          title="Ofertas"
          // Não está no mockup: único acesso à 11 · Favoritos.
          action={{ icon: Heart, label: 'Favoritos', onPress: () => router.push(rotasCliente.favoritos) }}
        />
      }
    >
      <SearchField value={busca} onChangeText={setBusca} placeholder="Buscar produtos" />

      <View style={styles.chips}>
        <FilterChip icon={MapPin} label="Região" onPress={() => router.push(rotasCliente.filtros)} />
        <FilterChip icon={Weight} label="Quantidade" onPress={() => router.push(rotasCliente.filtros)} />
      </View>
      {/* Não está no mockup: único acesso à 07 · Comparar ofertas. */}
      <TextLink label="Comparar ofertas" align="right" onPress={() => router.push(rotasCliente.comparar)} />

      {ofertas.length === 0 ? (
        <EmptyState icon={Leaf} title="Nenhuma oferta encontrada" description="As ofertas publicadas pelos produtores aparecem aqui." />
      ) : null}
    </Screen>
  );
}

/** Atalho de filtro ("Ibiúna ▾", "500 kg ▾") — abre 04 · Mapa e filtros. */
function FilterChip({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      <Icon size={sizes.iconSm} color={colors.textPrimary} />
      <AppText variant="label" style={styles.flex}>
        {label}
      </AppText>
      <ChevronDown size={sizes.iconSm} color={colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: spacing.sm, marginBottom: -spacing.md },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: sizes.inputHeight - spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
});
