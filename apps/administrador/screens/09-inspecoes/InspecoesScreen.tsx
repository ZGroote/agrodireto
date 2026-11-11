import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { rotulosInspecao } from '@agrodireto/dominio';
import { AppText, Button, Card, EmptyState, ListRow, Screen, ScreenHeader, VStack } from '@agrodireto/ui';
import { listarLotesInspecao, type LoteInspecao } from '@/lib/inspecoes';
import { rotasAdministrador } from '../../routes';

export default function InspecoesScreen() {
  const router = useRouter();
  const [pagina, setPagina] = useState(0);
  const [lotes, setLotes] = useState<LoteInspecao[]>([]);
  const [mensagem, setMensagem] = useState('Carregando lotes…');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setMensagem('Carregando lotes…');
    void listarLotesInspecao(pagina).then(
      (dados) => { if (ativo) { setLotes(dados); setMensagem(''); } },
      () => { if (ativo) { setLotes([]); setMensagem('Não foi possível carregar os lotes. Reabra a tela para tentar novamente.'); } },
    );
    return () => { ativo = false; };
  }, [pagina]));

  return (
    <Screen header={<ScreenHeader title="Inspeções" />}>
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {!mensagem && lotes.length === 0 && <EmptyState icon={ClipboardList} title="Nenhum lote nesta página" />}
      {!mensagem && lotes.map((lote) => (
        <Card key={lote.lote_id}>
          <ListRow icon={ClipboardList} title={lote.produto}
            subtitle={`${lote.quantidade} ${lote.unidade} · ${lote.resultado ? rotulosInspecao[lote.resultado] : 'Sem inspeção'}`}
            onPress={() => router.push(rotasAdministrador.inspecionar({ id: lote.lote_id }))} />
        </Card>
      ))}
      {!mensagem && (
        <VStack gap="sm">
          {pagina > 0 && <Button label="Página anterior" variant="secondary" onPress={() => setPagina(pagina - 1)} />}
          {lotes.length === 20 && pagina < 1000 && <Button label="Próxima página" variant="secondary" onPress={() => setPagina(pagina + 1)} />}
        </VStack>
      )}
    </Screen>
  );
}
