import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Card, EMPTY, KeyValueRow, Screen, ScreenHeader, spacing } from '@agrodireto/ui';
import { useLoteDraft } from '@/lote/LoteDraftContext';
import { LoteDraftFooter } from '@/lote/LoteDraftFooter';
import { rotasAgricultor } from '@/routes';

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

/** "05/11 a 06/11/2026" → "05 – 06 NOV" (cai no texto original se o formato for outro). */
function retiradaCurta(texto: string): string {
  const m = texto.match(/^(\d{2})\/(\d{2}) a (\d{2})\/(\d{2})/);
  if (!m) return texto || EMPTY;
  const mes = MESES[Number(m[4]) - 1] ?? '';
  return `${m[1]} – ${m[3]} ${mes}`.trim();
}

/** 14 · Revisar oferta — resumo do rascunho antes de publicar. */
export default function RevisarOfertaScreen() {
  const router = useRouter();
  const { id, draft } = useLoteDraft();

  return (
    <Screen
      header={<ScreenHeader title="Revisar oferta" subtitle="Confira os dados do lote antes de guardar o rascunho." onBack={() => router.dismissTo(rotasAgricultor.rascunhoLote(id, 'preco'))} />}
      footer={<LoteDraftFooter etapa="revisar" />}
    >
      <Card>
        <View style={styles.produto}>
          <View style={styles.flex}>
            <AppText variant="heading">{draft.produto ?? EMPTY}</AppText>
            <AppText variant="caption" color="textSecondary">
              {draft.origem || EMPTY}
            </AppText>
          </View>
        </View>
      </Card>

      <View>
        <KeyValueRow label="Quantidade" value={draft.quantidade ? `${draft.quantidade} ${draft.unidade}` : EMPTY} />
        <KeyValueRow label="Preço" value={draft.precoUnitario ? `R$ ${draft.precoUnitario}/${draft.unidade}` : EMPTY} />
        <KeyValueRow label="Data da colheita" value={draft.dataColheita || EMPTY} />
        <KeyValueRow label="Retirada" value={retiradaCurta(draft.retirada)} />
        <KeyValueRow label="Validade" value={draft.validade || EMPTY} />
        <KeyValueRow label="Padrão" value={draft.padrao || EMPTY} />
        <KeyValueRow label="Calibre" value={draft.calibre || EMPTY} />
        <KeyValueRow label="Embalagem" value={draft.embalagem || EMPTY} />
        <KeyValueRow label="Condições" value={draft.condicoes || EMPTY} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  produto: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
