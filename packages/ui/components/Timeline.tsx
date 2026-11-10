import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { AppText } from './AppText';

export type TimelineStep = {
  title: string;
  caption?: string;
  status: 'done' | 'current' | 'todo';
};

/** Linha do tempo vertical (status do pedido, agenda, cadeia de custódia). */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <View key={`${s.title}-${i}`} style={styles.item}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.node,
                  s.status === 'done' && styles.nodeDone,
                  s.status === 'current' && styles.nodeCurrent,
                ]}
              >
                {s.status === 'done' ? <Check size={11} color={colors.textOnPrimary} strokeWidth={3} /> : null}
              </View>
              {!last ? <View style={[styles.line, s.status === 'done' && styles.lineDone]} /> : null}
            </View>
            <View style={styles.body}>
              <AppText variant="bodyStrong" color={s.status === 'todo' ? 'textSecondary' : 'textPrimary'}>
                {s.title}
              </AppText>
              {s.caption ? (
                <AppText variant="caption" color="textSecondary">
                  {s.caption}
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const NODE = 18;

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: NODE },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  nodeCurrent: { borderColor: colors.primary, borderWidth: 2 },
  line: { flex: 1, width: 2, minHeight: spacing.lg, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.primary },
  body: { flex: 1, paddingBottom: spacing.lg, gap: 2 },
});
