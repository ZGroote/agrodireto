import { StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppText, Button, Card, EMPTY, KeyValueRow, Screen, ScreenHeader, spacing } from '@agrodireto/ui';
import { lerPublicacao, publicarOferta, retirarOferta } from '@/lib/ofertas';
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
  const { id, draft, salvar } = useLoteDraft();
  const [publicacao, setPublicacao] = useState<Awaited<ReturnType<typeof lerPublicacao>>>(null);
  const [consultou, setConsultou] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    void lerPublicacao(id).then(
      (dados) => { if (ativo) { setPublicacao(dados); setConsultou(true); } },
      () => { if (ativo) setMensagem('Não foi possível consultar a publicação. Você ainda pode salvar o rascunho.'); },
    );
    return () => { ativo = false; };
  }, [id]));

  async function publicar() {
    if (ocupado || publicacao) return;
    setOcupado(true);
    setMensagem('');
    try {
      if (!await salvar('revisar')) throw new Error('Salve o rascunho antes de publicar.');
      await publicarOferta(id, draft);
      const dados = await lerPublicacao(id);
      if (!dados) throw new Error('Não foi possível confirmar a publicação. Tente novamente.');
      setPublicacao(dados);
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível publicar o lote.');
    } finally {
      setOcupado(false);
    }
  }

  async function retirar() {
    if (!publicacao || ocupado) return;
    setOcupado(true);
    setMensagem('');
    try {
      await retirarOferta(publicacao.id);
      setPublicacao(await lerPublicacao(id));
    } catch {
      setMensagem('Não foi possível retirar a oferta. Tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen
      header={<ScreenHeader title="Revisar oferta" subtitle="Confira os dados antes de publicar em homologação." onBack={() => router.dismissTo(rotasAgricultor.rascunhoLote(id, 'preco'))} />}
      footer={publicacao ? (
        publicacao.retirada_em ? undefined : <Button label="Retirar oferta" disabled={ocupado} onPress={() => void retirar()} />
      ) : (
        <>
          <Button label="Publicar lote de teste" disabled={ocupado || !consultou} loading={ocupado} onPress={() => void publicar()} />
          {!ocupado && <LoteDraftFooter etapa="revisar" />}
        </>
      )}
    >
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {publicacao && (
        <>
          <AppText>{publicacao.retirada_em ? 'Oferta retirada' : 'Lote publicado em homologação'}</AppText>
          <Button label="Abrir evidências do lote" variant="secondary" disabled={ocupado}
            onPress={() => router.push(rotasAgricultor.detalheLote({ id: publicacao.id }))} />
        </>
      )}
      {!publicacao && draft.evidencias.length > 0 && <AppText>Você pode enviar os anexos privados depois de publicar o lote.</AppText>}
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
        <KeyValueRow label="Evidências anexadas" value={String(draft.evidencias.length)} />
        <KeyValueRow label="Condições" value={draft.condicoes || EMPTY} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  produto: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
