import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ArrowLeft, Check, CreditCard, X } from 'lucide-react-native';
import { AppText, Button, Card, EmptyState, HStack, Screen, TextLink, useVoltar } from '../../components';
import { colors, sizes, spacing } from '../../theme';

type Props = {
  perfil: string;
  beneficios: string[];
  /** Próxima etapa do fluxo: Auth (Entrar) do perfil */
  proximo: Href;
};

/**
 * Paywall (Fluxo: Onboarding → Paywall → Auth) — SEM MOCKUP.
 * Os planos virão das Offerings do RevenueCat (fase de assinaturas).
 * Até lá, a área de planos mostra estado vazio e "Assinar" fica desabilitado.
 */
export function PaywallTemplate({ perfil, beneficios, proximo }: Props) {
  const router = useRouter();
  const voltar = useVoltar();

  return (
    <Screen
      header={
        <View style={styles.close}>
          <Pressable onPress={voltar} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar">
            <ArrowLeft size={sizes.iconLg} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => router.push(proximo)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
            <X size={sizes.iconLg} color={colors.textPrimary} />
          </Pressable>
        </View>
      }
      footer={
        <>
          <Button label="Assinar" disabled />
          <TextLink label="Agora não" color="textSecondary" onPress={() => router.push(proximo)} />
        </>
      }
    >
      <View style={styles.head}>
        <AppText variant="label" color="primary">
          AgroDireto {perfil}
        </AppText>
        <AppText variant="title">Escolha seu plano</AppText>
        <AppText variant="body" color="textSecondary">
          Assine para aproveitar todos os recursos.
        </AppText>
      </View>

      <Card>
        <View style={styles.benefits}>
          {beneficios.map((b) => (
            <HStack key={b} align="flex-start">
              <Check size={sizes.iconMd} color={colors.primary} />
              <AppText variant="body" style={styles.flex}>
                {b}
              </AppText>
            </HStack>
          ))}
        </View>
      </Card>

      <EmptyState
        icon={CreditCard}
        title="Planos indisponíveis"
        description="Os planos aparecem aqui quando a loja estiver configurada."
      />

      <AppText variant="caption" color="textSecondary" align="center">
        Termos de Uso · Política de Privacidade · Restaurar compras
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  close: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screen, paddingTop: spacing.md },
  head: { gap: spacing.xs, paddingTop: spacing.sm },
  benefits: { gap: spacing.md },
});
