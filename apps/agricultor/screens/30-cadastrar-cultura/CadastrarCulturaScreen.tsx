import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Home, Image as ImageIcon, Ruler, Sprout, Trash2 } from 'lucide-react-native';
import { classificarArquivo } from '@agrodireto/dominio';
import {
  AcaoSheet,
  ActionSheet,
  AddMediaButton,
  AlertBanner,
  AppText,
  Button,
  DateField,
  MediaThumb,
  Screen,
  ScreenHeader,
  SelectField,
  spacing,
  TextField,
  TextLink,
} from '@agrodireto/ui';
import { useCatalogo } from '@/hooks/dados';
import { areaValida, lerCatalogo, lerCulturas, lerPropriedades, salvarCultura, type ItemCatalogo } from '@/lib/culturas';
import { opcoes } from '@/lib/opcoes';
import { escolherDaGaleria, usarCamera, type ArquivoEscolhido } from '@/lib/selecionarMidia';

/** 30 · Cadastrar cultura — foto (ícone da cultura), cultura, variedade, área, plantio e etapa. */
export default function CadastrarCulturaScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <FormularioCultura key={id ?? 'nova'} id={id} />;
}

function FormularioCultura({ id }: { id?: string }) {
  const router = useRouter();
  const catalogo = useCatalogo();
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [propriedades, setPropriedades] = useState<{ id: string; nome: string }[]>([]);
  const [propriedadeId, setPropriedadeId] = useState<string>();
  const [catalogoId, setCatalogoId] = useState<string>();
  const [variedade, setVariedade] = useState('');
  const [area, setArea] = useState('');
  const [plantio, setPlantio] = useState('');
  const [etapa, setEtapa] = useState<string>();
  const [foto, setFoto] = useState<string>();
  const [escolher, setEscolher] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [leitura, setLeitura] = useState<'carregando' | 'pronto' | 'erro' | 'sem-propriedade'>('carregando');
  const [salvando, setSalvando] = useState(false);
  const gravando = useRef(false);

  useEffect(() => {
    let ativo = true;
    void Promise.all([lerCatalogo(), lerPropriedades(), id ? lerCulturas() : Promise.resolve([])]).then(([catalogoRemoto, props, culturas]) => {
      if (!ativo) return;
      setItens(catalogoRemoto);
      setPropriedades(props);
      if (!props.length) {
        setLeitura('sem-propriedade');
        return;
      }
      setPropriedadeId(props[0].id);
      if (id) {
        const registro = culturas.find((item) => item.id === id);
        if (!registro) {
          setLeitura('erro');
          return;
        }
        setPropriedadeId(registro.propriedadeId);
        setCatalogoId(registro.catalogoId);
        // Cultura desativada no catálogo continua aparecendo na edição.
        if (!catalogoRemoto.some((item) => item.id === registro.catalogoId)) {
          setItens([...catalogoRemoto, { id: registro.catalogoId, nome: registro.cultura, unidades: registro.unidades }]);
        }
        setVariedade(registro.variedade);
        setArea(registro.area);
        setPlantio(registro.plantio);
        setEtapa(registro.etapa || undefined);
      }
      setLeitura('pronto');
    }, () => {
      if (ativo) setLeitura('erro');
    });
    return () => { ativo = false; };
  }, [id]);

  /** A foto é uma prévia da sessão até o armazenamento de mídia ser conectado. */
  const receber = (arquivos: ArquivoEscolhido[]) => {
    const a = arquivos[0];
    if (!a) return;
    if (classificarArquivo(a) !== 'foto') {
      setErro(`${a.nome}: formato não aceito para foto.`);
      return;
    }
    setErro(null);
    setFoto(a.uri);
  };
  const abrir = async (origem: 'camera' | 'galeria') => {
    try {
      receber(origem === 'camera' ? await usarCamera('foto') : await escolherDaGaleria('foto', 1));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível abrir.');
    }
  };
  const acoes: AcaoSheet[] = [
    { label: 'Tirar foto', icon: Camera, onPress: () => void abrir('camera') },
    { label: 'Escolher da galeria', icon: ImageIcon, onPress: () => void abrir('galeria') },
    ...(foto ? [{ label: 'Remover foto', icon: Trash2, tone: 'danger' as const, onPress: () => setFoto(undefined) }] : []),
  ];

  const titulo = id ? 'Editar cultura' : 'Cadastrar cultura';
  const valido = !!propriedadeId && !!catalogoId && areaValida(area);
  async function salvar() {
    if (!valido || leitura !== 'pronto' || gravando.current) return;
    gravando.current = true;
    setSalvando(true);
    setErro(null);
    try {
      await salvarCultura({ propriedadeId: propriedadeId ?? '', catalogoId: catalogoId ?? '', variedade, area, plantio, etapa: etapa ?? '' }, id);
      router.back();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar a cultura. Tente novamente.');
    } finally {
      gravando.current = false;
      setSalvando(false);
    }
  }

  if (leitura !== 'pronto') {
    return (
      <Screen header={<ScreenHeader title={titulo} />}>
        <AppText>
          {leitura === 'carregando' ? 'Carregando…'
            : leitura === 'sem-propriedade' ? 'Envie o cadastro da propriedade antes de cadastrar culturas.'
              : 'Não foi possível abrir a cultura. Verifique a conexão e tente novamente.'}
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen
      header={<ScreenHeader title={titulo} subtitle="A cultura fica salva na sua conta." />}
      footer={<Button label="Salvar cultura" disabled={!valido} loading={salvando} onPress={() => void salvar()} />}
    >
      <View style={styles.foto}>
        <AppText variant="label">Foto da cultura</AppText>
        <View style={styles.linha}>
          {foto ? <MediaThumb source={{ uri: foto }} /> : <AddMediaButton onPress={() => setEscolher(true)} />}
          <View style={styles.texto}>
            <AppText variant="caption" color="textSecondary">
              Prévia da foto nesta tela.
            </AppText>
            <TextLink label={foto ? 'Trocar foto' : 'Adicionar foto'} align="left" onPress={() => setEscolher(true)} />
          </View>
        </View>
        {erro ? <AlertBanner tone="danger" title={erro} onPress={() => setErro(null)} /> : null}
      </View>

      {propriedades.length > 1 && (
        <SelectField label="Propriedade" icon={Home} value={propriedadeId}
          options={propriedades.map((p) => ({ label: p.nome, value: p.id }))} onChange={setPropriedadeId} />
      )}
      <SelectField label="Cultura" icon={Sprout} value={catalogoId}
        options={itens.map((item) => ({ label: item.nome, value: item.id }))} onChange={setCatalogoId}
        emptyMessage="O catálogo de culturas do piloto ainda não foi publicado." />
      <TextField label="Variedade" placeholder="Ex.: Italiano" value={variedade} onChangeText={setVariedade} autoCapitalize="words" />
      <TextField label="Área plantada" icon={Ruler} suffix="ha" keyboardType="decimal-pad" value={area} onChangeText={setArea} editable={!salvando} />
      {!!area.trim() && !areaValida(area) && <AppText variant="caption">Informe uma área maior que zero em hectares.</AppText>}
      <DateField label="Data do plantio" value={plantio} onChange={setPlantio} />
      <SelectField label="Etapa" value={etapa} options={opcoes(catalogo.etapas)} onChange={setEtapa} />

      <ActionSheet visible={escolher} onClose={() => setEscolher(false)} title="Foto da cultura" acoes={acoes} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  foto: { gap: spacing.sm },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  texto: { flex: 1, gap: spacing.xxs },
});
