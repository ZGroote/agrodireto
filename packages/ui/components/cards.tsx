import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BadgeCheck, ChevronRight, CircleAlert, Circle, CircleCheck, Inbox, type LucideIcon } from 'lucide-react-native';
import { colors, radius, shadows, sizes, spacing, type ColorToken } from '../theme';
import { AppText } from './AppText';

/* ---------------------------------- Card ---------------------------------- */

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  tone?: 'surface' | 'soft';
  padded?: boolean;
};

/** Card branco com borda fina (base de quase tudo nos mockups). */
export function Card({ children, onPress, tone = 'surface', padded = true }: CardProps) {
  const style = [styles.card, tone === 'soft' && styles.cardSoft, padded && styles.cardPadded];
  if (!onPress) return <View style={style}>{children}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [...style, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

/* ------------------------------ HighlightCard ----------------------------- */

type HighlightCardProps = {
  label: string;
  value: string;
  caption?: string;
  onPress?: () => void;
};

/** Card verde-claro com valor grande ("A receber R$ 2.352"). */
export function HighlightCard({ label, value, caption, onPress }: HighlightCardProps) {
  return (
    <Card tone="soft" onPress={onPress}>
      <View style={styles.rowCenter}>
        <View style={styles.flex}>
          <AppText variant="label" color="textSecondary">
            {label}
          </AppText>
          <AppText variant="display" color="primary">
            {value}
          </AppText>
          {caption ? (
            <AppText variant="caption" color="textSecondary">
              {caption}
            </AppText>
          ) : null}
        </View>
        {onPress ? <ChevronRight size={sizes.iconMd} color={colors.primary} /> : null}
      </View>
    </Card>
  );
}

/* ------------------------------- AlertBanner ------------------------------ */

type Tone = 'success' | 'warning' | 'info' | 'danger';

const toneColors: Record<Tone, { fg: ColorToken; bg: ColorToken }> = {
  success: { fg: 'success', bg: 'successSoft' },
  warning: { fg: 'warning', bg: 'warningSoft' },
  info: { fg: 'info', bg: 'infoSoft' },
  danger: { fg: 'danger', bg: 'dangerSoft' },
};

type AlertBannerProps = {
  title: string;
  description?: string;
  tone?: Tone;
  icon?: LucideIcon;
  onPress?: () => void;
};

/** Faixa de aviso ("Documento pendente", "Aguardando recebimento"). */
export function AlertBanner({ title, description, tone = 'warning', icon: Icon = CircleAlert, onPress }: AlertBannerProps) {
  const t = toneColors[tone];
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={[styles.banner, { backgroundColor: colors[t.bg] }]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <Icon size={sizes.iconMd} color={colors[t.fg]} />
      <View style={styles.flex}>
        <AppText variant="bodyStrong" color={t.fg}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" color="textSecondary">
            {description}
          </AppText>
        ) : null}
      </View>
      {onPress ? <ChevronRight size={sizes.iconMd} color={colors[t.fg]} /> : null}
    </Pressable>
  );
}

/* -------------------------------- StatusPill ------------------------------ */

export type StatusTone = Tone | 'neutral';

type StatusPillProps = { label: string; tone?: StatusTone; dot?: boolean; icon?: LucideIcon };

/** Pill de status: Disponível · Atenção · Em trânsito · Bloqueado. */
export function StatusPill({ label, tone = 'success', dot = false, icon: Icon }: StatusPillProps) {
  const fg: ColorToken = tone === 'neutral' ? 'textSecondary' : toneColors[tone].fg;
  const bg: ColorToken = tone === 'neutral' ? 'placeholder' : toneColors[tone].bg;
  return (
    <View style={[styles.pill, { backgroundColor: colors[bg] }]}>
      {Icon ? <Icon size={12} color={colors[fg]} /> : dot ? <View style={[styles.dot, { backgroundColor: colors[fg] }]} /> : null}
      <AppText variant="micro" color={fg}>
        {label}
      </AppText>
    </View>
  );
}

