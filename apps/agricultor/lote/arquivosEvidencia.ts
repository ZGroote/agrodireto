import { Directory, File, Paths } from 'expo-file-system';

const diretorio = () => new Directory(Paths.document, 'agrodireto-evidencias');

export async function armazenarEvidencia(chave: string, uri: string) {
  const pasta = diretorio();
  pasta.create({ idempotent: true });
  const origem = new File(uri);
  const destino = new File(pasta, chave);
  if (!origem.exists || origem.size <= 0) throw new Error('Arquivo indisponível');
  if (destino.exists && destino.size === origem.size) return;
  await origem.copy(destino, { overwrite: true });
}

export async function abrirEvidencia(chave: string): Promise<{ uri: string; liberar?: () => void }> {
  const arquivo = new File(diretorio(), chave);
  if (!arquivo.exists || arquivo.size <= 0) throw new Error('Evidência indisponível');
  return { uri: arquivo.uri };
}

export async function apagarEvidencia(chave: string) {
  const arquivo = new File(diretorio(), chave);
  if (arquivo.exists) arquivo.delete();
}
