import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import {
  Apple,
  Carrot,
  House,
  Package,
  Play,
  Trees,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { colors, radius, sizes, spacing } from '../theme';
import { AppText } from './AppText';

/**
 * Ilustrações PROVISÓRIAS para acompanhar o layout dos mockups enquanto não há fotos,
 * mapas e QR reais. Nada aqui é dado: ao integrar o Storage/mapas/QR, troque por mídia real.
 */

/* ---------------------------------- Foto ---------------------------------- */

export type FotoTipo = 'tomate' | 'abobrinha' | 'sitio' | 'caixas' | 'drone';

const FOTOS: Record<FotoTipo, { icon: LucideIcon; bg: 'dangerSoft' | 'primarySoft' | 'warningSoft' | 'infoSoft' }> = {
  tomate: { icon: Apple, bg: 'dangerSoft' },
  abobrinha: { icon: Carrot, bg: 'primarySoft' },
  sitio: { icon: House, bg: 'primarySoft' },
  caixas: { icon: Package, bg: 'warningSoft' },
  drone: { icon: Trees, bg: 'primarySoft' },
};

type FotoProps = {
  tipo: FotoTipo;
  /** Quadrada quando só `size`; retangular com `height` (largura 100%) */
  size?: number;
  height?: number;
  /** Mostra o botão play (vídeo) */
  video?: boolean;
  /** Duração no canto ("0:28") */
  duracao?: string;
  /** Mostra o X de remover (evidências) */
  onRemove?: () => void;
  children?: ReactNode;
};

/** Foto ilustrativa: bloco colorido com ícone do assunto. Mantém proporção e raio dos mockups. */
export function Foto({ tipo, size, height, video, duracao, onRemove, children }: FotoProps) {
  const f = FOTOS[tipo];
  const Icon = f.icon;
  const dim = size ? { width: size, height: size } : { width: '100%' as const, height: height ?? 150 };
  const iconSize = size ? Math.max(sizes.iconMd, size * 0.42) : sizes.iconXl + 16;
  return (
    <View style={[styles.foto, dim, { backgroundColor: colors[f.bg] }]} accessibilityLabel={`Foto ilustrativa: ${tipo}`}>
      {video ? null : <Icon size={iconSize} color={colors.textSecondary} strokeWidth={1.5} />}
      {video ? (
        <View style={styles.play}>
          <Play size={sizes.iconLg} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
        </View>
      ) : null}
      {duracao ? (
        <View style={styles.duracao}>
          <AppText variant="micro" color="textOnPrimary">
            {duracao}
          </AppText>
        </View>
      ) : null}
      {children}
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={6} accessibilityRole="button" accessibilityLabel="Remover" style={styles.remover}>
          <X size={12} color={colors.textPrimary} strokeWidth={3} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* -------------------------------- Mapa/rota -------------------------------- */

type MapaRotaProps = { height?: number; semRota?: boolean };

/** Mapa ilustrativo com ruas, rota azul e pinos de origem (verde) e destino (vermelho). */
export function MapaRota({ height = 130, semRota }: MapaRotaProps) {
  return (
    <View style={[styles.mapa, { height }]} accessibilityLabel="Mapa ilustrativo">
      <Svg width="100%" height="100%" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid meet">
        <Rect x="0" y="0" width="300" height="130" fill={colors.primarySoft} />
        {/* quadras e ruas */}
        <G stroke={colors.surface} strokeWidth="5" opacity="0.7">
          <Path d="M-10 35 L310 20" />
          <Path d="M-10 95 L310 80" />
          <Path d="M60 -10 L80 140" />
          <Path d="M170 -10 L150 140" />
          <Path d="M250 -10 L270 140" />
        </G>
        <G stroke={colors.surface} strokeWidth="2" opacity="0.6">
          <Path d="M-10 65 L310 55" />
          <Path d="M115 -10 L110 140" />
          <Path d="M210 -10 L215 140" />
        </G>
        {semRota ? null : (
          <>
            <Path
              d="M32 88 C 70 60, 95 108, 135 82 S 195 62, 230 76 S 262 52, 274 44"
              stroke={colors.info}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <Pino x={32} y={88} cor={colors.primary} />
            <Pino x={274} y={44} cor={colors.danger} />
          </>
        )}
      </Svg>
    </View>
  );
}

function Pino({ x, y, cor }: { x: number; y: number; cor: string }) {
  return (
    <G>
      <Path d={`M${x} ${y} l-7 -13 a9 9 0 1 1 14 0 z`} fill={cor} />
      <Circle cx={x} cy={y - 17} r="3.2" fill={colors.surface} />
    </G>
  );
}

/* ------------------------------------ QR ----------------------------------- */

const N = 25;

/** Gerador determinístico simples (só decorativo — não é um QR Code válido). */
function celulas(seed: string): boolean[][] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const next = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h & 1) === 1;
  };
  const g = Array.from({ length: N }, () => Array.from({ length: N }, next));
  const finder = (ox: number, oy: number) => {
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const gx = ox + x;
        const gy = oy + y;
        if (gx < 0 || gy < 0 || gx >= N || gy >= N) continue;
        const borda = x === 0 || x === 6 || y === 0 || y === 6;
        const centro = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        g[gy][gx] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (borda || centro);
      }
    }
  };
  finder(0, 0);
  finder(N - 7, 0);
  finder(0, N - 7);
  return g;
}

/** QR ilustrativo. O QR real exige uma biblioteca de QR Code (aprovação pendente). */
export function QRDecorativo({ valor, size = 96 }: { valor: string; size?: number }) {
  const g = celulas(valor);
  return (
    <View style={[styles.qr, { width: size, height: size }]} accessibilityLabel={`QR do lote ${valor}`}>
      <Svg width={size - spacing.sm} height={size - spacing.sm} viewBox={`0 0 ${N} ${N}`}>
        {g.flatMap((linha, y) =>
          linha.map((on, x) => (on ? <Rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colors.textPrimary} /> : null)),
        )}
      </Svg>
    </View>
  );
}

/* -------------------------------- Assinatura ------------------------------- */

/** Assinatura ilustrativa. A captura real exige uma biblioteca de desenho (aprovação pendente). */
export function AssinaturaDecorativa({ height = 88 }: { height?: number }) {
  return (
    <View style={[styles.assinatura, { height }]} accessibilityLabel="Assinatura ilustrativa">
      <Svg width="100%" height="100%" viewBox="0 0 120 70" preserveAspectRatio="xMidYMid meet">
        <Path
          d="M14 48 C 20 20, 30 18, 32 36 S 30 56, 38 40 S 52 22, 56 36 C 58 44, 66 44, 74 30 M52 34 C 70 30, 88 28, 104 22"
          stroke={colors.textPrimary}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  foto: { borderRadius: radius.media, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  play: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.overlay,
    borderWidth: 2,
    borderColor: colors.textOnPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  duracao: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    backgroundColor: colors.overlay,
  },
  mapa: { width: '100%', borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.primarySoft },
  qr: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assinatura: {
    flex: 1,
    width: '100%',
    borderRadius: radius.media,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
