import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Download, Image as ImageIcon, Wifi, type LucideIcon } from 'lucide-react-native';
import { AppText, Button, colors, Divider, EMPTY, radius, Screen, sizes, spacing } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/**
 * 24 · Sem conexão — estado offline: o que ficou salvo no aparelho e a última sincronização.
 * Na fase offline, abre sozinha quando a rede cai durante a operação; a fila vem do AsyncStorage.
 */
export default function SemConexaoScreen() {
  const router = useRouter();
  // Fila de sincronização local (AsyncStorage) — vazia até a fase offline.
  const evidenciasPendentes = 0;

  const tentar = () => (router.canGoBack() ? router.back() : router.replace(rotasLogistica.inicio));

  return (
    <Screen footer={<Button label="Tentar sincronizar" onPress={tentar} />}>
      <View style={styles.hero}>
        <Wifi size={sizes.iconHero} color={colors.danger} />
        <AppText variant="display">Sem conexão</AppText>
      </View>

      <View style={styles.box}>
        <Line icon={Download} text="Nenhuma coleta salva neste aparelho" />
        <Divider />
        <Line icon={ImageIcon} text={`${evidenciasPendentes} evidências pendentes`} />
        <Divider />
        <Line icon={Clock} text={`Última sincronização: ${EMPTY}`} />
      </View>
    </Screen>
  );
}

function Line({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <View style={styles.line}>
      <Icon size={sizes.iconMd} color={colors.warning} />
      <AppText variant="body">{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.xxxl * 2, paddingBottom: spacing.sm },
  box: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.warningSoft,
  },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
