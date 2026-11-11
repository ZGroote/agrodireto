import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Film, Image as ImageIcon, Video } from 'lucide-react-native';
import { contarMidias, LIMITES_MIDIA, validarNovasMidias, type ArquivoRecusado } from '@agrodireto/dominio';
import {
  AcaoSheet,
  ActionSheet,
  AddMediaButton,
  AlertBanner,
  AppText,
  Screen,
  ScreenHeader,
  SelectField,
  spacing,
  TextField,
} from '@agrodireto/ui';
import { MiniaturaEvidenciaLote } from '@/lote/MiniaturaEvidenciaLote';
import { atributosParaServidor, CAMPOS_SEGMENTO, faltandoObrigatorio } from '@/lote/atributosSegmento';
import { useCulturasLote } from '@/lote/useCulturasLote';
import { escolherDaGaleria, usarCamera, type ArquivoEscolhido } from '@/lib/selecionarMidia';
import { useLoteDraft, type EvidenciaDraft } from '@/lote/LoteDraftContext';
import { LoteDraftFooter } from '@/lote/LoteDraftFooter';
import { rotasAgricultor } from '@/routes';

/** 12 · Padrão do lote (2/3) — atributos do segmento da cultura (D09) e evidências (até 100 fotos e 100 vídeos). */
export default function PadraoLoteScreen() {
  const router = useRouter();
  const { id, draft, update } = useLoteDraft();
  const culturas = useCulturasLote();
  const segmento = draft.segmento ?? culturas.find((c) => c.id === draft.culturaId)?.segmento;
  const campos = segmento ? CAMPOS_SEGMENTO[segmento] : [];
  const falta = faltandoObrigatorio(segmento, draft.unidade, draft.atributos);
  // Mantém padrão/calibre/embalagem (texto) em dia: a revisão (14) e a publicação seguem lendo esses campos.
  const mudar = (chave: string, valor: string) => {
    const atributos = { ...draft.atributos, [chave]: valor };
    let textos = {};
    try {
      const r = atributosParaServidor(segmento, draft.unidade, atributos);
      textos = { padrao: r.p_padrao, calibre: r.p_calibre, embalagem: r.p_embalagem };
    } catch { /* número ainda incompleto: o envio mostra o erro */ }
    update({ segmento, atributos, ...textos });
  };
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
      header={<ScreenHeader title="Padrão do lote" step="2/3" subtitle="Defina o padrão e a embalagem." onBack={() => router.dismissTo(rotasAgricultor.rascunhoLote(id, 'novo'))} />}
      footer={<LoteDraftFooter etapa="padrao" proxima="preco" disabled={!!falta} />}
    >
      {!segmento && <AppText color="textSecondary">Selecione a cultura do lote na etapa anterior.</AppText>}
      {segmento && campos.length === 0 && <AppText color="textSecondary">Este segmento ainda não tem campos de padrão.</AppText>}
      {campos.map((campo) => campo.tipo === 'lista' ? (
        <SelectField key={campo.chave} label={campo.rotulo} value={draft.atributos[campo.chave]} options={campo.opcoes ?? []}
          onChange={(valor) => mudar(campo.chave, valor)} />
      ) : (
        <TextField key={campo.chave} label={campo.rotulo} value={draft.atributos[campo.chave] ?? ''}
          keyboardType={campo.tipo === 'numero' ? 'decimal-pad' : 'default'} maxLength={campo.tipo === 'numero' ? 7 : 60}
          onChangeText={(valor) => mudar(campo.chave, valor)} />
      ))}
      {!!falta && <AppText variant="caption" color="textSecondary">Para continuar, preencha: {falta}.</AppText>}

      <View style={styles.evid}>
        <AppText variant="label">Evidências do lote ({draft.evidencias.length})</AppText>
        <AppText variant="caption" color="textSecondary">
          Fotos {usados.fotos}/{LIMITES_MIDIA.fotos} · Vídeos {usados.videos}/{LIMITES_MIDIA.videos}
        </AppText>
        <View style={styles.thumbs}>
          {draft.evidencias.map((e) => (
            <MiniaturaEvidenciaLote
              key={e.id}
              loteId={id}
              evidencia={e}
              remover={() => update({ evidencias: draft.evidencias.filter((x) => x.id !== e.id) })}
            />
          ))}
          <AddMediaButton onPress={() => setAdicionar(true)} />
        </View>
        <AppText variant="caption" color="textSecondary">
          Ao salvar ou continuar, os arquivos são guardados neste dispositivo.
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
