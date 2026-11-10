import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, User, Warehouse } from 'lucide-react-native';
import { Button, mascaraMilhar, Screen, ScreenHeader, SelectField, spacing, TextField } from '@agrodireto/ui';
import { useCatalogo } from '@/hooks/dados';
import { opcoes } from '@/lib/opcoes';
import { UNIDADES, useLoteDraft, type Unidade } from '@/lote/LoteDraftContext';
import { rotasAgricultor } from '@/routes';

/** 11 · Novo lote (1/3) — produto, origem, quantidade e unidade. */
export default function NovoLoteScreen() {
  const router = useRouter();
  const { draft, update } = useLoteDraft();
  const catalogo = useCatalogo();

  const valido = !!draft.produto && !!draft.origem && Number(draft.quantidade.replace(/\D/g, '')) > 0;

  return (
    <Screen
      header={<ScreenHeader title="Novo lote" step="1/3" subtitle="Informe os dados básicos do lote." />}
      footer={<Button label="Continuar" disabled={!valido} onPress={() => router.push(rotasAgricultor.padraoLote)} />}
    >
      <SelectField
        label="Produto"
        icon={Warehouse}
        value={draft.produto}
        options={opcoes(catalogo.produtos)}
        onChange={(produto) => update({ produto })}
        emptyMessage="Catálogo de produtos ainda não carregado."
      />
      <SelectField
        label="Origem"
        icon={MapPin}
        value={draft.origem}
        options={opcoes(catalogo.origens)}
        onChange={(origem) => update({ origem })}
        emptyMessage="Cadastre sua propriedade para escolher a origem."
      />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  qty: { flex: 1.6 },
  unit: { flex: 1 },
});
