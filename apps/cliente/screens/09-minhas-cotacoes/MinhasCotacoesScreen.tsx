import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { AppText, Card, EmptyState, ListRow, Screen, ScreenHeader, SegmentedControl, StatusPill, type StatusTone } from '@agrodireto/ui';
import { listarCotacoes, type Cotacao, type StatusCotacao } from '@/lib/cotacoes';
import { organizacaoEmUso } from '@/lib/organizacoes';

type Aba = 'abertas' | 'respondidas' | 'encerradas';

const VAZIO: Record<Aba, string> = {
  abertas: 'Nenhuma cotação aberta',
  respondidas: 'Nenhuma cotação respondida',
  encerradas: 'Nenhuma cotação encerrada',
};

const ABA: Record<StatusCotacao, Aba> = { solicitada: 'abertas', respondida: 'respondidas', recusada: 'encerradas', expirada: 'encerradas' };
const SITUACAO: Record<StatusCotacao, { label: string; tone: StatusTone }> = {
  solicitada: { label: 'Aguardando resposta', tone: 'warning' },
  respondida: { label: 'Resposta recebida', tone: 'success' },
  recusada: { label: 'Recusada', tone: 'danger' },
  expirada: { label: 'Expirada', tone: 'neutral' },
};

const data = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

/**
 * 09 · Minhas cotações — abertas, respondidas e encerradas da empresa em uso.
 * Item: Card com oferta · quantidade, fornecedor, StatusPill.
 */
export default function MinhasCotacoesScreen() {
  const [aba, setAba] = useState<Aba>('abertas');
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [mensagem, setMensagem] = useState('Carregando cotações…');

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

  const contar = (a: Aba) => cotacoes.filter((c) => ABA[c.status] === a).length;
  const visiveis = cotacoes.filter((c) => ABA[c.status] === aba);

  return (
    <Screen withTabBar header={<ScreenHeader title="Minhas cotações" />}>
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'abertas', label: 'Abertas', count: contar('abertas') },
          { key: 'respondidas', label: 'Respondidas', count: contar('respondidas') },
          { key: 'encerradas', label: 'Encerradas', count: contar('encerradas') },
        ]}
      />
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {!mensagem && visiveis.length === 0 && <EmptyState icon={FileText} title={VAZIO[aba]} />}
      {visiveis.map((c) => (
        <Card key={c.id}>
          <ListRow
            icon={FileText}
            title={`${c.produto} · ${c.quantidade} ${c.unidade}`}
            subtitle={`${c.fornecedor} · entrega ${data(c.prazo_entrega)} em ${c.entrega_cidade}/${c.entrega_uf}`}
            below={<StatusPill dot {...SITUACAO[c.status]} />}
          />
        </Card>
      ))}
    </Screen>
  );
}
