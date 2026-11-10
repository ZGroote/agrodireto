import { stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { classificarArquivo } from '@agrodireto/dominio';
import { otimizarImagem } from './imagem.ts';
import type { Resultado } from './tipos.ts';
import { otimizarVideo, type Executor } from './video.ts';

/**
 * Descobre o tipo do arquivo (pela mesma regra do app e do servidor, em @agrodireto/dominio)
 * e aplica a otimização certa. O arquivo otimizado vai para `pastaSaida`.
 */
export async function processarArquivo(entrada: string, nomeOriginal: string, pastaSaida: string, executar?: Executor): Promise<Resultado> {
  const bytesEntrada = (await stat(entrada)).size;
  const tipo = classificarArquivo({ nome: nomeOriginal });
  if (!tipo) return { status: 'falhou', bytesEntrada, motivo: 'Formato não aceito.' };

  const base = join(pastaSaida, parse(nomeOriginal).name);
  return tipo === 'foto' ? otimizarImagem(entrada, `${base}.webp`) : otimizarVideo(entrada, `${base}.mp4`, executar);
}
