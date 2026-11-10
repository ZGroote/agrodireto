import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, type LucideIcon } from 'lucide-react-native';
import { colors, sizes, spacing } from '../theme';
import { AppText } from './AppText';
import { useVoltar } from './voltar';

/* --------------------------------- Screen --------------------------------- */

type ScreenProps = {
  children: ReactNode;
  /** Cabeçalho fixo acima do conteúdo rolável */
  header?: ReactNode;
  /** Botão(ões) fixo(s) no rodapé ("Continuar", "Publicar lote") */
  footer?: ReactNode;
  scroll?: boolean;
  /** Telas com tab bar não precisam de safe area inferior */
  withTabBar?: boolean;
};

/** Container padrão de tela: safe area, fundo, rolagem e rodapé fixo. */
export function Screen({ children, header, footer, scroll = true, withTabBar }: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.staticContent]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={withTabBar ? ['top'] : ['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header}
        {body}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------------------ ScreenHeader ------------------------------ */

type HeaderAction = { icon: LucideIcon; onPress?: () => void; label: string };

type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  /** "1/3", "3/4" */
  step?: string;
  back?: boolean;
  onBack?: () => void;
  action?: HeaderAction;
  /** Conteúdo extra à direita do título (ex.: StatusPill) */
  titleAccessory?: ReactNode;
};

/** Cabeçalho das telas: seta de voltar, título grande, subtítulo e passo. */
export function ScreenHeader({ title, subtitle, step, back = true, onBack, action, titleAccessory }: ScreenHeaderProps) {
  const voltar = useVoltar();
  const ActionIcon = action?.icon;

  return (
    <View style={styles.header}>
      <View style={styles.headerBar}>
        {back ? (
          <Pressable
            onPress={onBack ?? voltar}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={sizes.iconLg} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View />
        )}
        {ActionIcon ? (
          <Pressable onPress={action.onPress} hitSlop={12} accessibilityRole="button" accessibilityLabel={action.label}>
            <ActionIcon size={sizes.iconMd + 2} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>
      {title ? (
        <View style={styles.titleRow}>
          <AppText variant="title" style={styles.flex} accessibilityRole="header">
            {title}
          </AppText>
          {titleAccessory}
          {step ? (
            <AppText variant="label" color="primary">
              {step}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {subtitle ? (
        <AppText variant="body" color="textSecondary">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

/* ------------------------------ SectionTitle ------------------------------ */

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading" style={styles.flex}>
        {title}
      </AppText>
      {action}
    </View>
  );
}

/* --------------------------------- Stack ---------------------------------- */

/** Pilha vertical com espaçamento por token. */
export function VStack({ children, gap = 'md' }: { children: ReactNode; gap?: keyof typeof spacing }) {
  return <View style={{ gap: spacing[gap] }}>{children}</View>;
}

export function HStack({
  children,
  gap = 'sm',
  align = 'center',
}: {
  children: ReactNode;
  gap?: keyof typeof spacing;
  align?: 'center' | 'flex-start' | 'flex-end';
}) {
  return <View style={{ flexDirection: 'row', alignItems: align, gap: spacing[gap] }}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.screen, paddingBottom: spacing.xxl, gap: spacing.lg },
  staticContent: { paddingHorizontal: spacing.screen, gap: spacing.lg },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.background,
  },
  header: { paddingHorizontal: spacing.screen, paddingTop: spacing.sm, paddingBottom: spacing.lg, gap: spacing.xs },
  headerBar: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border },
});
