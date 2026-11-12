import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { CalendarDays, MessageSquare, Search } from 'lucide-react-native';
import { AppText, Card, Divider, EmptyState, ListRow, Screen, ScreenHeader, StatusPill, TextField, VStack, type StatusTone } from '@agrodireto/ui';
import { listarCotacoes, type Cotacao, type StatusCotacao } from '@/lib/cotacoes';
import { listarDemandasAbertas, type DemandaAberta } from '@/lib/demandas';
import { organizacaoEmUso } from '@/lib/organizacoes';

const SITUACAO: Record<StatusCotacao, { label: string; tone: StatusTone }> = {
  solicitada: { label: 'Aguardando resposta', tone: 'warning' },
  respondida: { label: 'Respondida', tone: 'success' },
  recusada: { label: 'Recusada', tone: 'danger' },
  expirada: { label: 'Expirada', tone: 'neutral' },
};

const data = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

/** 16 · Cotações (Produção) — cotações recebidas dos compradores (F01) e demandas abertas (E03, somente leitura). */
export default function CotacoesScreen() {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [mensagem, setMensagem] = useState('Carregando cotações…');
  const [busca, setBusca] = useState('');
  const [demandas, setDemandas] = useState<DemandaAberta[] | null>(null);
  const [erroDemandas, setErroDemandas] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    organizacaoEmUso()
      .then((org) => (org ? listarCotacoes(org) : []))
      .then(
        (lista) => { if (ativo) { setCotacoes(lista); setMensagem(''); } },
        (erro: unknown) => { if (ativo) setMensagem(erro instanceof Error ? erro.message : 'Não foi possível carregar as cotações.'); },
      );
    return () => { ativo = false; };
  }, []));

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
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {!mensagem && cotacoes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhuma cotação recebida"
          description="Quando um comprador pedir cotação dos seus lotes, ela aparece aqui."
        />
      ) : (
        <VStack gap="md">
          {cotacoes.map((c) => (
            <Card key={c.id}>
              <ListRow
                icon={MessageSquare}
                title={`${c.produto} · ${c.quantidade} ${c.unidade}`}
                subtitle={`${c.comprador} · entrega ${data(c.prazo_entrega)} em ${c.entrega_cidade}/${c.entrega_uf}`}
                below={<StatusPill dot {...SITUACAO[c.status]} />}
              />
              {!!c.mensagem && <AppText variant="caption" color="textSecondary">{c.mensagem}</AppText>}
            </Card>
          ))}
        </VStack>
      )}
    </Screen>
  );
}
