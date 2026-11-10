import { Image, Pressable, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, Foto, radius, spacing, type FotoTipo } from '@agrodireto/ui';

type Props = {
  uri: string;
  tipo: 'foto' | 'video';
  tamanho?: number;
  /** Ilustração usada quando não há arquivo (exemplo) */
  ilustracao?: FotoTipo;
  onRemove: () => void;
};

/** Miniatura de evidência com o X de remover (botões irmãos, sem aninhar). */
export function MiniaturaEvidencia({ uri, tipo, tamanho = 76, ilustracao = 'tomate', onRemove }: Props) {
  const real = uri !== 'demo';
  return (
    <View style={{ width: tamanho, height: tamanho }}>
      {tipo === 'foto' && real ? (
        <Image source={{ uri }} resizeMode="cover" style={{ width: tamanho, height: tamanho, borderRadius: radius.media }} accessibilityLabel="Foto de evidência" />
      ) : (
        <Foto tipo={tipo === 'foto' ? ilustracao : 'drone'} video={tipo === 'video'} size={tamanho} />
      )}
      <Pressable onPress={onRemove} hitSlop={6} accessibilityRole="button" accessibilityLabel="Remover" style={styles.remover}>
        <X size={12} color={colors.textPrimary} strokeWidth={3} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  remover: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