/** Selo "Verificado" com check verde. */
export function VerifiedBadge({ label = 'Verificado', tone = 'success' }: { label?: string; tone?: Tone }) {
  const fg = toneColors[tone].fg;
  const Icon = tone === 'success' ? BadgeCheck : CircleAlert;
  return (
    <View style={styles.rowCenterXs}>
      <Icon size={14} color={colors[fg]} />
      <AppText variant="caption" color={fg}>
        {label}
      </AppText>
    </View>
  );
}

/* ---------------------------------- Rows ---------------------------------- */

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Conteúdo à esquerda no lugar do ícone (ex.: miniatura) */
  leading?: ReactNode;
  value?: string;
  trailing?: ReactNode;
  below?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  tone?: ColorToken;
};

/** Linha de lista: ícone, título, subtítulo, valor e chevron. */
export function ListRow({
  title,
  subtitle,
  icon: Icon,
  leading,
  value,
  trailing,
  below,
  onPress,
  chevron = !!onPress,
  tone = 'textPrimary',
}: ListRowProps) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {leading ?? (Icon ? <Icon size={sizes.iconMd} color={colors[tone === 'textPrimary' ? 'textSecondary' : tone]} /> : null)}
      <View style={styles.flex}>
        <AppText variant="bodyStrong" color={tone}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
        {below}
      </View>
      {value ? <AppText variant="bodyStrong">{value}</AppText> : null}
      {trailing}
      {chevron ? <ChevronRight size={sizes.iconMd} color={colors.textSecondary} /> : null}
    </Pressable>
  );
}

type KeyValueRowProps = { label: string; value: string; icon?: LucideIcon; strong?: boolean };

/** "Quantidade ······ 2.000 kg" */
export function KeyValueRow({ label, value, icon: Icon, strong }: KeyValueRowProps) {
  return (
    <View style={styles.kv}>
      {Icon ? <Icon size={sizes.iconSm} color={colors.textSecondary} /> : null}
      <AppText variant={strong ? 'bodyStrong' : 'body'} color={strong ? 'textPrimary' : 'textSecondary'} style={styles.flex}>
        {label}
      </AppText>
      <AppText variant={strong ? 'heading' : 'bodyStrong'} color={strong ? 'primary' : 'textPrimary'}>
        {value}
      </AppText>
    </View>
  );
}

type ChecklistRowProps = {
  title: string;
  status: 'done' | 'pending' | 'todo';
  statusLabel?: string;
  onPress?: () => void;
};

/** Item de checklist de cadastro (Identificação · Verificado). */
export function ChecklistRow({ title, status, statusLabel, onPress }: ChecklistRowProps) {
  const Icon = status === 'done' ? CircleCheck : status === 'pending' ? CircleAlert : Circle;
  const tone: ColorToken = status === 'done' ? 'success' : status === 'pending' ? 'warning' : 'textSecondary';
  return (
    <ListRow
      title={title}
      leading={<Icon size={sizes.iconMd} color={colors[tone]} />}
      below={
        statusLabel ? (
          <AppText variant="caption" color={tone}>
            {statusLabel}
          </AppText>
        ) : null
      }
      onPress={onPress}
    />
  );
}

/* ------------------------------- IconBadge -------------------------------- */

/** Ícone dentro de um quadrado suave (usado em linhas e cards). */
export function IconBadge({ icon: Icon, tone = 'primary' }: { icon: LucideIcon; tone?: Tone | 'primary' }) {
  const fg: ColorToken = tone === 'primary' ? 'primary' : toneColors[tone].fg;
  const bg: ColorToken = tone === 'primary' ? 'primarySoft' : toneColors[tone].bg;
  return (
    <View style={[styles.iconBadge, { backgroundColor: colors[bg] }]}>
      <Icon size={sizes.iconMd} color={colors[fg]} />
    </View>
  );
}

/* ------------------------------- EmptyState ------------------------------- */

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

/** Estado vazio — usado enquanto não há dados reais. */
export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon size={sizes.iconLg} color={colors.primary} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color="textSecondary" align="center">
          {description}
        </AppText>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardSoft: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  cardPadded: { padding: spacing.md },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowCenterXs: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.card,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  row: {
    minHeight: sizes.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  kv: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs + 2 },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
