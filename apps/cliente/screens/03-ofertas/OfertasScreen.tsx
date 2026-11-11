import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import type { OfertaCatalogo } from '@agrodireto/dominio';
import { AppText, Button, Card, EmptyState, ListRow, Screen, ScreenHeader, SearchField } from '@agrodireto/ui';
import { consultarCatalogo } from '@/lib/ofertas';
import { rotasCliente } from '@/routes';

export default function OfertasScreen() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [ofertas, setOfertas] = useState<OfertaCatalogo[]>([]);
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setCarregando(true);
    setMensagem('');
    const timer = setTimeout(() => {
      void consultarCatalogo(busca, pagina).then(
        (dados) => {
          if (!ativo) return;
          setOfertas(dados);
          setTemMais(dados.length === 20);
        },
        (erro: unknown) => {
          if (ativo) setMensagem(erro instanceof Error ? erro.message : 'Não foi possível consultar o catálogo.');
        },
      ).finally(() => { if (ativo) setCarregando(false); });
    }, pagina === 0 && tentativa === 0 ? 250 : 0);
    return () => { ativo = false; clearTimeout(timer); };
  }, [busca, pagina, tentativa]));

  return (
    <Screen withTabBar header={<ScreenHeader title="Ofertas" />}>
      <SearchField value={busca} onChangeText={(valor) => { setBusca(valor); setPagina(0); setTentativa(0); setOfertas([]); }} placeholder="Buscar produtos" />
      {!carregando && !mensagem && ofertas.map((oferta) => (
        <Card key={oferta.id}>
          <ListRow
            title={oferta.produto}
            subtitle={`${oferta.fornecedor} · ${oferta.cidade}/${oferta.uf}\n${oferta.quantidade} ${oferta.unidade} · R$ ${(oferta.preco_centavos / 100).toFixed(2).replace('.', ',')}/${oferta.unidade}`}
            onPress={() => router.push(rotasCliente.oferta({ id: oferta.id }))}
          />
        </Card>
      ))}
      {carregando && <AppText>Carregando ofertas…</AppText>}
      {!!mensagem && <><AppText accessibilityLiveRegion="polite">{mensagem}</AppText><Button label="Tentar novamente" onPress={() => setTentativa((n) => n + 1)} /></>}
      {!carregando && !mensagem && ofertas.length === 0 && <EmptyState icon={Leaf} title="Nenhuma oferta encontrada" />}
      {!carregando && !mensagem && pagina > 0 && <Button label="Página anterior" onPress={() => setPagina((n) => n - 1)} />}
      {!carregando && !mensagem && temMais && <Button label="Próxima página" onPress={() => setPagina((n) => n + 1)} />}
    </Screen>
  );
}
