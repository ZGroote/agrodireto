import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Clock, Eye, Film, Image as ImageIcon, Info, Plane, Video, X } from 'lucide-react-native';
import {
  AJUDA_FORMATOS,
  contarMidias,
  dataCurta,
  formatarTamanho,
  LIMITES_MIDIA,
  ROTULO_PROCESSAMENTO,
  ROTULO_TIPO,
  ROTULO_VISIBILIDADE,
  validarNovasMidias,
  type ArquivoRecusado,
  type Midia,
  type TipoMidia,
  type VisibilidadeMidia,
} from '@agrodireto/dominio';
import {
  AcaoSheet,
  ActionSheet,
  AlertBanner,
  AppText,
  Button,
  CampoUpload,
  colors,
  ProgressBar,
  radius,
  Screen,
  ScreenHeader,
  SelectField,
  sizes,
  spacing,
  StatusPill,
} from '@agrodireto/ui';
import { MidiaPreview } from '@/components/MidiaPreview';
import { useAgricultor, useMidias } from '@/hooks/dados';
import { escolherDaGaleria, usarCamera, type ArquivoEscolhido } from '@/lib/selecionarMidia';

const VISIBILIDADES = (Object.keys(ROTULO_VISIBILIDADE) as VisibilidadeMidia[]).map((v) => ({ label: ROTULO_VISIBILIDADE[v], value: v }));
const ICONE_TIPO = { foto: Camera, video: Film, drone: Plane } as const;

const hojeIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * 05 · Fotos e vídeos — envio de foto e de vídeo (inclui drone) com visibilidade.
 * Até 100 fotos e 100 vídeos; todos os formatos da lista do negócio. A mídia é COMPARTILHADA:
 * a equipe valida (app Administrador) e os compradores veem conforme a visibilidade (app Cliente).
 * Depois do envio, a otimização automática reduz o tamanho sem perder a resolução (ver DOC/midias-compartilhadas.md).
 */
