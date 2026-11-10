import { Image } from 'react-native';
import { formatarDuracao, type Midia } from '@agrodireto/dominio';
import { Foto, radius } from '@agrodireto/ui';

type Props = {
  midia: Midia;
  /** Miniatura quadrada */
  tamanho?: number;
  /** Prévia larga (largura 100%) */
  altura?: number;
};

/**
 * Prévia da mídia: a foto de verdade quando o arquivo existe; vídeo e mídia de exemplo mostram a ilustração
 * (a miniatura real de vídeo vem com o processamento no servidor).
 */
export function MidiaPreview({ midia, tamanho, altura }: Props) {
  const real = midia.uri !== 'demo';
  if (midia.tipo === 'foto' && real) {
    const dim = tamanho ? { width: tamanho, height: tamanho } : { width: '100%' as const, height: altura ?? 150 };
    return <Image source={{ uri: midia.uri }} resizeMode="cover" style={[dim, { borderRadius: radius.media }]} accessibilityLabel="Foto" />;
  }
  return (
    <Foto
      tipo={midia.tipo === 'foto' ? 'sitio' : 'drone'}
      video={midia.tipo !== 'foto'}
      duracao={midia.duracaoSeg ? formatarDuracao(midia.duracaoSeg) : undefined}
      size={tamanho}
      height={altura}
    />
  );
}
