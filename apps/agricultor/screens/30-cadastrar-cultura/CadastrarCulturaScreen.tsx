import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, Ruler, Sprout, Trash2 } from 'lucide-react-native';
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
import { areaValida, lerCulturas, salvarCultura } from '@/lib/culturasLocais';
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
  const [cultura, setCultura] = useState('');
  const [variedade, setVariedade] = useState('');
  const [area, setArea] = useState('');
  const [plantio, setPlantio] = useState('');
  const [etapa, setEtapa] = useState<string>();
  const [foto, setFoto] = useState<string>();
  const [escolher, setEscolher] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [leitura, setLeitura] = useState<'carregando' | 'pronto' | 'erro'>(id ? 'carregando' : 'pronto');
  const [salvando, setSalvando] = useState(false);
  const gravando = useRef(false);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    void lerCulturas().then((culturas) => {
      if (!ativo) return;
      const registro = culturas.find((item) => item.id === id);
      if (!registro) {
        setLeitura('erro');
        return;
      }
      setCultura(registro.cultura);
      setVariedade(registro.variedade);
      setArea(registro.area);
      setPlantio(registro.plantio);
      setEtapa(registro.etapa || undefined);
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
  const valido = !!cultura.trim() && areaValida(area);
  async function salvar() {
    if (!valido || leitura !== 'pronto' || gravando.current) return;
    gravando.current = true;
    setSalvando(true);
    setErro(null);
    try {
      await salvarCultura({ cultura, variedade, area, plantio, etapa: etapa ?? '' }, id);
      router.back();
    } catch {
      setErro('Não foi possível salvar a cultura. Tente novamente.');
    } finally {
      gravando.current = false;
      setSalvando(false);
    }
  }

  if (leitura !== 'pronto') {
    return (
      <Screen header={<ScreenHeader title={titulo} />}>
        <AppText>{leitura === 'carregando' ? 'Carregando cultura…' : 'Não foi possível abrir a cultura.'}</AppText>
      </Screen>
    );
  }

  return (
    <Screen
      header={<ScreenHeader title={titulo} subtitle="Os dados da cultura ficam neste dispositivo." />}
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

      <TextField label="Cultura" icon={Sprout} value={cultura} onChangeText={setCultura} editable={!salvando} />
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
