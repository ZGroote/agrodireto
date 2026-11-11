import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Thermometer } from 'lucide-react-native';
import { rotulosInspecao, type ResultadoInspecao } from '@agrodireto/dominio';
import { AppText, Button, Card, Checkbox, InlineFieldRow, KeyValueRow, Screen, ScreenHeader, SelectField, type SelectOption, TextField, VStack } from '@agrodireto/ui';
import { concluirInspecao, listarLotesInspecao, type LoteInspecao } from '@/lib/inspecoes';

type Resultado = ResultadoInspecao['resultado'];

const RESULTADOS: SelectOption<Resultado>[] = [
  { value: 'aprovado', label: rotulosInspecao.aprovado },
  { value: 'ressalvas', label: rotulosInspecao.ressalvas },
  { value: 'reprovado', label: rotulosInspecao.reprovado },
];

export default function InspecionarLoteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [lote, setLote] = useState<LoteInspecao>();
  const [embalagem, setEmbalagem] = useState(false);
  const [qualidade, setQualidade] = useState(false);
  const [temperatura, setTemperatura] = useState('');
  const [resultado, setResultado] = useState<Resultado>();
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLote(undefined);
    setEmbalagem(false);
    setQualidade(false);
    setTemperatura('');
    setResultado(undefined);
    setMensagem(id ? 'Carregando lote…' : 'Selecione um lote na tela de Inspeções.');
    if (id) void listarLotesInspecao(0, id).then(
      ([item]) => { if (ativo) { setLote(item); setMensagem(item ? '' : 'Lote indisponível para inspeção.'); } },
      () => { if (ativo) setMensagem('Não foi possível carregar o lote.'); },
    );
    return () => { ativo = false; };
  }, [id]));

  async function salvar() {
    if (!lote || !resultado || ocupado) return;
    setOcupado(true);
    setMensagem('');
    try {
      await concluirInspecao(lote.lote_id, embalagem, qualidade, temperatura, resultado);
      const [atual] = await listarLotesInspecao(0, lote.lote_id);
      if (!atual?.resultado) throw new Error('Reabra o lote para verificar a inspeção registrada.');
      setLote(atual);
      setMensagem('Inspeção registrada.');
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível concluir a inspeção.');
    } finally {
      setOcupado(false);
    }
  }

  const registrada = lote?.resultado;
  return (
    <Screen header={<ScreenHeader title="Inspecionar lote" />}
      footer={lote && !registrada ? <Button label="Concluir inspeção" loading={ocupado} disabled={!resultado || ocupado} onPress={() => void salvar()} /> : undefined}>
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {lote && (
        <VStack gap="sm">
          <Card><AppText variant="heading">{lote.produto}</AppText></Card>
          <KeyValueRow label="Quantidade" value={`${lote.quantidade} ${lote.unidade}`} />
          <KeyValueRow label="Evidências aprovadas do lote" value={String(lote.evidencias_aprovadas.length)} />
          {registrada ? (
            <VStack gap="xxs">
              <KeyValueRow label="Resultado da inspeção" value={rotulosInspecao[registrada]} />
              <KeyValueRow label="Embalagem conforme" value={lote.embalagem_conforme ? 'Sim' : 'Não'} />
              <KeyValueRow label="Qualidade conforme" value={lote.qualidade_conforme ? 'Sim' : 'Não'} />
              <KeyValueRow label="Temperatura" value={lote.temperatura === null ? 'Não medida' : `${lote.temperatura} °C`} />
              {lote.inspecionada_em && <KeyValueRow label="Inspecionado em" value={new Date(lote.inspecionada_em).toLocaleString('pt-BR')} />}
              {lote.inspetor_id && <KeyValueRow label="ID do inspetor" value={lote.inspetor_id} />}
            </VStack>
          ) : (
            <VStack gap="sm">
              <Checkbox checked={embalagem} onChange={setEmbalagem} label="Embalagem conforme" />
              <Checkbox checked={qualidade} onChange={setQualidade} label="Qualidade conforme" />
              <InlineFieldRow icon={Thermometer} label="Temperatura">
                <TextField placeholder="Não medida" suffix="°C" keyboardType="numeric" value={temperatura} onChangeText={setTemperatura} />
              </InlineFieldRow>
              <SelectField label="Resultado da inspeção" value={resultado} options={RESULTADOS} onChange={setResultado} placeholder="Selecione" />
            </VStack>
          )}
        </VStack>
      )}
    </Screen>
  );
}
