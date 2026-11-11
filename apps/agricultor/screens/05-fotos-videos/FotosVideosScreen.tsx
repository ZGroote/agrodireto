import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Camera, Clock, Film, Home, Image as ImageIcon, Info, Lock, Plane, Video, X } from 'lucide-react-native';
import {
  AJUDA_FORMATOS,
  contarMidias,
  dataCurta,
  formatarTamanho,
  LIMITES_MIDIA,
  ROTULO_PROCESSAMENTO,
  ROTULO_TIPO,
  validarNovasMidias,
  type ArquivoRecusado,
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
import { lerPropriedades } from '@/lib/culturas';
import {
  adicionarPendentes,
  descartarPendente,
  enviarPendente,
  lerPendentes,
  linksTemporarios,
  listarMidias,
  uriLocal,
  type ArquivoNovo,
  type MidiaPendente,
  type MidiaRemota,
} from '@/lib/midiasRemotas';
import { escolherDaGaleria, usarCamera, type ArquivoEscolhido } from '@/lib/selecionarMidia';

/** Item da tela: a mídia ainda no aparelho (fila de envio) ou a registrada no servidor. */
type Item = { id: string; tipo: 'foto' | 'video'; data: string; pendente?: MidiaPendente; remota?: MidiaRemota };

const recusadaNoEnvio = (m: MidiaRemota) => m.processamento === 'falhou' && !m.enviada_em;

/**
 * 05 · Fotos e vídeos da propriedade — envio persistente ao bucket privado `midias` (D07).
 * Até 100 fotos e 100 vídeos; todos os formatos da lista do negócio. O arquivo fica no aparelho até o servidor
 * confirmar: reiniciar o app não perde nada e "Tentar de novo" não cria mídia duplicada.
 * Depois do envio, a otimização automática reduz o tamanho sem perder a resolução (ver DOC/midias-compartilhadas.md).
 */
export default function FotosVideosScreen() {
  const [propriedades, setPropriedades] = useState<{ id: string; nome: string }[]>([]);
  const [propriedadeId, setPropriedadeId] = useState<string>();
  const [leitura, setLeitura] = useState<'carregando' | 'pronto' | 'erro' | 'sem-propriedade'>('carregando');
  const [remotas, setRemotas] = useState<MidiaRemota[]>([]);
  const [pendentes, setPendentes] = useState<MidiaPendente[]>([]);
  const [previas, setPrevias] = useState<Record<string, string>>({});
  const [progresso, setProgresso] = useState<Record<string, number>>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState<string>();
  const [selecionadaId, setSelecionadaId] = useState<string>();
  const [sheet, setSheet] = useState<'foto' | 'video' | null>(null);
  const [recusados, setRecusados] = useState<ArquivoRecusado[]>([]);
  const [verFormatos, setVerFormatos] = useState(false);

  useEffect(() => {
    lerPropriedades().then(
      (lista) => {
        setPropriedades(lista);
        setPropriedadeId(lista[0]?.id);
        setLeitura(lista.length > 0 ? 'pronto' : 'sem-propriedade');
      },
      () => setLeitura('erro'),
    );
  }, []);

  const carregar = useCallback(async (id: string) => {
    const [lista, fila] = await Promise.all([listarMidias(id), lerPendentes(id)]);
    setRemotas(lista);
    setPendentes(fila);
    const novas: Record<string, string> = await linksTemporarios(lista).catch(() => ({}));
    for (const m of fila) {
      if (m.tipo === 'foto') novas[m.chave] = await uriLocal(m).catch(() => '');
    }
    setPrevias(novas);
  }, []);

  useEffect(() => {
    if (!propriedadeId) return;
    setLeitura('carregando');
    carregar(propriedadeId).then(() => setLeitura('pronto'), () => setLeitura('erro'));
  }, [propriedadeId, carregar]);

  // A cópia no aparelho vale mais que a reserva no servidor enquanto o envio não foi confirmado.
  const itens: Item[] = [
    ...remotas.filter((r) => !pendentes.some((p) => p.chave === r.chave))
      .map((r) => ({ id: r.id, tipo: r.tipo, data: r.criada_em.slice(0, 10), remota: r })),
    ...pendentes.map((p) => ({ id: p.chave, tipo: p.tipo, data: p.criadaEm.slice(0, 10), pendente: p })),
  ];
  const selecionada = itens.find((m) => m.id === selecionadaId) ?? itens[0];
  const usados = contarMidias(itens.filter((m) => !m.remota || !recusadaNoEnvio(m.remota)));

  /** Valida o que o usuário escolheu e guarda na fila do aparelho o que passou. */
  const receber = async (arquivos: ArquivoEscolhido[]) => {
    if (arquivos.length === 0 || !propriedadeId) return;
    const { aceitos, recusados: rec } = validarNovasMidias(itens, arquivos);
    const novos: ArquivoNovo[] = aceitos.map(({ arquivo, tipo }) => ({ ...(arquivo as ArquivoEscolhido), tipo }));
    const { adicionadas, falhas } = await adicionarPendentes(propriedadeId, novos);
    setRecusados([...rec, ...falhas]);
    if (adicionadas.length === 0) return;
    const uris: Record<string, string> = {};
    for (const m of adicionadas) if (m.tipo === 'foto') uris[m.chave] = await uriLocal(m).catch(() => '');
    setPendentes((l) => [...l, ...adicionadas]);
    setPrevias((p) => ({ ...p, ...uris }));
    setSelecionadaId(adicionadas[adicionadas.length - 1]?.chave);
  };

  /** Abre o seletor (câmera ou galeria) e trata falhas com mensagem legível. */
  const abrir = async (origem: 'camera' | 'galeria', tipo: 'foto' | 'video') => {
    try {
      const restantes = tipo === 'foto' ? LIMITES_MIDIA.fotos - usados.fotos : LIMITES_MIDIA.videos - usados.videos;
      if (restantes <= 0) {
        setRecusados([{ nome: tipo === 'foto' ? 'Fotos' : 'Vídeos', motivo: `Limite de ${tipo === 'foto' ? LIMITES_MIDIA.fotos : LIMITES_MIDIA.videos} atingido.` }]);
        return;
      }
      const arquivos = origem === 'camera' ? await usarCamera(tipo) : await escolherDaGaleria(tipo, restantes);
      await receber(arquivos);
    } catch (e) {
      setRecusados([{ nome: origem === 'camera' ? 'Câmera' : 'Galeria', motivo: e instanceof Error ? e.message : 'Não foi possível abrir.' }]);
    }
  };

  /** Envia em sequência (uma por vez, para o progresso ser legível); falhas ficam na fila com o motivo. */
  const enviar = async (lista: MidiaPendente[]) => {
    if (enviando || !propriedadeId) return;
    for (const m of lista) {
      setEnviando(m.chave);
      setErros((e) => ({ ...e, [m.chave]: '' }));
      try {
        const resultado = await enviarPendente(m, (fracao) => setProgresso((p) => ({ ...p, [m.chave]: fracao })));
        if (resultado === 'recusada') setRecusados((r) => [...r, { nome: m.nome, motivo: m.tipo === 'foto' ? 'Foto acima de 20 MiB.' : 'Vídeo acima de 50 MiB.' }]);
      } catch (e) {
        setErros((err) => ({ ...err, [m.chave]: e instanceof Error ? e.message : 'Não foi possível enviar. Tente novamente.' }));
      }
    }
    setEnviando(undefined);
    setProgresso({});
    await carregar(propriedadeId).catch(() => setLeitura('erro'));
  };

  const remover = async (m: MidiaPendente) => {
    if (enviando) return;
    await descartarPendente(m).catch(() => undefined);
    setPendentes((l) => l.filter((p) => p.chave !== m.chave));
    if (selecionadaId === m.chave) setSelecionadaId(undefined);
  };

  const acoesFoto: AcaoSheet[] = [
    { label: 'Tirar foto', icon: Camera, onPress: () => void abrir('camera', 'foto') },
    { label: 'Escolher da galeria (várias)', icon: ImageIcon, onPress: () => void abrir('galeria', 'foto') },
  ];
  const acoesVideo: AcaoSheet[] = [
    { label: 'Gravar vídeo', icon: Video, onPress: () => void abrir('camera', 'video') },
    { label: 'Escolher da galeria (vários)', icon: Film, onPress: () => void abrir('galeria', 'video') },
    { label: 'Vídeo de drone', icon: Plane, onPress: () => void abrir('galeria', 'video') },
  ];

  const Icone = selecionada?.tipo === 'video' ? Film : Camera;
  const p = selecionada?.pendente;
  const r = selecionada?.remota;
  const tamanho = p?.tamanho ?? r?.tamanho_original_bytes ?? undefined;
  const fracao = p ? progresso[p.chave] : undefined;

  return (
    <Screen
      header={<ScreenHeader title="Fotos e vídeos" />}
      footer={
        <Button label={pendentes.length > 1 ? `Enviar ${pendentes.length} mídias` : 'Enviar mídia'} loading={!!enviando}
          disabled={pendentes.length === 0} onPress={() => void enviar(pendentes)} />
      }
    >
      {leitura === 'sem-propriedade' || leitura === 'erro' ? (
        <AlertBanner tone={leitura === 'erro' ? 'danger' : 'info'}
          title={leitura === 'erro' ? 'Não foi possível carregar as mídias' : 'Nenhuma propriedade cadastrada'}
          description={leitura === 'erro' ? 'Verifique a conexão e abra a tela novamente.' : 'Envie o cadastro da propriedade antes de adicionar fotos e vídeos.'} />
      ) : null}

      {propriedades.length > 1 ? (
        <SelectField label="Propriedade" icon={Home} value={propriedadeId}
          options={propriedades.map((o) => ({ label: o.nome, value: o.id }))} onChange={setPropriedadeId} />
      ) : null}

      {selecionada ? (
        <>
          <MidiaPreview midia={{ tipo: selecionada.tipo, uri: previas[selecionada.id] ?? '', duracaoSeg: p?.duracaoSeg }} altura={160} />

          <View style={styles.meta}>
            <Icone size={sizes.iconMd} color={colors.textSecondary} />
            <View style={styles.flex}>
              <AppText variant="bodyStrong">
                {ROTULO_TIPO[selecionada.tipo]} · {dataCurta(selecionada.data)}
              </AppText>
              {p || tamanho ? (
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                  {[p?.nome, tamanho ? formatarTamanho(tamanho) : ''].filter(Boolean).join(' · ')}
                </AppText>
              ) : null}
            </View>
          </View>

          <View style={styles.pills}>
            <StatusPill label="Privada" tone="neutral" icon={Lock} />
            {p ? (
              erros[p.chave] ? <StatusPill label="Falha no envio" tone="danger" />
                : <StatusPill label={enviando === p.chave ? 'Enviando' : 'Na fila de envio'} tone="warning" icon={Clock} />
            ) : null}
            {r && recusadaNoEnvio(r) ? <StatusPill label="Recusada" tone="danger" /> : null}
            {r && !r.enviada_em && !recusadaNoEnvio(r) ? <StatusPill label="Envio não concluído" tone="warning" icon={Clock} /> : null}
            {r?.enviada_em ? (
              <StatusPill label={ROTULO_PROCESSAMENTO[r.processamento]} tone={r.processamento === 'falhou' ? 'danger' : 'info'} dot />
            ) : null}
          </View>

          {r?.motivo_processamento ? <AppText variant="caption" color="textSecondary">{r.motivo_processamento}</AppText> : null}

          {p ? (
            <>
              <ProgressBar value={fracao ?? 0}
                label={fracao !== undefined && fracao > 0 ? `Enviando… ${Math.round(fracao * 100)}%` : 'Na fila de envio'} />
              {erros[p.chave] ? (
                <>
                  <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">{erros[p.chave]}</AppText>
                  <Button label="Tentar de novo" variant="secondary" disabled={!!enviando} onPress={() => void enviar([p])} />
                </>
              ) : null}
            </>
          ) : null}
        </>
      ) : leitura === 'pronto' ? (
        <View style={styles.vazio}>
          <AppText variant="body" color="textSecondary" align="center">
            Nenhuma mídia. Adicione fotos ou vídeos abaixo.
          </AppText>
        </View>
      ) : null}

      {recusados.length > 0 ? (
        <AlertBanner
          tone="danger"
          title={recusados.length === 1 ? '1 arquivo não foi adicionado' : `${recusados.length} arquivos não foram adicionados`}
          description={recusados
            .slice(0, 3)
            .map((rec) => `${rec.nome}: ${rec.motivo}`)
            .join('\n') + (recusados.length > 3 ? `\ne mais ${recusados.length - 3}.` : '')}
          onPress={() => setRecusados([])}
        />
      ) : null}

      {propriedadeId ? (
        <View style={styles.secao}>
          <AppText variant="heading">Adicionar mídia</AppText>
          <AppText variant="caption" color="textSecondary">
            Fotos {usados.fotos}/{LIMITES_MIDIA.fotos} · Vídeos {usados.videos}/{LIMITES_MIDIA.videos}
          </AppText>
          <View style={styles.campos}>
            <CampoUpload icon={ImageIcon} label="Foto" descricao="Até 100 · 20 MB cada · JPG, PNG, HEIC e mais" onPress={() => setSheet('foto')} />
            <CampoUpload icon={Video} label="Vídeo" descricao="Até 100 · 50 MB e 60 s cada · MP4, MOV e mais" onPress={() => setSheet('video')} />
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
      ) : null}

      {itens.length > 0 ? (
        <View style={styles.secao}>
          <AppText variant="heading">Mídias da propriedade ({itens.length})</AppText>
          <View style={styles.thumbs}>
            {itens.map((m) => (
              <View key={m.id} style={[styles.thumb, m.id === selecionada?.id && styles.thumbAtiva]}>
                <Pressable
                  onPress={() => setSelecionadaId(m.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${ROTULO_TIPO[m.tipo]} de ${dataCurta(m.data)}`}
                >
                  <MidiaPreview midia={{ tipo: m.tipo, uri: previas[m.id] ?? '', duracaoSeg: m.pendente?.duracaoSeg }} tamanho={76} />
                </Pressable>
                {m.pendente ? (
                  <Pressable onPress={() => m.pendente && void remover(m.pendente)} hitSlop={6} accessibilityRole="button"
                    accessibilityLabel="Remover da fila de envio" style={styles.remover}>
                    <X size={12} color={colors.textPrimary} strokeWidth={3} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.aviso}>
        <Info size={sizes.iconMd} color={colors.info} />
        <AppText variant="caption" color="textSecondary" style={styles.flex}>
          As mídias ficam privadas: só a sua organização e a equipe AgroDireto podem vê-las. O arquivo fica guardado no aparelho até o
          envio ser confirmado. Depois do envio, as fotos e os vídeos são otimizados automaticamente (menor tamanho, mesma resolução).
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
