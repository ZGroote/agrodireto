import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Film, Image as ImageIcon, Video } from 'lucide-react-native';
import { contarMidias, LIMITES_MIDIA, RETENCAO_DIAS_APOS_ENCERRAMENTO, validarNovasMidias, type ArquivoRecusado } from '@agrodireto/dominio';
import {
  AcaoSheet,
  ActionSheet,
  AddMediaButton,
  AlertBanner,
  AppText,
  Button,
  type FotoTipo,
  Screen,
  ScreenHeader,
  SelectField,
  spacing,
} from '@agrodireto/ui';
import { MiniaturaEvidencia } from '@/components/MiniaturaEvidencia';
import { useCatalogo } from '@/hooks/dados';
import { opcoes } from '@/lib/opcoes';
import { escolherDaGaleria, usarCamera, type ArquivoEscolhido } from '@/lib/selecionarMidia';
import { useLoteDraft, type EvidenciaDraft } from '@/lote/LoteDraftContext';
import { rotasAgricultor } from '@/routes';

const ILUSTRACOES: FotoTipo[] = ['tomate', 'caixas'];

/** 12 · Padrão do lote (2/3) — padrão, calibre, embalagem e evidências (até 100 fotos e 100 vídeos). */
export default function PadraoLoteScreen() {
  const router = useRouter();
  const { draft, update } = useLoteDraft();
  const catalogo = useCatalogo();
  const msg = 'Selecione um produto com padrões cadastrados.';
  const [adicionar, setAdicionar] = useState(false);
  const [recusados, setRecusados] = useState<ArquivoRecusado[]>([]);
  const usados = contarMidias(draft.evidencias);

  const receber = (arquivos: ArquivoEscolhido[]) => {
    if (arquivos.length === 0) return;
    const { aceitos, recusados: rec } = validarNovasMidias(draft.evidencias, arquivos);
    setRecusados(rec);
    const novas: EvidenciaDraft[] = aceitos.map(({ arquivo, tipo }, i) => ({
      id: `ev-${Date.now()}-${i}`,
      tipo,
      uri: (arquivo as ArquivoEscolhido).uri,
      nome: arquivo.nome,
    }));
    if (novas.length > 0) update({ evidencias: [...draft.evidencias, ...novas] });
  };

  const abrir = async (origem: 'camera' | 'galeria', tipo: 'foto' | 'video') => {
    try {
      const restantes = tipo === 'foto' ? LIMITES_MIDIA.fotos - usados.fotos : LIMITES_MIDIA.videos - usados.videos;
      if (restantes <= 0) {
        setRecusados([{ nome: tipo === 'foto' ? 'Fotos' : 'Vídeos', motivo: `Limite de ${tipo === 'foto' ? LIMITES_MIDIA.fotos : LIMITES_MIDIA.videos} atingido.` }]);
        return;
      }
      receber(origem === 'camera' ? await usarCamera(tipo) : await escolherDaGaleria(tipo, restantes));
    } catch (e) {
      setRecusados([{ nome: origem === 'camera' ? 'Câmera' : 'Galeria', motivo: e instanceof Error ? e.message : 'Não foi possível abrir.' }]);
    }
  };

  const acoes: AcaoSheet[] = [
    { label: 'Tirar foto', icon: Camera, onPress: () => void abrir('camera', 'foto') },
    { label: 'Escolher fotos da galeria', icon: ImageIcon, onPress: () => void abrir('galeria', 'foto') },
    { label: 'Gravar vídeo', icon: Video, onPress: () => void abrir('camera', 'video') },
    { label: 'Escolher vídeos da galeria', icon: Film, onPress: () => void abrir('galeria', 'video') },
  ];

  return (
    <Screen
      header={<ScreenHeader title="Padrão do lote" step="2/3" subtitle="Defina o padrão e a embalagem." />}
      footer={<Button label="Continuar" onPress={() => router.push(rotasAgricultor.precoLote)} />}
    >
      <SelectField label="Padrão" value={draft.padrao} options={opcoes(catalogo.padroes)} onChange={(padrao) => update({ padrao })} emptyMessage={msg} />
      <SelectField label="Calibre" value={draft.calibre} options={opcoes(catalogo.calibres)} onChange={(calibre) => update({ calibre })} emptyMessage={msg} />
      <SelectField label="Embalagem" value={draft.embalagem} options={opcoes(catalogo.embalagens)} onChange={(embalagem) => update({ embalagem })} emptyMessage={msg} />

      <View style={styles.evid}>
        <AppText variant="label">Evidências do lote ({draft.evidencias.length})</AppText>
        <AppText variant="caption" color="textSecondary">
          Fotos {usados.fotos}/{LIMITES_MIDIA.fotos} · Vídeos {usados.videos}/{LIMITES_MIDIA.videos}
        </AppText>
        <View style={styles.thumbs}>
          {draft.evidencias.map((e, i) => (
            <MiniaturaEvidencia
              key={e.id}
              uri={e.uri}
              tipo={e.tipo}
              ilustracao={ILUSTRACOES[i % ILUSTRACOES.length]}
              onRemove={() => update({ evidencias: draft.evidencias.filter((x) => x.id !== e.id) })}
            />
          ))}
          <AddMediaButton onPress={() => setAdicionar(true)} />
        </View>
        <AppText variant="caption" color="textSecondary">
          As fotos e os vídeos do lote são apagados {RETENCAO_DIAS_APOS_ENCERRAMENTO} dias depois que a produção é encerrada.
        </AppText>
      </View>

      {recusados.length > 0 ? (
        <AlertBanner
          tone="danger"
          title={recusados.length === 1 ? '1 arquivo não foi adicionado' : `${recusados.length} arquivos não foram adicionados`}
          description={recusados
            .slice(0, 3)
            .map((r) => `${r.nome}: ${r.motivo}`)
            .join('\n')}
          onPress={() => setRecusados([])}
        />
      ) : null}

      <ActionSheet visible={adicionar} onClose={() => setAdicionar(false)} title="Adicionar evidência" acoes={acoes} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  evid: { gap: spacing.sm },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
