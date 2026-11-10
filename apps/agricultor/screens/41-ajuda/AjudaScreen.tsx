import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, Headset } from 'lucide-react-native';
import { AppText, Button, Card, colors, Divider, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { useAjuda } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 41 · Ajuda — perguntas frequentes e atalho para o suporte. */
export default function AjudaScreen() {
  const router = useRouter();
  const perguntas = useAjuda();
  const [aberta, setAberta] = useState<string | null>(perguntas[0]?.id ?? null);

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Ajuda" subtitle="Perguntas frequentes." />}
      footer={<Button label="Falar com o suporte" icon={Headset} onPress={() => router.navigate(rotasAgricultor.abrirConversa({ conversa: 'suporte' }))} />}
    >
      <Card>
        {perguntas.map((p, i) => {
          const aberto = aberta === p.id;
          const Seta = aberto ? ChevronUp : ChevronDown;
          return (
            <View key={p.id}>
              <Pressable onPress={() => setAberta(aberto ? null : p.id)} accessibilityRole="button" style={styles.pergunta}>
                <AppText variant="bodyStrong" style={styles.flex}>
                  {p.pergunta}
                </AppText>
                <Seta size={sizes.iconMd} color={colors.textSecondary} />
              </Pressable>
              {aberto ? (
                <AppText variant="body" color="textSecondary" style={styles.resposta}>
                  {p.resposta}
                </AppText>
              ) : null}
              {i < perguntas.length - 1 ? <Divider /> : null}
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pergunta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  resposta: { paddingBottom: spacing.md },
});
