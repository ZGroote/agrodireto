import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CircleCheck, ExternalLink, MapPin, Pencil, Ruler, Sprout } from 'lucide-react-native';
import { AppText, colors, Divider, Foto, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { useAgricultor } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 04 · Minha propriedade — capa, nome, local, área, culturas e status do cadastro. */
export default function MinhaPropriedadeScreen() {
  const router = useRouter();
  const a = useAgricultor();

  return (
    <Screen
      header={
        <ScreenHeader
          title="Minha propriedade"
          action={{ icon: Pencil, label: 'Editar propriedade', onPress: () => router.push(rotasAgricultor.editarPropriedade) }}
        />
      }
    >
      {/* Tocar na foto abre as fotos e vídeos da propriedade. */}
      <Pressable onPress={() => router.push(rotasAgricultor.midias)} accessibilityRole="button" accessibilityLabel="Fotos e vídeos">
        <Foto tipo="sitio" height={150} />
      </Pressable>

      <View style={styles.nome}>
        <AppText variant="title">{a.propriedade}</AppText>
        <View style={styles.linha}>
          <MapPin size={sizes.iconSm} color={colors.textSecondary} />
          <AppText variant="body" color="textSecondary">
            {a.cidade} · {a.uf}
          </AppText>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.linha}>
          <Ruler size={sizes.iconMd} color={colors.textSecondary} />
          <AppText variant="bodyStrong">{a.areaHa} ha</AppText>
        </View>
        <View style={styles.linha}>
          <Sprout size={sizes.iconMd} color={colors.textSecondary} />
          <View>
            <AppText variant="caption" color="textSecondary">
              Culturas
            </AppText>
            <AppText variant="bodyStrong">{a.culturas.join(', ')}</AppText>
          </View>
        </View>
        {a.cadastroVerificado ? (
          <View style={styles.linha}>
            <CircleCheck size={sizes.iconMd} color={colors.primary} />
            <AppText variant="bodyStrong" color="primary">
              Cadastro verificado
            </AppText>
          </View>
        ) : null}
      </View>

      <Divider />
      {/* Não está no mockup: único acesso à tela 05 · Fotos e vídeos. */}
      <ListRow icon={Camera} title="Fotos e vídeos" onPress={() => router.push(rotasAgricultor.midias)} />
      <Divider />
      <ListRow
        title="Ver perfil público"
        tone="textPrimary"
        trailing={<ExternalLink size={sizes.iconMd} color={colors.textPrimary} />}
        chevron={false}
        onPress={() => router.push(rotasAgricultor.perfilPublico)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  nome: { gap: spacing.xs },
  info: { gap: spacing.lg },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
