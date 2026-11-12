import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { CalendarDays, FileText, MapPin, Package, Plus, Sprout } from 'lucide-react-native';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  DateField,
  Divider,
  EmptyState,
  ListRow,
  Screen,
  ScreenHeader,
  SegmentedControl,
  SelectField,
  StatusPill,
  TextField,
  VStack,
} from '@agrodireto/ui';
import {
  encerrarDemandaCompra,
  lerCatalogoDemandas,
  lerDataPrazo,
  listarMinhasDemandas,
  quantidadeDemandaValida,
  salvarDemandaCompra,
  type DemandaCompra,
  type ItemCatalogoDemanda,
  type UnidadeDemanda,
} from '@/lib/demandas';
import { mensagemEscolherEmpresa } from '@/lib/organizacoes';
import { rotasCliente } from '@/routes';

type Aba = 'abertas' | 'encerradas';

/** 30 · Demandas de compra — comprador aprovado publica, edita e encerra demandas da sua empresa (E03). */
export default function DemandasCompraScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('abertas');
  const [catalogo, setCatalogo] = useState<ItemCatalogoDemanda[]>([]);
  const [demandas, setDemandas] = useState<DemandaCompra[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'escolher' | 'sem-empresa' | 'erro'>('carregando');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [catalogoId, setCatalogoId] = useState<string>();
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState<UnidadeDemanda>();
  const [prazo, setPrazo] = useState('');
  const [observacao, setObservacao] = useState('');

  const carregar = useCallback(() => {
    let ativo = true;
    setEstado('carregando');
    setErro(null);
    void Promise.all([lerCatalogoDemandas(), listarMinhasDemandas()]).then(
      ([itens, res]) => {
        if (!ativo) return;
        setCatalogo(itens);
        setDemandas(res.demandas);
        setEstado('pronto');
      },
      (e) => {
        if (!ativo) return;
        const msg = e instanceof Error ? e.message : '';
        if (msg === mensagemEscolherEmpresa) setEstado('escolher');
        else if (msg.includes('Cadastre')) setEstado('sem-empresa');
        else setEstado('erro');
      },
    );
    return () => {
      ativo = false;
    };
  }, []);

  useFocusEffect(carregar);

  const culturaSelecionada = catalogo.find((c) => c.id === catalogoId);
  const unidadesDisponiveis = culturaSelecionada?.unidades ?? [];

  function abrirNova() {
    setEditandoId(null);
    setCatalogoId(undefined);
    setQuantidade('');
    setUnidade(undefined);
    setPrazo('');
    setObservacao('');
    setErro(null);
    setMostrarForm(true);
  }

  function abrirEdicao(d: DemandaCompra) {
    setEditandoId(d.id);
    setCatalogoId(d.catalogoId);
    setQuantidade(String(d.quantidade).replace('.', ','));
    setUnidade(d.unidade);
    setPrazo(d.prazo);
    setObservacao(d.observacao);
    setErro(null);
    setMostrarForm(true);
  }

  function trocarCultura(id: string) {
    setCatalogoId(id);
    const item = catalogo.find((c) => c.id === id);
    if (item && (!unidade || !item.unidades.includes(unidade))) {
      setUnidade(item.unidades[0]);
    }
  }

  const valido =
    !!catalogoId &&
    !!unidade &&
    unidadesDisponiveis.includes(unidade) &&
    quantidadeDemandaValida(quantidade) &&
    !!lerDataPrazo(prazo);

  async function salvar() {
    if (!valido || salvando || !catalogoId || !unidade) return;
    setSalvando(true);
    setErro(null);
    try {
      await salvarDemandaCompra(
        { catalogoId, quantidade, unidade, prazo, uf: 'SP', observacao },
        editandoId ?? undefined,
      );
      setMostrarForm(false);
      setEditandoId(null);
      carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar a demanda.');
    } finally {
      setSalvando(false);
    }
  }

  async function encerrar(id: string) {
    if (salvando) return;
    setSalvando(true);
    setErro(null);
    try {
      await encerrarDemandaCompra(id);
      setMostrarForm(false);
      setEditandoId(null);
      carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível encerrar a demanda.');
    } finally {
      setSalvando(false);
    }
  }

  const abertas = demandas.filter((d) => d.status === 'aberta');
  const encerradas = demandas.filter((d) => d.status === 'encerrada');
  const visiveis = aba === 'abertas' ? abertas : encerradas;

  return (
    <Screen
      header={<ScreenHeader title="Minhas demandas" subtitle="Publicar necessidades de compra (SP)" />}
      footer={
        estado === 'pronto' && !mostrarForm ? (
          <Button label="Nova demanda" icon={Plus} onPress={abrirNova} />
        ) : undefined
      }
    >
      {estado === 'carregando' && <AppText>Carregando…</AppText>}
      {estado === 'escolher' && (
        <VStack gap="md">
          <AppText>{mensagemEscolherEmpresa}</AppText>
          <Button label="Escolher empresa" onPress={() => router.push(rotasCliente.empresas)} />
        </VStack>
      )}
      {estado === 'sem-empresa' && (
        <VStack gap="md">
          <AppText>Cadastre e aprove sua empresa compradora antes de publicar demandas.</AppText>
          <Button label="Cadastro da empresa" onPress={() => router.push(rotasCliente.empresa)} />
        </VStack>
      )}
      {estado === 'erro' && (
        <VStack gap="md">
          <AppText>Não foi possível carregar as demandas. Verifique a aprovação da empresa e a conexão.</AppText>
          <Button label="Tentar novamente" onPress={carregar} />
        </VStack>
      )}

      {erro ? <AlertBanner tone="danger" title={erro} onPress={() => setErro(null)} /> : null}

      {estado === 'pronto' && mostrarForm && (
        <Card>
          <VStack gap="md">
            <AppText variant="heading">{editandoId ? 'Editar demanda' : 'Publicar demanda'}</AppText>
            <SelectField
              label="Cultura do catálogo"
              icon={Sprout}
              value={catalogoId}
              options={catalogo.map((c) => ({ label: c.nome, value: c.id }))}
              onChange={trocarCultura}
              emptyMessage="O catálogo de culturas ainda não foi carregado."
            />
            {unidadesDisponiveis.length > 0 && (
              <SelectField
                label="Unidade"
                icon={Package}
                value={unidade}
                options={unidadesDisponiveis.map((u) => ({ label: u, value: u }))}
                onChange={(v) => setUnidade(v as UnidadeDemanda)}
              />
            )}
            <TextField
              label="Quantidade desejada"
              placeholder="Ex.: 500"
              suffix={unidade ?? ''}
              keyboardType="decimal-pad"
              value={quantidade}
              onChangeText={setQuantidade}
              editable={!salvando}
            />
            <DateField label="Prazo limite (DD/MM/AAAA)" value={prazo} onChange={setPrazo} />
            <TextField label="UF (piloto)" icon={MapPin} value="SP" editable={false} />
            <TextField
              label="Observação / especificação"
              placeholder="Padrão desejado, janela de entrega, embalagem…"
              value={observacao}
              onChangeText={setObservacao}
              maxLength={1000}
              editable={!salvando}
            />
            <Button
              label={editandoId ? 'Salvar alterações' : 'Publicar demanda'}
              disabled={!valido || salvando}
              loading={salvando}
              onPress={() => void salvar()}
            />
            {editandoId && (
              <Button
                label="Encerrar demanda"
                variant="danger"
                disabled={salvando}
                onPress={() => void encerrar(editandoId)}
              />
            )}
            <Button
              label="Cancelar"
              variant="secondary"
              disabled={salvando}
              onPress={() => {
                setMostrarForm(false);
                setEditandoId(null);
              }}
            />
          </VStack>
        </Card>
      )}

      {estado === 'pronto' && !mostrarForm && (
        <VStack gap="md">
          <SegmentedControl
            value={aba}
            onChange={setAba}
            segments={[
              { key: 'abertas', label: 'Abertas', count: abertas.length },
              { key: 'encerradas', label: 'Encerradas', count: encerradas.length },
            ]}
          />
          {visiveis.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={aba === 'abertas' ? 'Nenhuma demanda aberta' : 'Nenhuma demanda encerrada'}
              description={
                aba === 'abertas'
                  ? 'Publique o que sua empresa precisa comprar para que produtores de SP vejam.'
                  : 'Demandas encerradas ficam registradas aqui.'
              }
            />
          ) : (
            <Card>
              {visiveis.map((d, i) => (
                <VStack key={d.id} gap="xs">
                  {i > 0 ? <Divider /> : null}
                  <ListRow
                    icon={CalendarDays}
                    title={`${d.cultura} · ${d.quantidade.toLocaleString('pt-BR')} ${d.unidade}`}
                    subtitle={[`Até ${d.prazo}`, d.uf, d.observacao].filter(Boolean).join(' · ')}
                    trailing={<StatusPill label={d.status === 'aberta' ? 'Aberta' : 'Encerrada'} />}
                    onPress={d.status === 'aberta' ? () => abrirEdicao(d) : undefined}
                  />
                </VStack>
              ))}
            </Card>
          )}
        </VStack>
      )}
    </Screen>
  );
}
