import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ArrowLeft, type LucideIcon } from 'lucide-react-native';
import { AppText, Button, IconBadge, ImagePlaceholder, Logo, Screen, TextLink } from '../../components';
import { colors, sizes, spacing } from '../../theme';

export type OnboardingSlide = {
  titulo: string;
  descricao: string;
  icon: LucideIcon;
};

type Props = {
  perfil: string;
  slides: OnboardingSlide[];
  /** Próxima etapa do fluxo: o Paywall do perfil */
  proximo: Href;
};

/**
 * Onboarding (Fluxo: Onboarding → Paywall → Auth) — SEM MOCKUP.
 * A ilustração é placeholder até o asset ser fornecido.
 */
export function OnboardingTemplate({ perfil, slides, proximo }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const ultimo = index === slides.length - 1;

  const avancar = () => (ultimo ? router.push(proximo) : setIndex((i) => i + 1));

  return (
    <Screen
      header={
        <View style={styles.top}>
          {index > 0 ? (
            <Pressable
              onPress={() => setIndex((i) => i - 1)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              style={styles.back}
            >
              <ArrowLeft size={sizes.iconLg} color={colors.textPrimary} />
            </Pressable>
          ) : null}
          <Logo subtitle={perfil} />
          {!ultimo ? (
            <Pressable onPress={() => router.push(proximo)} hitSlop={12} accessibilityRole="button" style={styles.skip}>
              <AppText variant="label" color="textSecondary">
                Pular
              </AppText>
            </Pressable>
          ) : null}
        </View>
      }
      footer={
        <>
          <Button label={ultimo ? 'Começar' : 'Continuar'} onPress={avancar} />
          {__DEV__ ? <TextLink label="Mapa de telas (dev)" color="textSecondary" onPress={() => router.push('/telas')} /> : null}
        </>
      }
    >
      <ImagePlaceholder height={260} label="Ilustração (asset pendente)" />
      <View style={styles.text}>
        <IconBadge icon={slide.icon} />
        <AppText variant="title">{slide.titulo}</AppText>
        <AppText variant="body" color="textSecondary">
          {slide.descricao}
        </AppText>
      </View>
      <View style={styles.dots} accessibilityLabel={`Passo ${index + 1} de ${slides.length}`}>
        {slides.map((s, i) => (
          <View key={s.titulo} style={[styles.dot, i === index && styles.dotOn]} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: spacing.lg, paddingBottom: spacing.lg, alignItems: 'center' },
  skip: { position: 'absolute', right: spacing.screen, top: spacing.lg },
  back: { position: 'absolute', left: spacing.screen, top: spacing.lg },
  text: { gap: spacing.sm },
  dots: { flexDirection: 'row', gap: spacing.xs + 2, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotOn: { width: 22, backgroundColor: colors.primary },
});
