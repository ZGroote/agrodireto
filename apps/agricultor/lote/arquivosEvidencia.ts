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

/** PUT do arquivo guardado direto do disco (sem carregar na memória), com progresso de 0 a 1. Devolve o status HTTP. */
export async function enviarArquivoLocal(chave: string, url: string, mime: string, onProgresso: (fracao: number) => void) {
  const arquivo = new File(diretorio(), chave);
  if (!arquivo.exists || arquivo.size <= 0) throw new Error('Arquivo indisponível neste dispositivo.');
  const { status } = await arquivo.upload(url, {
    httpMethod: 'PUT',
    headers: { 'content-type': mime, 'x-upsert': 'false' },
    onProgress: ({ bytesSent, totalBytes }) => onProgresso(totalBytes > 0 ? bytesSent / totalBytes : 0),
  });
  return status;
}

export async function lerBytesEvidencia(chave: string, limite: number) {
  const arquivo = new File(diretorio(), chave);
  if (!arquivo.exists || arquivo.size <= 0) throw new Error('Arquivo indisponível neste dispositivo.');
  if (arquivo.size > limite) throw new Error('O arquivo ultrapassa 6 MiB.');
  return arquivo.arrayBuffer();
}
