import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Factory, MapPin, ShieldCheck, Star, type LucideIcon } from 'lucide-react-native';
import { AppText, Button, colors, EMPTY, ImagePlaceholder, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/**
 * 05 · Fornecedor — perfil público da propriedade (fotos, verificação, avaliação, capacidade, vídeos).
 * Também é o "Ver perfil público" do Agricultor (04 · Minha propriedade). Param: ?id=
 */
export default function FornecedorScreen() {
  const router = useRouter();

  return (
    <Screen
      header={<ScreenHeader title={EMPTY} />}
      // Na fase de dados, abre a tab Ofertas filtrada por este fornecedor.
      footer={<Button label="Ver lotes" onPress={() => router.navigate(rotasCliente.ofertas)} />}
    >
      {/* Fotos e vídeos virão do Storage do Supabase (enviados pelo produtor). */}
      <ImagePlaceholder height={140} />

      <View style={styles.info}>
        <Line icon={MapPin} text={EMPTY} />
        <Line icon={ShieldCheck} text={`Cadastro: ${EMPTY}`} />
        <Line icon={Star} text={`${EMPTY} (${EMPTY} avaliações)`} />
        <Line icon={Factory} text={`Capacidade: ${EMPTY}`} />
      </View>

      <ImagePlaceholder height={110} video label="Nenhum vídeo enviado" />
    </Screen>
  );
}

function Line({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <View style={styles.line}>
      <Icon size={sizes.iconMd} color={colors.textSecondary} />
      <AppText variant="body">{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  info: { gap: spacing.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
