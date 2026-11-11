import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Package, Plus } from 'lucide-react-native';
import { AppText, Card, EmptyState, ListRow, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';
import { lerRascunhosLote, nomesEtapas, type RascunhoSalvo } from '@/lote/rascunhosLote';
import { listarOfertasProprias } from '@/lib/ofertas';
import { rotasAgricultor } from '@/routes';

type Aba = 'publicados' | 'retirados';

export default function MeusLotesScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('publicados');
  const [rascunhos, setRascunhos] = useState<RascunhoSalvo[]>([]);
  const [ofertas, setOfertas] = useState<Awaited<ReturnType<typeof listarOfertasProprias>>>([]);
  const [erroRascunhos, setErroRascunhos] = useState(false);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setEstado('carregando');
    void lerRascunhosLote().then(
      (registros) => { if (ativo) { setRascunhos(registros); setErroRascunhos(false); } },
      () => { if (ativo) setErroRascunhos(true); },
    );
    void listarOfertasProprias().then(
      (dados) => { if (ativo) { setOfertas(dados); setEstado('pronto'); } },
      () => { if (ativo) setEstado('erro'); },
    );
    return () => { ativo = false; };
  }, []));

  const publicados = ofertas.filter((item) => item.retirada_em === null);
  const retirados = ofertas.filter((item) => item.retirada_em !== null);
  const lista = aba === 'publicados' ? publicados : retirados;
  const locais = rascunhos.filter((rascunho) => !ofertas.some((oferta) => oferta.rascunho_id === rascunho.id));

  return (
    <Screen withTabBar header={<ScreenHeader title="Meus lotes" action={{ icon: Plus, label: 'Novo lote', onPress: () => router.push(rotasAgricultor.novoLote) }} />}>
      {erroRascunhos && <AppText>Não foi possível abrir os rascunhos deste dispositivo.</AppText>}
      {!erroRascunhos && locais.length > 0 && (
        <Card>
          <AppText variant="heading">Rascunhos neste dispositivo</AppText>
          {locais.map(({ id, etapa, campos }) => (
            <ListRow key={id} title={campos.produto?.trim() || 'Lote em preparação'} subtitle={nomesEtapas[etapa]} onPress={() => router.push(rotasAgricultor.rascunhoLote(id, etapa))} />
          ))}
        </Card>
      )}
      <SegmentedControl value={aba} onChange={setAba} segments={[
        { key: 'publicados', label: 'Publicados', count: publicados.length },
        { key: 'retirados', label: 'Retirados', count: retirados.length },
      ]} />
      {estado === 'carregando' && <AppText>Carregando lotes…</AppText>}
      {estado === 'erro' && <AppText>Não foi possível consultar as ofertas. Abra esta tela novamente para tentar.</AppText>}
      {estado === 'pronto' && lista.length === 0 && <EmptyState icon={Package} title={aba === 'publicados' ? 'Nenhum lote publicado' : 'Nenhum lote retirado'} />}
      {estado === 'pronto' && lista.map((lote) => (
        <Card key={lote.id}>
          <ListRow title={lote.produto} subtitle={`${lote.quantidade} ${lote.unidade}`} onPress={() => router.push(rotasAgricultor.detalheLote({ id: lote.id }))} />
        </Card>
      ))}
    </Screen>
  );
}
