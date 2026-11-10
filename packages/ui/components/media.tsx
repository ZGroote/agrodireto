import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import {
  ChartLine,
  ImageIcon,
  Map as MapIcon,
  PenLine,
  Play,
  Plus,
  QrCode,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { colors, radius, sizes, spacing } from '../theme';
import { AppText } from './AppText';

/* ------------------------------- Placeholder ------------------------------ */

type PlaceholderProps = {
  icon: LucideIcon;
  label?: string;
  height?: number;
  width?: number | `${number}%`;
  children?: ReactNode;
};

/** Bloco neutro que ocupa o lugar de mídia/mapa/QR/gráfico até haver dado real. */
function Placeholder({ icon: Icon, label, height = 160, width = '100%', children }: PlaceholderProps) {
  return (
    <View style={[styles.placeholder, { height, width }]} accessibilityLabel={label}>
      <Icon size={sizes.iconLg} color={colors.textSecondary} />
      {label ? (
        <AppText variant="caption" color="textSecondary" align="center">
          {label}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

export function ImagePlaceholder({ height, label = 'Sem imagem', video }: { height?: number; label?: string; video?: boolean }) {
  return (
    <Placeholder icon={video ? Play : ImageIcon} label={label} height={height} />
  );
}

export function MapPlaceholder({ height = 150, label = 'Mapa indisponível' }: { height?: number; label?: string }) {
  return <Placeholder icon={MapIcon} label={label} height={height} />;
}

export function QRPlaceholder({ size = 88 }: { size?: number }) {
  return <Placeholder icon={QrCode} height={size} width={size} />;
}

export function SignaturePlaceholder({ height = 88, label = 'Assinatura' }: { height?: number; label?: string }) {
  return <Placeholder icon={PenLine} label={label} height={height} />;
}

export function ChartPlaceholder({ height = 160, label = 'Sem dados no período' }: { height?: number; label?: string }) {
  return <Placeholder icon={ChartLine} label={label} height={height} />;
}

/* ------------------------------- MediaThumb ------------------------------- */

type MediaThumbProps = {
  source?: ImageSourcePropType;
  size?: number;
  onRemove?: () => void;
};

/** Miniatura de evidência com botão de remover (X). */
export function MediaThumb({ source, size = 76, onRemove }: MediaThumbProps) {
  return (
    <View style={{ width: size, height: size }}>
      {source ? (
        <Image source={source} style={[styles.thumb, { width: size, height: size }]} />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty, { width: size, height: size }]}>
          <ImageIcon size={sizes.iconMd} color={colors.textSecondary} />
        </View>
      )}
      {onRemove ? (
        <Pressable onPress={onRemove} style={styles.remove} hitSlop={6} accessibilityLabel="Remover">
          <X size={12} color={colors.textPrimary} strokeWidth={3} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Botão "+" para adicionar mídia/evidência. */
export function AddMediaButton({ onPress, size = 76 }: { onPress?: () => void; size?: number }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Adicionar mídia"
      style={({ pressed }) => [styles.add, { width: size, height: size }, pressed && styles.pressed]}
    >
      <Plus size={sizes.iconLg} color={colors.textSecondary} />
    </Pressable>
  );
}

/* ------------------------------- ProgressBar ------------------------------ */

/** Barra de progresso ("Enviando… 72%"). value de 0 a 1. */
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.progressWrap}>
      {label ? (
        <AppText variant="caption" color="textSecondary">
          {label} {Math.round(pct * 100)}%
        </AppText>
      ) : null}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  placeholder: {
    borderRadius: radius.media,
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  thumb: { borderRadius: radius.media },
  thumbEmpty: { backgroundColor: colors.placeholder, alignItems: 'center', justifyContent: 'center' },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    borderRadius: radius.media,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: { gap: spacing.xs },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
});
