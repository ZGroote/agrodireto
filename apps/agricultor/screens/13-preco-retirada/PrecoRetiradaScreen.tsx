import { useRouter } from 'expo-router';
import { AppText, Card, DateField, Screen, ScreenHeader, TextArea, TextField, TextLink } from '@agrodireto/ui';
import { precoValido, useLoteDraft } from '@/lote/LoteDraftContext';
import { LoteDraftFooter } from '@/lote/LoteDraftFooter';
import { formatarQuantidade } from '@/lib/culturas';
import { useCulturasLote } from '@/lote/useCulturasLote';
import { rotasAgricultor } from '@/routes';

/** 13 · Preço e retirada (3/3) — preço, colheita, janela de retirada, condições e validade. */
export default function PrecoRetiradaScreen() {
  const router = useRouter();
  const { id, draft, update } = useLoteDraft();
  const culturas = useCulturasLote();
  const previsao = culturas.find((cultura) => cultura.id === draft.culturaId)?.previsao;
  const precoAceito = precoValido(draft.precoUnitario);
  const valido = precoAceito && draft.retirada.trim().length > 0 && draft.validade.trim().length > 0;

  return (
    <Screen
      header={<ScreenHeader title="Preço e retirada" step="3/3" subtitle="Defina o preço e a logística de retirada." onBack={() => router.dismissTo(rotasAgricultor.rascunhoLote(id, 'padrao'))} />}
      footer={<LoteDraftFooter etapa="preco" proxima="revisar" label="Revisar oferta" disabled={!valido} />}
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
      {previsao && (
        <Card>
          <AppText variant="bodyStrong">Previsão da cultura</AppText>
          <AppText variant="caption">{formatarQuantidade(previsao)} · {previsao.colheita}</AppText>
          {draft.dataColheita !== previsao.colheita && (
            <TextLink label="Usar data prevista de colheita" onPress={() => update({ dataColheita: previsao.colheita })} />
          )}
        </Card>
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
