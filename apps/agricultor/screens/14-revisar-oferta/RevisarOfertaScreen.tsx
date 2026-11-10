import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Button, Card, EMPTY, Foto, KeyValueRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { useAgricultor, useLotes, usePrevisao } from '@/hooks/dados';
import { useLoteDraft } from '@/lote/LoteDraftContext';
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
  const { draft, reset } = useLoteDraft();
  const a = useAgricultor();
  const previsao = usePrevisao();
  const publicado = useLotes()[0];

  const publicar = () => {
    // Fase de dados: enviar o rascunho ao Supabase e abrir o lote criado (aqui, o lote de exemplo).
    reset();
    router.dismissAll();
    router.push(rotasAgricultor.detalheLote({ id: publicado.id }));
  };

  return (
    <Screen
      header={<ScreenHeader title="Revisar oferta" subtitle="Confira os dados antes de publicar." />}
      footer={<Button label="Publicar lote" onPress={publicar} />}
    >
      <Card>
        <View style={styles.produto}>
          <Foto tipo="tomate" size={sizes.thumb} />
          <View style={styles.flex}>
            <AppText variant="heading">{draft.produto ?? EMPTY}</AppText>
            <AppText variant="caption" color="textSecondary">
              {draft.origem ? `${draft.origem} · ${a.cidade} · ${a.uf}` : EMPTY}
            </AppText>
          </View>
        </View>
      </Card>

      <View>
        <KeyValueRow label="Quantidade" value={draft.quantidade ? `${draft.quantidade} ${draft.unidade}` : EMPTY} />
        <KeyValueRow label="Preço" value={draft.precoUnitario ? `R$ ${draft.precoUnitario}/${draft.unidade}` : EMPTY} />
        <KeyValueRow label="Janela de colheita" value={previsao.janela} />
        <KeyValueRow label="Retirada" value={retiradaCurta(draft.retirada)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  produto: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
