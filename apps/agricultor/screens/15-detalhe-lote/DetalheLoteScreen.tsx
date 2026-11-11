import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AppText, Button, KeyValueRow, Screen, ScreenHeader, VStack } from '@agrodireto/ui';
import { rotulosInspecao, type ResultadoInspecao } from '@agrodireto/dominio';
import { lerOfertaPropria, lerResultadoInspecao, retirarOferta } from '@/lib/ofertas';
import { EvidenciasPublicadas } from '@/lote/EvidenciasPublicadas';

export default function DetalheLoteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [lote, setLote] = useState<Awaited<ReturnType<typeof lerOfertaPropria>>>(null);
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [inspecao, setInspecao] = useState<ResultadoInspecao | null>();
  const [erroInspecao, setErroInspecao] = useState(false);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLote(null);
    setInspecao(undefined);
    setErroInspecao(false);
    setMensagem(id ? 'Carregando lote…' : 'Selecione um lote para abrir os detalhes.');
    if (id) void lerOfertaPropria(id).then(
      (dados) => { if (ativo) { setLote(dados); setMensagem(dados ? '' : 'Lote não encontrado.'); } },
      () => { if (ativo) setMensagem('Não foi possível consultar o lote.'); },
    );
    if (id) void lerResultadoInspecao(id).then(
      (item) => { if (ativo) setInspecao(item); },
      () => { if (ativo) setErroInspecao(true); },
    );
    return () => { ativo = false; };
  }, [id]));

  async function retirar() {
    if (!lote || ocupado) return;
    setOcupado(true);
    setMensagem('');
    try {
      await retirarOferta(lote.id);
      const atual = await lerOfertaPropria(lote.id);
      if (!atual?.retirada_em) throw new Error();
      setLote(atual);
    } catch {
      setMensagem('Não foi possível confirmar a retirada. Tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title={lote?.produto ?? 'Detalhe do lote'} />}
      footer={lote && !lote.retirada_em ? <Button label="Retirar oferta" loading={ocupado} disabled={ocupado} onPress={() => void retirar()} /> : undefined}>
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {lote && (
        <VStack gap="xxs">
          <KeyValueRow label="Status" value={lote.retirada_em ? 'Retirada' : 'Publicada em homologação'} />
          <KeyValueRow label="Quantidade" value={`${lote.quantidade} ${lote.unidade}`} />
          <KeyValueRow label="Preço" value={`R$ ${(lote.preco_centavos / 100).toFixed(2).replace('.', ',')} / ${lote.unidade}`} />
          <KeyValueRow label="Validade" value={lote.validade.split('-').reverse().join('/')} />
          <KeyValueRow label="Inspeção da equipe" value={inspecao ? rotulosInspecao[inspecao.resultado]
            : erroInspecao ? 'Resultado indisponível' : inspecao === null ? 'Sem inspeção registrada' : 'Consultando…'} />
          {inspecao && <KeyValueRow label="Inspecionado em" value={new Date(inspecao.inspecionada_em).toLocaleString('pt-BR')} />}
          <EvidenciasPublicadas key={lote.id} lote={lote.id} rascunho={lote.rascunho_id} retirada={!!lote.retirada_em} />
        </VStack>
      )}
    </Screen>
  );
}
