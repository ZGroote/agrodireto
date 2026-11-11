import { useCallback, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AppText, Button, VStack, radius } from '@agrodireto/ui';
import { supabase } from '@/lib/supabase';

export function FotosCatalogo({ lote }: { lote: string }) {
  const [tentativa, setTentativa] = useState(0);
  return <Galeria key={lote + ':' + tentativa} lote={lote} recarregar={() => setTentativa((n) => n + 1)} />;
}

function Galeria({ lote, recarregar }: { lote: string; recarregar: () => void }) {
  const [fotos, setFotos] = useState<{ path: string; signedUrl: string }[]>([]);
  const [erro, setErro] = useState(false);

  useFocusEffect(useCallback(() => {
    const cliente = supabase;
    if (!cliente) return;
    let ativo = true;
    setFotos([]);
    setErro(false);

    async function carregar() {
      if (!cliente) return;
      const { data, error } = await cliente.rpc('listar_fotos_catalogo', { p_lote: lote });
      if (error || !Array.isArray(data)) throw new Error();
      const caminhos = (data as { arquivo: string }[]).map(({ arquivo }) => arquivo);
      if (!caminhos.length || !ativo) return;
      const links = await cliente.storage.from('fotos-catalogo').createSignedUrls(caminhos, 60);
      if (links.error) throw links.error;
      const prontas = links.data.flatMap(({ path, signedUrl }) => path && signedUrl ? [{ path, signedUrl }] : []);
      if (ativo) {
        setFotos(prontas);
        setErro(prontas.length !== caminhos.length);
      }
    }

    void carregar().catch(() => { if (ativo) setErro(true); });
    return () => { ativo = false; };
  }, [lote]));

  if (!erro && fotos.length === 0) return null;
  return (
    <VStack gap="sm">
      {fotos.length > 0 && <AppText variant="heading">Fotos do lote</AppText>}
      {fotos.map(({ path, signedUrl }, indice) => (
        <Image key={path} source={{ uri: signedUrl }} accessibilityLabel={`Foto ${indice + 1} do lote`}
          resizeMode="contain" style={styles.foto} onError={() => setErro(true)} />
      ))}
      {erro && <Button label="Recarregar fotos" variant="secondary" onPress={recarregar} />}
    </VStack>
  );
}
const styles = StyleSheet.create({
  foto: { width: '100%', height: 240, borderRadius: radius.card },
});
