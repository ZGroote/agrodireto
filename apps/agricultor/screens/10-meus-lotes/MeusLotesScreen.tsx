import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Package, Plus } from 'lucide-react-native';
import { AppText, Card, EmptyState, ListRow, Screen, ScreenHeader, SegmentedControl, VStack } from '@agrodireto/ui';
import { LoteItem } from '@/components/LoteItem';
import { useLotes } from '@/hooks/dados';
import { lerRascunhoLote, type LoteDraft } from '@/lote/LoteDraftContext';
import { rotasAgricultor } from '@/routes';

type Aba = 'disponiveis' | 'historico';

/** 10 · Meus lotes (Produção) — disponíveis x histórico. Cada item abre 15 · Detalhe do lote. */
export default function MeusLotesScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('disponiveis');
  const [rascunho, setRascunho] = useState<LoteDraft | null>(null);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    void lerRascunhoLote().then(
      (lote) => { if (ativo) setRascunho(lote); },
      () => { if (ativo) setRascunho(null); },
    );
    return () => { ativo = false; };
  }, []));
  const lotes = useLotes();
  const disponiveis = lotes.filter((l) => l.status !== 'encerrado');
  const historico = lotes.filter((l) => l.status === 'encerrado');
  // Como no mockup: a primeira aba lista todos os lotes (com o status de cada um); Histórico lista só os encerrados.
  const lista = aba === 'disponiveis' ? lotes : historico;

  return (
    <Screen
      withTabBar
      header={
        <ScreenHeader
          title="Meus lotes"
          action={{ icon: Plus, label: rascunho ? 'Retomar rascunho' : 'Novo lote', onPress: () => router.push(rotasAgricultor.novoLote) }}
        />
      }
    >
      {rascunho && (
        <Card>
          <ListRow title="Retomar rascunho" subtitle={rascunho.produto?.trim() || 'Lote em preparação'} onPress={() => router.push(rotasAgricultor.novoLote)} />
        </Card>
      )}
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'disponiveis', label: 'Disponíveis', count: disponiveis.length },
          { key: 'historico', label: 'Histórico', count: historico.length },
        ]}
      />
      {lista.length === 0 ? (
        <EmptyState icon={Package} title={aba === 'disponiveis' ? 'Nenhum lote disponível' : 'Nenhum lote no histórico'} />
      ) : (
        <VStack gap="md">
          <AppText variant="caption" color="textSecondary">Lotes de demonstração</AppText>
          {lista.map((l) => (
            <LoteItem key={l.id} lote={l} onPress={() => router.push(rotasAgricultor.detalheLote({ id: l.id }))} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}
