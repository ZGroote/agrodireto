import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, User, Warehouse } from 'lucide-react-native';
import { AppText, Button, Card, Screen, ScreenHeader, SelectField, spacing, TextField, TextLink } from '@agrodireto/ui';
import { useRascunhoPropriedade } from '@/hooks/useRascunhoPropriedade';
import { opcoes } from '@/lib/opcoes';
import { UNIDADES, useLoteDraft, type Unidade } from '@/lote/LoteDraftContext';
import { LoteDraftFooter } from '@/lote/LoteDraftFooter';
import { useCulturasLote } from '@/lote/useCulturasLote';
import { rotasAgricultor } from '@/routes';

/** 11 · Novo lote (1/3) — produto, origem, quantidade e unidade. */
export default function NovoLoteScreen() {
  const router = useRouter();
  const { draft, update, descartar, operacao } = useLoteDraft();
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const propriedade = useRascunhoPropriedade();
  const culturas = useCulturasLote();
  const origemLocal = propriedade.estado === 'pronto' ? propriedade.rascunho?.nome.trim() : undefined;

  const quantidadeTexto = draft.quantidade.trim();
  const quantidade = Number(quantidadeTexto.replace(/\./g, ''));
  const quantidadeValida = /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(quantidadeTexto)
    && Number.isSafeInteger(quantidade) && quantidade > 0;
  const valido = !!draft.produto?.trim() && !!origemLocal && draft.origem === origemLocal && quantidadeValida;

  async function apagar() {
    if (await descartar()) router.dismissTo(rotasAgricultor.lotes);
  }

  return (
    <Screen
      header={<ScreenHeader title="Novo lote" step="1/3" subtitle="Informe os dados básicos do lote." />}
      footer={<LoteDraftFooter etapa="novo" proxima="padrao" disabled={!valido} />}
    >
      {culturas.length > 0 && (
        <SelectField
          label="Cultura cadastrada"
          value={draft.culturaId}
          placeholder="Vincular uma cultura (opcional)"
          options={culturas.map(({ id, cultura, variedade }) => ({
            value: id, label: [cultura, variedade].filter(Boolean).join(' · '),
          }))}
          onChange={(culturaId) => {
            const cultura = culturas.find((item) => item.id === culturaId);
            if (cultura) update({ culturaId, produto: [cultura.cultura, cultura.variedade].filter(Boolean).join(' · ') });
          }}
        />
      )}
      <TextField
        label="Produto"
        icon={Warehouse}
        value={draft.produto ?? ''}
        onChangeText={(produto) => update({ produto, culturaId: undefined })}
      />
      <SelectField
        label="Origem"
        icon={MapPin}
        value={draft.origem}
        options={opcoes(origemLocal ? [origemLocal] : [])}
        onChange={(origem) => update({ origem })}
        emptyMessage="Cadastre sua propriedade para escolher a origem."
      />
      {propriedade.estado === 'pronto' && !origemLocal && (
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
          <SelectField<Unidade> label="Unidade" value={draft.unidade} options={UNIDADES} onChange={(unidade) => update({ unidade })} />
        </View>
      </View>
      {!!quantidadeTexto && !quantidadeValida && <AppText variant="caption">Informe uma quantidade inteira maior que zero.</AppText>}
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
