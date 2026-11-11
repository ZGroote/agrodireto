import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { rotulosInspecao, type OfertaCatalogo } from '@agrodireto/dominio';
import { AppText, KeyValueRow, Screen, ScreenHeader, VStack } from '@agrodireto/ui';
import { consultarCatalogo, lerResultadoInspecao } from '@/lib/ofertas';
import { FotosCatalogo } from '@/components/FotosCatalogo';

function data(valor: string) {
  return valor.split('-').reverse().join('/');
}

export default function DetalheOfertaScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [oferta, setOferta] = useState<OfertaCatalogo | null>(null);
  const [mensagem, setMensagem] = useState('Carregando oferta…');
  const [inspecao, setInspecao] = useState('');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setOferta(null);
    setInspecao('Consultando…');
    setMensagem(id ? 'Carregando oferta…' : 'Selecione uma oferta no catálogo.');
    if (id) void consultarCatalogo('', 0, id).then(
      ([item]) => {
        if (!ativo) return;
        setOferta(item ?? null);
        setMensagem(item ? '' : 'Esta oferta não está mais disponível.');
      },
      (erro: unknown) => {
        if (ativo) setMensagem(erro instanceof Error ? erro.message : 'Não foi possível carregar a oferta.');
      },
    );
    if (id) void lerResultadoInspecao(id).then(
      (item) => { if (ativo) setInspecao(item ? rotulosInspecao[item.resultado] : 'Sem inspeção registrada'); },
      () => { if (ativo) setInspecao('Resultado indisponível'); },
    );
    return () => { ativo = false; };
  }, [id]));

  return (
    <Screen header={<ScreenHeader title={oferta?.produto ?? 'Detalhe da oferta'} subtitle={oferta ? `${oferta.fornecedor} · ${oferta.cidade}/${oferta.uf}` : undefined} />}>
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {oferta && (
        <VStack gap="xxs">
          <FotosCatalogo key={oferta.id} lote={oferta.id} />
          <KeyValueRow label="Disponível" value={`${oferta.quantidade} ${oferta.unidade}`} />
          <KeyValueRow label="Preço" value={`R$ ${(oferta.preco_centavos / 100).toFixed(2).replace('.', ',')} / ${oferta.unidade}`} />
          {oferta.colheita && <KeyValueRow label="Colheita" value={data(oferta.colheita)} />}
          <KeyValueRow label="Retirada" value={`${data(oferta.retirada_inicio)} a ${data(oferta.retirada_fim)}`} />
          <KeyValueRow label="Validade" value={data(oferta.validade)} />
          <KeyValueRow label="Inspeção da equipe" value={inspecao} />
          {!!oferta.padrao && <KeyValueRow label="Padrão informado pelo produtor" value={oferta.padrao} />}
          {!!oferta.calibre && <KeyValueRow label="Calibre" value={oferta.calibre} />}
          {!!oferta.embalagem && <KeyValueRow label="Embalagem" value={oferta.embalagem} />}
          {!!oferta.condicoes && <KeyValueRow label="Condições" value={oferta.condicoes} />}
        </VStack>
      )}
    </Screen>
  );
}
