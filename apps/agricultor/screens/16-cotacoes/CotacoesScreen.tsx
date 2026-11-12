import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { CalendarDays, MessageSquare, Search } from 'lucide-react-native';
import { AppText, Card, Divider, EmptyState, ListRow, Screen, ScreenHeader, StatusPill, TextField, VStack } from '@agrodireto/ui';
import { CotacaoItem } from '@/components/CotacaoItem';
import { useCotacoes } from '@/hooks/dados';
import { listarDemandasAbertas, type DemandaAberta } from '@/lib/demandas';
import { rotasAgricultor } from '@/routes';

/** 16 · Cotações (Produção) — cotações recebidas e demandas abertas dos compradores (E03, somente leitura). */
export default function CotacoesScreen() {
  const router = useRouter();
  const cotacoes = useCotacoes();
  const [busca, setBusca] = useState('');
  const [demandas, setDemandas] = useState<DemandaAberta[] | null>(null);
  const [erroDemandas, setErroDemandas] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setErroDemandas(null);
      void listarDemandasAbertas(busca).then(
        (lista) => {
          if (ativo) setDemandas(lista);
        },
        (e) => {
          if (ativo) {
            setDemandas([]);
            setErroDemandas(e instanceof Error ? e.message : 'Não foi possível carregar as demandas.');
          }
        },
      );
      return () => {
        ativo = false;
      };
    }, [busca]),
  );

  return (
    <Screen withTabBar header={<ScreenHeader title="Cotações e demandas" />}>
      <Card>
        <VStack gap="sm">
          <AppText variant="heading">Demandas abertas de compradores (SP)</AppText>
          <TextField
            icon={Search}
            placeholder="Filtrar por cultura"
            value={busca}
            onChangeText={setBusca}
          />
          {erroDemandas ? (
            <AppText variant="caption" color="textSecondary">
              {erroDemandas}
            </AppText>
          ) : null}
          {!erroDemandas && demandas === null ? (
            <AppText variant="caption" color="textSecondary">
              Carregando demandas…
            </AppText>
          ) : null}
          {!erroDemandas && demandas !== null && demandas.length === 0 ? (
            <AppText variant="caption" color="textSecondary">
              Nenhuma demanda aberta encontrada para o filtro informado.
            </AppText>
          ) : null}
          {!erroDemandas &&
            demandas &&
            demandas.map((d, i) => (
              <VStack key={d.id} gap="xs">
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon={CalendarDays}
                  title={`${d.cultura} · ${d.quantidade.toLocaleString('pt-BR')} ${d.unidade}`}
                  subtitle={[`${d.comprador} (${d.cidade}/${d.uf})`, `Até ${d.prazo}`, d.observacao]
                    .filter(Boolean)
                    .join(' · ')}
                  trailing={<StatusPill label="Aberta" />}
                  chevron={false}
                />
              </VStack>
            ))}
        </VStack>
      </Card>

      <AppText variant="heading">Cotações nos seus lotes</AppText>
      {cotacoes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhuma cotação recebida"
          description="Quando um comprador pedir cotação dos seus lotes, ela aparece aqui."
        />
      ) : (
        <VStack gap="md">
          {cotacoes.map((c) => (
            <CotacaoItem key={c.id} cotacao={c} onPress={() => router.push(rotasAgricultor.negociacao({ id: c.id }))} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}
