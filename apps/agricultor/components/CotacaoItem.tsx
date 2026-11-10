import { StyleSheet, View } from 'react-native';
import { Calendar, ChevronRight, FileText, Package, Tag } from 'lucide-react-native';
import { AppText, brl, Card, colors, Divider, kg, ListRow, sizes, spacing } from '@agrodireto/ui';
import type { Cotacao } from '@/types';

/** Cartão de cotação (16 · Cotações): código, comprador, quantidade, preço e prazo. */
export function CotacaoItem({ cotacao, onPress }: { cotacao: Cotacao; onPress: () => void }) {
  return (
    <Card padded={false}>
      <View style={styles.topo}>
        <FileText size={sizes.iconLg} color={colors.primary} />
        <View style={styles.flex}>
          <AppText variant="bodyStrong">{cotacao.id}</AppText>
          <AppText variant="caption" color="textSecondary">
            {cotacao.comprador}
          </AppText>
        </View>
      </View>
      <View style={styles.linhas}>
        <Linha icon={Package} texto={kg(cotacao.quantidadeKg)} chevron />
        <Linha icon={Tag} texto={`${brl(cotacao.precoKg, { centavos: true })}/kg`} />
        <Linha icon={Calendar} texto={`Responder até ${cotacao.responderAte}`} />
      </View>
      <Divider />
      <View style={styles.proposta}>
        <ListRow title="Ver proposta" tone="primary" onPress={onPress} />
      </View>
    </Card>
  );
}

function Linha({ icon: Icon, texto, chevron }: { icon: typeof Package; texto: string; chevron?: boolean }) {
  return (
    <View style={styles.linha}>
      <Icon size={sizes.iconMd} color={colors.textSecondary} />
      <AppText variant="body" style={styles.flex}>
        {texto}
      </AppText>
      {chevron ? <ChevronRight size={sizes.iconMd} color={colors.textSecondary} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  linhas: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  proposta: { paddingHorizontal: spacing.md },
});
