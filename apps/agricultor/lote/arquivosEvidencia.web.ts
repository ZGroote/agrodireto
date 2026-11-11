const tabela = 'arquivos';

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open('agrodireto-evidencias', 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(tabela);
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
    pedido.onblocked = () => reject(new Error('Armazenamento de evidências indisponível'));
  });
}

async function executar<T>(modo: IDBTransactionMode, solicitar: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const banco = await abrirBanco();
  try {
    return await new Promise((resolve, reject) => {
      const transacao = banco.transaction(tabela, modo);
      const pedido = solicitar(transacao.objectStore(tabela));
      transacao.oncomplete = () => resolve(pedido.result);
      transacao.onabort = () => reject(transacao.error ?? pedido.error ?? new Error('Gravação interrompida'));
      transacao.onerror = () => reject(transacao.error ?? pedido.error);
    });
  } finally {
    banco.close();
  }
}

export async function armazenarEvidencia(chave: string, uri: string) {
  const resposta = await fetch(uri);
  if (!resposta.ok) throw new Error('Arquivo indisponível');
  const arquivo = await resposta.blob();
  if (!arquivo.size) throw new Error('Arquivo vazio');
  await executar('readwrite', (store) => store.put(arquivo, chave));
}

export async function abrirEvidencia(chave: string) {
  const arquivo: unknown = await executar('readonly', (store) => store.get(chave));
  if (!(arquivo instanceof Blob)) throw new Error('Evidência indisponível');
  const uri = URL.createObjectURL(arquivo);
  return { uri, liberar: () => URL.revokeObjectURL(uri) };
}

export async function apagarEvidencia(chave: string) {
  await executar('readwrite', (store) => store.delete(chave));
}

/** No navegador não há progresso de envio pelo fetch: avisa 0 e 1. Devolve o status HTTP. */
export async function enviarArquivoLocal(chave: string, url: string, mime: string, onProgresso: (fracao: number) => void) {
  const arquivo: unknown = await executar('readonly', (store) => store.get(chave));
  if (!(arquivo instanceof Blob) || !arquivo.size) throw new Error('Arquivo indisponível neste dispositivo.');
  onProgresso(0);
  const resposta = await fetch(url, { method: 'PUT', body: arquivo, headers: { 'content-type': mime, 'x-upsert': 'false' } });
  if (resposta.ok) onProgresso(1);
  return resposta.status;
}

export async function lerBytesEvidencia(chave: string, limite: number) {
  const arquivo: unknown = await executar('readonly', (store) => store.get(chave));
  if (!(arquivo instanceof Blob) || !arquivo.size) throw new Error('Arquivo indisponível neste dispositivo.');
  if (arquivo.size > limite) throw new Error('O arquivo ultrapassa 6 MiB.');
  return arquivo.arrayBuffer();
}
