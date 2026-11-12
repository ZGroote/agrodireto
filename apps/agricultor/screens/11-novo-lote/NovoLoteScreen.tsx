import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { AppText, Button, Card, Screen, ScreenHeader, SelectField, spacing, TextField, TextLink } from '@agrodireto/ui';
import { lerPropriedades } from '@/lib/culturas';
import { UNIDADES, useLoteDraft, type Unidade } from '@/lote/LoteDraftContext';
import { LoteDraftFooter } from '@/lote/LoteDraftFooter';
import { useCulturasLote } from '@/lote/useCulturasLote';
import { rotasAgricultor } from '@/routes';

/** 11 · Novo lote (1/3) — produto, origem, quantidade e unidade. */
export default function NovoLoteScreen() {
  const router = useRouter();
  const { draft, update, descartar, operacao } = useLoteDraft();
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const culturas = useCulturasLote();
  const [propriedades, setPropriedades] = useState<Awaited<ReturnType<typeof lerPropriedades>>>([]);
  useEffect(() => {
    let ativo = true;
    void lerPropriedades().then((dados) => { if (ativo) setPropriedades(dados); }, () => {});
    return () => { ativo = false; };
  }, []);
  const culturaSelecionada = culturas.find((item) => item.id === draft.culturaId);

  const quantidadeTexto = draft.quantidade.trim();
  const quantidade = Number(quantidadeTexto.replace(/\./g, ''));
  const quantidadeValida = /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(quantidadeTexto)
    && Number.isSafeInteger(quantidade) && quantidade > 0 && quantidade <= 1_000_000_000;
  const valido = !!culturaSelecionada && culturaSelecionada.propriedadeId === draft.propriedadeId
    && culturaSelecionada.unidades.includes(draft.unidade) && quantidadeValida;

  async function apagar() {
    if (await descartar()) router.dismissTo(rotasAgricultor.lotes);
  }

  return (
    <Screen
      header={<ScreenHeader title="Novo lote" step="1/3" subtitle="Informe os dados básicos do lote." />}
      footer={<LoteDraftFooter etapa="novo" proxima="padrao" disabled={!valido} />}
    >
        <SelectField
          label="Cultura cadastrada"
          value={draft.culturaId}
          placeholder="Selecione a cultura do lote"
          emptyMessage="Nenhuma cultura disponível. Cadastre uma cultura ou reconecte-se."
          options={culturas.map(({ id, cultura, variedade }) => ({
            value: id, label: [cultura, variedade].filter(Boolean).join(' · '),
          }))}
          onChange={(culturaId) => {
            const cultura = culturas.find((item) => item.id === culturaId);
            if (cultura) update({
              culturaId, propriedadeId: cultura.propriedadeId,
              origem: propriedades.find((item) => item.id === cultura.propriedadeId)?.nome,
              produto: [cultura.cultura, cultura.variedade].filter(Boolean).join(' · '),
              unidade: cultura.unidades.includes(draft.unidade) ? draft.unidade : cultura.unidades[0],
              // D09: trocar de segmento descarta os atributos do segmento anterior.
              segmento: cultura.segmento,
              ...(cultura.segmento !== draft.segmento ? { atributos: {}, padrao: '', calibre: '', embalagem: '' } : {}),
            });
          }}
        />
      <AppText>Produto: {draft.produto || 'Selecione a cultura'}</AppText>
      <AppText>Origem: {propriedades.find((item) => item.id === draft.propriedadeId)?.nome || draft.origem || 'Vinculada à cultura selecionada'}</AppText>
      {!culturas.length && (
        <TextLink label="Cadastrar propriedade" onPress={() => router.push(rotasAgricultor.editarPropriedade)} />
      )}
      <View style={styles.row}>
        <View style={styles.qty}>
          <TextField
            label="Quantidade"
            icon={User}
            placeholder="0"
            keyboardType="number-pad"
            value={draft.quantidade}
            onChangeText={(quantidade) => update({ quantidade })}
          />
        </View>
        <View style={styles.unit}>
          <SelectField<Unidade> label="Unidade" value={draft.unidade} options={UNIDADES.filter((item) => culturaSelecionada?.unidades.includes(item.value))} onChange={(unidade) => update({ unidade })} />
        </View>
      </View>
      {!!quantidadeTexto && !quantidadeValida && <AppText variant="caption">Informe uma quantidade inteira entre 1 e 1 bilhão.</AppText>}
      {confirmarDescarte ? (
        <Card>
          <AppText>Descartar os dados e evidências do rascunho?</AppText>
          <Button label="Confirmar descarte" variant="danger" disabled={operacao === 'gravando'} onPress={() => void apagar()} />
          <Button label="Manter rascunho" variant="secondary" onPress={() => setConfirmarDescarte(false)} />
        </Card>
      ) : (
        <TextLink label="Descartar rascunho" onPress={() => setConfirmarDescarte(true)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  qty: { flex: 1.6 },
  unit: { flex: 1 },
});
