import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CircleCheck, ExternalLink, MapPin, Pencil, Ruler, Sprout } from 'lucide-react-native';
import { AppText, colors, Divider, Foto, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { useRascunhoPropriedade } from '@/hooks/useRascunhoPropriedade';
import { rotasAgricultor } from '@/routes';

/** 04 · Minha propriedade — capa, nome, local, área, culturas e status do cadastro. */
export default function MinhaPropriedadeScreen() {
  const router = useRouter();
  const leitura = useRascunhoPropriedade();
  const rascunho = leitura.estado === 'pronto' ? leitura.rascunho : null;
  const local = rascunho ? [rascunho.cidade.trim(), rascunho.uf.trim()].filter(Boolean).join(' · ') : '';

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

      {leitura.estado === 'carregando' && <AppText>Carregando rascunho…</AppText>}
      {leitura.estado === 'erro' && <AppText>Não foi possível abrir o rascunho. Volte e abra esta tela novamente.</AppText>}
      {leitura.estado === 'pronto' && !rascunho && <AppText>Nenhum rascunho salvo. Toque em editar para começar.</AppText>}
      {rascunho && (
        <>
          <View style={styles.nome}>
            <AppText variant="title">{rascunho.nome.trim()}</AppText>
            <View style={styles.linha}>
              <MapPin size={sizes.iconSm} color={colors.textSecondary} />
              <AppText variant="body" color="textSecondary">
                {local || 'Local não informado'}
              </AppText>
            </View>
          </View>

          <View style={styles.info}>
            <View style={styles.linha}>
              <Ruler size={sizes.iconMd} color={colors.textSecondary} />
              <AppText variant="bodyStrong">{rascunho.area.trim() ? `${rascunho.area.trim()} ha` : 'Área não informada'}</AppText>
            </View>
            <View style={styles.linha}>
              <Sprout size={sizes.iconMd} color={colors.textSecondary} />
              <View>
                <AppText variant="caption" color="textSecondary">
                  Culturas
                </AppText>
                <AppText variant="bodyStrong">{rascunho.culturas.trim() || 'Não informadas'}</AppText>
              </View>
            </View>
            <View style={styles.linha}>
              <CircleCheck size={sizes.iconMd} color={colors.primary} />
              <AppText variant="bodyStrong" color="primary">Rascunho salvo neste dispositivo</AppText>
            </View>
          </View>
        </>
      )}

      <Divider />
      {/* Não está no mockup: único acesso à tela 05 · Fotos e vídeos. */}
      <ListRow icon={Camera} title="Fotos e vídeos" onPress={() => router.push(rotasAgricultor.midias)} />
      <Divider />
      <ListRow
        title="Ver exemplo de perfil público"
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
