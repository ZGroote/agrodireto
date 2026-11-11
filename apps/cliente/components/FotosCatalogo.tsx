import { useCallback, useState } from 'react';
import { Image, Linking, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Clock, Play } from 'lucide-react-native';
import { AppText, Button, StatusPill, VStack, radius } from '@agrodireto/ui';
import { supabase } from '@/lib/supabase';

type Midia = { arquivo: string; tipo: 'foto' | 'video' };

/** Foto: link de 60 s (a imagem baixa de uma vez). Vídeo: 15 min, porque o player busca por partes enquanto toca. */
const VALIDADE_FOTO_SEG = 60;
const VALIDADE_VIDEO_SEG = 900;

export function FotosCatalogo({ lote }: { lote: string }) {
  const [tentativa, setTentativa] = useState(0);
  return <Galeria key={lote + ':' + tentativa} lote={lote} recarregar={() => setTentativa((n) => n + 1)} />;
}

/** Só aparece o que a equipe aprovou e o produtor autorizou (listar_fotos_catalogo); o resto nunca chega aqui. */
function Galeria({ lote, recarregar }: { lote: string; recarregar: () => void }) {
  const [fotos, setFotos] = useState<{ path: string; signedUrl: string }[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [carregada, setCarregada] = useState(false);
  const [erro, setErro] = useState('');

  useFocusEffect(useCallback(() => {
    const cliente = supabase;
    if (!cliente) return;
    let ativo = true;

    async function carregar() {
      if (!cliente) return;
      const { data, error } = await cliente.rpc('listar_fotos_catalogo', { p_lote: lote });
      if (error || !Array.isArray(data)) throw new Error();
      const midias = data as Midia[];
      const caminhos = midias.filter((m) => m.tipo === 'foto').map((m) => m.arquivo);
      let prontas: { path: string; signedUrl: string }[] = [];
      if (caminhos.length) {
        const links = await cliente.storage.from('fotos-catalogo').createSignedUrls(caminhos, VALIDADE_FOTO_SEG);
        if (links.error) throw links.error;
        prontas = links.data.flatMap(({ path, signedUrl }) => path && signedUrl ? [{ path, signedUrl }] : []);
      }
      if (!ativo) return;
      setFotos(prontas);
      setVideos(midias.filter((m) => m.tipo === 'video').map((m) => m.arquivo));
      setErro(prontas.length !== caminhos.length ? 'Algumas fotos não carregaram.' : '');
      setCarregada(true);
    }

    void carregar().catch(() => { if (ativo) setErro('Não foi possível carregar as fotos e os vídeos.'); });
    return () => { ativo = false; };
  }, [lote]));

  async function assistir(arquivo: string) {
    setErro('');
    try {
      if (!supabase) throw new Error();
      const { data, error } = await supabase.storage.from('fotos-catalogo').createSignedUrl(arquivo, VALIDADE_VIDEO_SEG);
      if (error) throw error;
      await Linking.openURL(data.signedUrl);
    } catch {
      setErro('Não foi possível abrir o vídeo.');
    }
  }

  const vazia = carregada && fotos.length === 0 && videos.length === 0;
  if (!carregada && !erro) return null;
  return (
    <VStack gap="sm">
      {vazia && !erro && (
        <>
          <StatusPill label="Não verificado" tone="warning" icon={Clock} />
          <AppText variant="caption" color="textSecondary">
            Este lote ainda não tem fotos ou vídeos verificados pela equipe AgroDireto.
          </AppText>
        </>
      )}
      {(fotos.length > 0 || videos.length > 0) && <AppText variant="heading">Fotos e vídeos do lote</AppText>}
      {fotos.map(({ path, signedUrl }, indice) => (
        <Image key={path} source={{ uri: signedUrl }} accessibilityLabel={`Foto ${indice + 1} do lote`}
          resizeMode="contain" style={styles.foto} onError={() => setErro('Algumas fotos não carregaram.')} />
      ))}
      {videos.map((arquivo, indice) => (
        <Button key={arquivo} icon={Play} variant="secondary" label={`Assistir vídeo ${indice + 1}`} onPress={() => void assistir(arquivo)} />
      ))}
      {!!erro && (
        <>
          <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">{erro}</AppText>
          <Button label="Recarregar" variant="secondary" onPress={recarregar} />
        </>
      )}
    </VStack>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', height: 240, borderRadius: radius.card },
});
