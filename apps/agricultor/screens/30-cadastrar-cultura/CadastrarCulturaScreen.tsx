import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, Ruler, Sprout, Trash2 } from 'lucide-react-native';
import { classificarArquivo, RETENCAO_DIAS_APOS_ENCERRAMENTO } from '@agrodireto/dominio';
import {
  AcaoSheet,
  ActionSheet,
  AddMediaButton,
  AlertBanner,
  AppText,
  Button,
  DateField,
  Screen,
  ScreenHeader,
  SelectField,
  spacing,
  TextField,
  TextLink,
} from '@agrodireto/ui';
import { CulturaFoto } from '@/components/CulturaFoto';
import { useCatalogo, useCulturaRascunho } from '@/hooks/dados';
import { definirFotoCultura, useFotoCultura } from '@/lib/fotoCultura';
import { opcoes } from '@/lib/opcoes';
import { escolherDaGaleria, usarCamera, type ArquivoEscolhido } from '@/lib/selecionarMidia';

/** 30 · Cadastrar cultura — foto (ícone da cultura), cultura, variedade, área, plantio e etapa. */
export default function CadastrarCulturaScreen() {
  const router = useRouter();
  const catalogo = useCatalogo();
  const r = useCulturaRascunho();
  const [cultura, setCultura] = useState<string | undefined>(r.cultura);
  const [variedade, setVariedade] = useState(r.variedade);
  const [area, setArea] = useState(r.area);
  const [plantio, setPlantio] = useState(r.plantio);
  const [etapa, setEtapa] = useState<string | undefined>(r.etapa);
  const [foto, setFoto] = useState<string | undefined>(useFotoCultura(r.cultura));
  const [escolher, setEscolher] = useState(false);

  const [erro, setErro] = useState<string | null>(null);

  /** A foto da cultura é uma só (vira o ícone). Valida o formato e guarda o arquivo escolhido. */
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

  const salvar = () => {
    if (cultura) definirFotoCultura(cultura, foto);
    router.back();
  };

  return (
    <Screen
      header={<ScreenHeader title="Cadastrar cultura" subtitle="Cadastre o que você está plantando para acompanhar a safra." />}
      footer={<Button label="Salvar cultura" disabled={!cultura || Number(area) <= 0} onPress={salvar} />}
    >
      <View style={styles.foto}>
        <AppText variant="label">Foto da cultura</AppText>
        <View style={styles.linha}>
          {foto && cultura ? <CulturaFoto cultura={cultura} tipo="tomate" size={76} /> : <AddMediaButton onPress={() => setEscolher(true)} />}
          <View style={styles.texto}>
            <AppText variant="caption" color="textSecondary">
              Esta imagem aparece como ícone da cultura em Produção e na Previsão de safra.
            </AppText>
            <TextLink label={foto ? 'Trocar foto' : 'Adicionar foto'} align="left" onPress={() => setEscolher(true)} />
          </View>
        </View>
        <AppText variant="caption" color="textSecondary">
          A foto da cultura é apagada {RETENCAO_DIAS_APOS_ENCERRAMENTO} dias depois que a produção é encerrada.
        </AppText>
        {erro ? <AlertBanner tone="danger" title="Foto não adicionada" description={erro} onPress={() => setErro(null)} /> : null}
      </View>

      <SelectField label="Cultura" icon={Sprout} value={cultura} options={opcoes(catalogo.produtos)} onChange={setCultura} emptyMessage="Catálogo de produtos ainda não carregado." />
      <TextField label="Variedade" placeholder="Ex.: Italiano" value={variedade} onChangeText={setVariedade} autoCapitalize="words" />
      <TextField label="Área plantada" icon={Ruler} suffix="ha" keyboardType="numeric" value={area} onChangeText={setArea} />
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
