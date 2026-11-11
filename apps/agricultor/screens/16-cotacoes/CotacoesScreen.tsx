import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { AppText, Card, EmptyState, ListRow, Screen, ScreenHeader, StatusPill, VStack, type StatusTone } from '@agrodireto/ui';
import { listarCotacoes, type Cotacao, type StatusCotacao } from '@/lib/cotacoes';
import { organizacaoEmUso } from '@/lib/organizacoes';

const SITUACAO: Record<StatusCotacao, { label: string; tone: StatusTone }> = {
  solicitada: { label: 'Aguardando resposta', tone: 'warning' },
  respondida: { label: 'Respondida', tone: 'success' },
  recusada: { label: 'Recusada', tone: 'danger' },
  expirada: { label: 'Expirada', tone: 'neutral' },
};

const data = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

/** 16 · Cotações (Produção) — cotações recebidas dos compradores. Só leitura: responder entra na F02. */
export default function CotacoesScreen() {
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

  return (
    <Screen withTabBar header={<ScreenHeader title="Cotações" />}>
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
