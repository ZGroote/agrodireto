import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, User, Warehouse } from 'lucide-react-native';
import { AppText, Button, Card, mascaraMilhar, Screen, ScreenHeader, SelectField, spacing, TextField, TextLink } from '@agrodireto/ui';
import { useRascunhoPropriedade } from '@/hooks/useRascunhoPropriedade';
import { opcoes } from '@/lib/opcoes';
import { UNIDADES, useLoteDraft, type Unidade } from '@/lote/LoteDraftContext';
import { LoteDraftFooter } from '@/lote/LoteDraftFooter';
import { rotasAgricultor } from '@/routes';

/** 11 · Novo lote (1/3) — produto, origem, quantidade e unidade. */
export default function NovoLoteScreen() {
  const router = useRouter();
  const { draft, update, descartar, operacao } = useLoteDraft();
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const propriedade = useRascunhoPropriedade();
  const origemLocal = propriedade.estado === 'pronto' ? propriedade.rascunho?.nome.trim() : undefined;

  const quantidade = Number(draft.quantidade.replace(/\D/g, ''));
  const valido = !!draft.produto?.trim() && !!origemLocal && draft.origem === origemLocal
    && Number.isSafeInteger(quantidade) && quantidade > 0;

  async function apagar() {
    if (await descartar()) setConfirmarDescarte(false);
  }

  return (
    <Screen
      header={<ScreenHeader title="Novo lote" step="1/3" subtitle="Informe os dados básicos do lote." />}
      footer={<LoteDraftFooter label="Continuar" disabled={!valido} onAvancar={() => router.push(rotasAgricultor.padraoLote)} />}
    >
      <TextField
        label="Produto"
        icon={Warehouse}
        value={draft.produto ?? ''}
        onChangeText={(produto) => update({ produto })}
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
            onChangeText={(quantidade) => update({ quantidade: mascaraMilhar(quantidade) })}
          />
        </View>
        <View style={styles.unit}>
          <SelectField<Unidade> label="Unidade" value={draft.unidade} options={UNIDADES} onChange={(unidade) => update({ unidade })} />
        </View>
      </View>
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
