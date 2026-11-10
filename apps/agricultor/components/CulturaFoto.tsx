import { Image, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, Foto, radius, type FotoTipo } from '@agrodireto/ui';
import { useFotoCultura } from '@/lib/fotoCultura';

type Props = {
  cultura: string;
  /** Ilustração usada enquanto a cultura não tem foto */
  tipo: FotoTipo;
  size: number;
};

/** Ícone da cultura: a foto enviada pelo agricultor ou, sem foto, a ilustração padrão. */
export function CulturaFoto({ cultura, tipo, size }: Props) {
  const uri = useFotoCultura(cultura);
  if (!uri) return <Foto tipo={tipo} size={size} />;
  if (uri === 'demo') {
    // Captura real ainda não existe: mostra a ilustração com o selo de "foto enviada".
    return (
      <View style={{ width: size, height: size }}>
        <Foto tipo={tipo} size={size} />
        <View style={styles.selo}>
          <Check size={10} color={colors.textOnPrimary} strokeWidth={3} />
        </View>
      </View>
    );
  }
  return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius.media }} accessibilityLabel={`Foto de ${cultura}`} />;
}

const styles = StyleSheet.create({
  selo: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