export default function FotosVideosScreen() {
  const router = useRouter();
  const agricultor = useAgricultor();
  const [itens, setItens] = useState<Midia[]>(useMidias());
  const [selecionadaId, setSelecionadaId] = useState<string | undefined>(itens[0]?.id);
  const [sheet, setSheet] = useState<'foto' | 'video' | null>(null);
  const [recusados, setRecusados] = useState<ArquivoRecusado[]>([]);
  const [verFormatos, setVerFormatos] = useState(false);

  const selecionada = itens.find((m) => m.id === selecionadaId) ?? itens[0];
  const usados = contarMidias(itens);

  /** Valida o que o usuário escolheu e põe na fila o que passou. */
  const receber = (arquivos: ArquivoEscolhido[], comoDrone = false) => {
    if (arquivos.length === 0) return;
    const { aceitos, recusados: rec } = validarNovasMidias(itens, arquivos);
    const novas: Midia[] = aceitos.map(({ arquivo, tipo }, i) => {
      const a = arquivo as ArquivoEscolhido;
      const tipoFinal: TipoMidia = tipo === 'video' && comoDrone ? 'drone' : tipo;
      return {
        id: `local-${Date.now()}-${i}`,
        escopo: { tipo: 'propriedade', id: 'sitio-boa-vista' },
        tipo: tipoFinal,
        uri: a.uri,
        duracaoSeg: a.duracaoSeg,
        capturadaEm: hojeIso(),
        autor: agricultor.nome,
        local: agricultor.cidade,
        status: 'pendente',
        visibilidade: selecionada?.visibilidade ?? 'aprovados',
        envio: 0,
        processamento: 'aguardando',
        arquivoNome: a.nome,
        tamanhoOriginalBytes: a.tamanho,
      };
    });
    setRecusados(rec);
    if (novas.length > 0) {
      setItens((l) => [...l, ...novas]);
      setSelecionadaId(novas[novas.length - 1]?.id);
    }
  };

  /** Abre o seletor (câmera ou galeria) e trata falhas com mensagem legível. */
  const abrir = async (origem: 'camera' | 'galeria', tipo: 'foto' | 'video', comoDrone = false) => {
    try {
      const restantes = tipo === 'foto' ? LIMITES_MIDIA.fotos - usados.fotos : LIMITES_MIDIA.videos - usados.videos;
      if (restantes <= 0) {
        setRecusados([{ nome: tipo === 'foto' ? 'Fotos' : 'Vídeos', motivo: `Limite de ${tipo === 'foto' ? LIMITES_MIDIA.fotos : LIMITES_MIDIA.videos} atingido.` }]);
        return;
      }
      const arquivos = origem === 'camera' ? await usarCamera(tipo) : await escolherDaGaleria(tipo, restantes);
      receber(arquivos, comoDrone);
    } catch (e) {
      setRecusados([{ nome: origem === 'camera' ? 'Câmera' : 'Galeria', motivo: e instanceof Error ? e.message : 'Não foi possível abrir.' }]);
    }
  };

  const remover = (id: string) => {
    setItens((l) => l.filter((m) => m.id !== id));
    if (selecionadaId === id) setSelecionadaId(undefined);
  };

  const mudarVisibilidade = (visibilidade: VisibilidadeMidia) => {
    if (!selecionada) return;
    setItens((l) => l.map((m) => (m.id === selecionada.id ? { ...m, visibilidade } : m)));
  };

  const acoesFoto: AcaoSheet[] = [
    { label: 'Tirar foto', icon: Camera, onPress: () => void abrir('camera', 'foto') },
    { label: 'Escolher da galeria (várias)', icon: ImageIcon, onPress: () => void abrir('galeria', 'foto') },
  ];
  const acoesVideo: AcaoSheet[] = [
    { label: 'Gravar vídeo', icon: Video, onPress: () => void abrir('camera', 'video') },
    { label: 'Escolher da galeria (vários)', icon: Film, onPress: () => void abrir('galeria', 'video') },
    { label: 'Vídeo de drone', icon: Plane, onPress: () => void abrir('galeria', 'video', true) },
  ];

  const Icone = selecionada ? ICONE_TIPO[selecionada.tipo] : Camera;

  return (
    <Screen
      header={<ScreenHeader title="Fotos e vídeos" />}
      footer={<Button label="Enviar mídia" disabled={itens.length === 0} onPress={() => router.back()} />}
    >
      {selecionada ? (
        <>
          <MidiaPreview midia={selecionada} altura={160} />

          <View style={styles.meta}>
            <Icone size={sizes.iconMd} color={colors.textSecondary} />
            <View style={styles.flex}>
              <AppText variant="bodyStrong">
                {ROTULO_TIPO[selecionada.tipo]} · {dataCurta(selecionada.capturadaEm)}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {selecionada.autor} · {selecionada.local}
              </AppText>
              {selecionada.arquivoNome ? (
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                  {selecionada.arquivoNome}
                  {selecionada.tamanhoOriginalBytes ? ` · ${formatarTamanho(selecionada.tamanhoOriginalBytes)}` : ''}
                </AppText>
              ) : null}
            </View>
          </View>

          <View style={styles.pills}>
            {selecionada.status === 'pendente' ? <StatusPill label="Não verificado" tone="warning" icon={Clock} /> : null}
            {selecionada.status === 'verificada' ? <StatusPill label="Verificada" tone="success" /> : null}
            {selecionada.status === 'rejeitada' ? <StatusPill label="Rejeitada" tone="danger" /> : null}
            <StatusPill label={ROTULO_PROCESSAMENTO[selecionada.processamento]} tone={selecionada.processamento === 'falhou' ? 'danger' : 'info'} dot />
          </View>

          <SelectField label="Visibilidade" icon={Eye} value={selecionada.visibilidade} options={VISIBILIDADES} onChange={mudarVisibilidade} />

          {selecionada.envio !== undefined ? (
            <ProgressBar value={selecionada.envio} label={selecionada.envio > 0 ? 'Enviando…' : 'Na fila de envio'} />
          ) : null}
        </>
      ) : (
        <View style={styles.vazio}>
          <AppText variant="body" color="textSecondary" align="center">
            Nenhuma mídia. Adicione fotos ou vídeos abaixo.
          </AppText>
        </View>
      )}

      {recusados.length > 0 ? (
        <AlertBanner
          tone="danger"
          title={recusados.length === 1 ? '1 arquivo não foi adicionado' : `${recusados.length} arquivos não foram adicionados`}
          description={recusados
            .slice(0, 3)
            .map((r) => `${r.nome}: ${r.motivo}`)
            .join('\n') + (recusados.length > 3 ? `\ne mais ${recusados.length - 3}.` : '')}
          onPress={() => setRecusados([])}
        />
      ) : null}

      <View style={styles.secao}>
        <AppText variant="heading">Adicionar mídia</AppText>
        <AppText variant="caption" color="textSecondary">
          Fotos {usados.fotos}/{LIMITES_MIDIA.fotos} · Vídeos {usados.videos}/{LIMITES_MIDIA.videos}
        </AppText>
        <View style={styles.campos}>
          <CampoUpload icon={ImageIcon} label="Foto" descricao="Até 100 · JPG, PNG, HEIC e mais" onPress={() => setSheet('foto')} />
          <CampoUpload icon={Video} label="Vídeo" descricao="Até 100 · MP4, MOV, MKV e mais" onPress={() => setSheet('video')} />
        </View>
        <Pressable onPress={() => setVerFormatos((v) => !v)} accessibilityRole="button">
          <AppText variant="caption" color="primary">
            {verFormatos ? 'Ocultar formatos aceitos' : 'Ver todos os formatos aceitos'}
          </AppText>
        </Pressable>
        {verFormatos ? (
          <View style={styles.formatos}>
            <AppText variant="caption" color="textSecondary">
              {AJUDA_FORMATOS.fotos}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {AJUDA_FORMATOS.videos}
            </AppText>
          </View>
        ) : null}
      </View>

      {itens.length > 0 ? (
        <View style={styles.secao}>
          <AppText variant="heading">Mídias da propriedade ({itens.length})</AppText>
          <View style={styles.thumbs}>
            {itens.map((m) => (
              <View key={m.id} style={[styles.thumb, m.id === selecionada?.id && styles.thumbAtiva]}>
                <Pressable
                  onPress={() => setSelecionadaId(m.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${ROTULO_TIPO[m.tipo]} de ${dataCurta(m.capturadaEm)}`}
                >
                  <MidiaPreview midia={m} tamanho={76} />
                </Pressable>
                <Pressable onPress={() => remover(m.id)} hitSlop={6} accessibilityRole="button" accessibilityLabel="Remover" style={styles.remover}>
                  <X size={12} color={colors.textPrimary} strokeWidth={3} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Compartilhamento entre os apps e otimização automática. */}
      <View style={styles.aviso}>
        <Info size={sizes.iconMd} color={colors.info} />
        <AppText variant="caption" color="textSecondary" style={styles.flex}>
          A equipe AgroDireto valida cada mídia. Os compradores veem só o que a visibilidade permite; a mídia ainda não validada aparece com
          a etiqueta &quot;Não verificado&quot;. Depois do envio, as fotos e os vídeos são otimizados automaticamente (menor tamanho, mesma
          resolução).
        </AppText>
      </View>

      <ActionSheet visible={sheet === 'foto'} onClose={() => setSheet(null)} title="Adicionar foto" acoes={acoesFoto} />
      <ActionSheet visible={sheet === 'video'} onClose={() => setSheet(null)} title="Adicionar vídeo" acoes={acoesVideo} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  secao: { gap: spacing.sm },
  campos: { flexDirection: 'row', gap: spacing.sm },
  formatos: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.placeholder },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { borderRadius: radius.media + 2, borderWidth: 2, borderColor: colors.transparent },
  thumbAtiva: { borderColor: colors.primary },
  remover: {
    position: 'absolute',
    top: spacing.xs + 2,
    right: spacing.xs + 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vazio: { paddingVertical: spacing.xl },
  aviso: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.infoSoft },
});
