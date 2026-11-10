import * as ImagePicker from 'expo-image-picker';

/** Arquivo escolhido pelo usuário (galeria ou câmera), já normalizado. */
export type ArquivoEscolhido = {
  uri: string;
  nome: string;
  mime?: string;
  tamanho?: number;
  duracaoSeg?: number;
  largura?: number;
  altura?: number;
};

type Tipo = 'foto' | 'video';

function normalizar(a: ImagePicker.ImagePickerAsset): ArquivoEscolhido {
  const nomeDaUri = a.uri.split('/').pop()?.split('?')[0] ?? 'arquivo';
  return {
    uri: a.uri,
    nome: a.fileName ?? nomeDaUri,
    mime: a.mimeType,
    tamanho: a.fileSize,
    // O seletor informa a duração do vídeo em milissegundos.
    duracaoSeg: a.duration ? Math.round(a.duration / 1000) : undefined,
    largura: a.width,
    altura: a.height,
  };
}

/**
 * Abre a galeria e devolve os arquivos escolhidos (vários de uma vez).
 * `maximo` é quantos ainda cabem no limite do produto. Sem recompressão: a qualidade original vai ao envio,
 * e a otimização acontece depois, no processamento automático.
 */
export async function escolherDaGaleria(tipo: Tipo, maximo: number): Promise<ArquivoEscolhido[]> {
  if (maximo <= 0) return [];
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: tipo === 'foto' ? ['images'] : ['videos'],
    allowsMultipleSelection: true,
    selectionLimit: maximo,
    quality: 1,
  });
  return r.canceled ? [] : r.assets.map(normalizar);
}

/** Abre a câmera para uma foto ou um vídeo. Lança erro com texto legível se a câmera não estiver disponível. */
export async function usarCamera(tipo: Tipo): Promise<ArquivoEscolhido[]> {
  const permissao = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissao.granted) throw new Error('Permita o uso da câmera nas configurações do aparelho.');
  const r = await ImagePicker.launchCameraAsync({
    mediaTypes: tipo === 'foto' ? ['images'] : ['videos'],
    quality: 1,
  });
  return r.canceled ? [] : r.assets.map(normalizar);
}
