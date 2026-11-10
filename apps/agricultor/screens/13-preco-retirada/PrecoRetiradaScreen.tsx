import { useRouter } from 'expo-router';
import { AppText, DateField, Screen, ScreenHeader, TextArea, TextField } from '@agrodireto/ui';
import { precoValido, useLoteDraft } from '@/lote/LoteDraftContext';
import { LoteDraftFooter } from '@/lote/LoteDraftFooter';
import { rotasAgricultor } from '@/routes';

/** 13 · Preço e retirada (3/3) — preço, colheita, janela de retirada, condições e validade. */
export default function PrecoRetiradaScreen() {
  const router = useRouter();
  const { draft, update } = useLoteDraft();
  const precoAceito = precoValido(draft.precoUnitario);
  const valido = precoAceito && draft.retirada.trim().length > 0 && draft.validade.trim().length > 0;

  return (
    <Screen
      header={<ScreenHeader title="Preço e retirada" step="3/3" subtitle="Defina o preço e a logística de retirada." />}
      footer={<LoteDraftFooter label="Revisar oferta" disabled={!valido} onAvancar={() => router.push(rotasAgricultor.revisarLote)} />}
    >
      <TextField
        label="Preço unitário"
        prefix="R$"
        placeholder="0,00"
        keyboardType="decimal-pad"
        suffix={`/ ${draft.unidade}`}
        value={draft.precoUnitario}
        onChangeText={(precoUnitario) => update({ precoUnitario })}
      />
      {!!draft.precoUnitario.trim() && !precoAceito && (
        <AppText variant="caption">Informe um preço maior que zero com até duas casas decimais.</AppText>
      )}
      <DateField label="Data da colheita" value={draft.dataColheita} onChange={(dataColheita) => update({ dataColheita })} />
      <DateField label="Retirada (coleta na propriedade)" modo="periodo" value={draft.retirada} onChange={(retirada) => update({ retirada })} />
      <TextArea
        label="Condições"
        placeholder="Ex.: tomate colhido na data, padronizado em caixas."
        value={draft.condicoes}
        onChangeText={(condicoes) => update({ condicoes })}
      />
      <DateField label="Validade da oferta" prefix="Até" value={draft.validade} onChange={(validade) => update({ validade })} />
    </Screen>
  );
}
