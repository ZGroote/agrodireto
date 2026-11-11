import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createClient } from '@supabase/supabase-js';
import { config } from './config.ts';
import { processarArquivo } from './processar.ts';
import type { Resultado } from './tipos.ts';
import { executarReal, type Executor } from './video.ts';

/**
 * Adaptador da tabela `midias` e da fila `assumir_proxima_midia` (supabase/migrations/20261111090000_midias_fila.sql).
 * Testado contra um PostgREST simulado; a migration ainda não foi aplicada no Supabase.
 */
export type TrabalhoMidia = {
  midiaId: string;
  /** Caminho do original no bucket `midias` (a extensão define foto ou vídeo) */
  caminho: string;
  /** Tentativa devolvida pela fila: só ela pode gravar o resultado */
  tentativa: number;
};

const BUCKET = 'midias';
const CONTENT_TYPE: Record<string, string> = { '.webp': 'image/webp', '.mp4': 'video/mp4' };

function exigir(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return valor;
}

const cliente = () => createClient(exigir('SUPABASE_URL'), exigir('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

/** Evita que um nome com "../" escape da pasta temporária. */
const nomeSeguro = (nome: string) => basename(nome).replace(/[^\w.\-]+/g, '_') || 'arquivo';

/** Limpeza opcional: uma falha aqui não desfaz o que já foi confirmado no banco. */
async function removerSemFalhar(storage: { remove(caminhos: string[]): Promise<{ error: { message: string } | null }> }, caminho: string, midiaId: string) {
  try {
    const removido = await storage.remove([caminho]);
    if (removido.error) throw new Error(removido.error.message);
  } catch (erro) {
    console.warn('Falha ao remover arquivo do Storage:', midiaId, caminho, erro);
  }
}

/**
 * Assume a próxima mídia da fila no banco. A linha em `midias` é o registro durável: se o worker cair,
 * ela volta para a fila quando o prazo vence (prazo do trabalho + 5 min de folga).
 */
export async function assumirProximaMidia(): Promise<TrabalhoMidia | null> {
  const { data, error } = await cliente().rpc('assumir_proxima_midia', { p_prazo_seg: Math.ceil((config.prazoTrabalhoMin + 5) * 60) });
  if (error) throw new Error(error.message);
  const linha = (data as { midia_id: string; caminho: string; tentativa: number }[] | null)?.[0];
  return linha ? { midiaId: linha.midia_id, caminho: linha.caminho, tentativa: linha.tentativa } : null;
}

/**
 * Baixa o original, otimiza, sobe a cópia sem metadados num caminho exclusivo e grava o resultado em `midias`.
 * O FFmpeg é encerrado ao fim do prazo do trabalho. Com `apagarOriginalAposOtimizar`, o original é removido depois da confirmação.
 */
export async function processarMidiaDoStorage(trabalho: TrabalhoMidia, executar: Executor = executarReal): Promise<Resultado> {
  const supabase = cliente();
  const pasta = await mkdtemp(join(config.pastaTemporaria, 'midia-'));
  const storage = supabase.storage.from(BUCKET);
  const sinal = AbortSignal.timeout(config.prazoTrabalhoMin * 60_000);
  // Cerca: só grava se a linha ainda estiver nesta tentativa (uma execução antiga não sobrescreve a nova).
  const daTentativa = <T extends { eq(coluna: string, valor: string | number): T }>(consulta: T) =>
    consulta.eq('id', trabalho.midiaId).eq('processamento', 'otimizando').eq('tentativas_processamento', trabalho.tentativa);

  try {
    const baixado = await storage.download(trabalho.caminho);
    if (baixado.error || !baixado.data) throw new Error(baixado.error?.message ?? 'Não foi possível baixar o original.');
    const nome = nomeSeguro(trabalho.caminho);
    const entrada = join(pasta, nome);
    // Baixa em fluxo para não carregar um vídeo inteiro na memória.
    await pipeline(Readable.fromWeb(baixado.data.stream() as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(entrada));

    const resultado = await processarArquivo(entrada, nome, pasta, (programa, argumentos) => executar(programa, argumentos, sinal));
    if (sinal.aborted) throw new Error(`Tempo limite de ${config.prazoTrabalhoMin} min esgotado.`);

    let publicado: string | null = null;
    if (resultado.status === 'pronta' && resultado.arquivoSaida) {
      const extensao = extname(resultado.arquivoSaida);
      const pastaOriginal = trabalho.caminho.slice(0, trabalho.caminho.lastIndexOf('/') + 1);
      publicado = `${pastaOriginal}otimizado-${randomUUID()}${extensao}`;
      // Arquivos muito grandes devem subir por upload retomável (tus).
      const enviado = await storage.upload(publicado, await readFile(resultado.arquivoSaida), {
        upsert: false,
        contentType: CONTENT_TYPE[extensao] ?? 'application/octet-stream',
      });
      if (enviado.error) throw new Error(enviado.error.message);
    }

    const atualizado = await daTentativa(supabase.from('midias').update({
      processamento: resultado.status,
      arquivo_publicado: publicado,
      tamanho_original_bytes: resultado.bytesEntrada,
      tamanho_final_bytes: resultado.bytesSaida ?? resultado.bytesEntrada,
      motivo_processamento: resultado.motivo ?? null,
    })).select('id').maybeSingle();
    if (atualizado.error) throw new Error(atualizado.error.message);
    if (!atualizado.data) {
      // Resposta sem ambiguidade: nenhuma linha aponta para o arquivo novo, então ele é removido.
      if (publicado) await removerSemFalhar(storage, publicado, trabalho.midiaId);
      throw new Error('A mídia mudou durante a otimização.');
    }

    if (config.apagarOriginalAposOtimizar && publicado) {
      await removerSemFalhar(storage, trabalho.caminho, trabalho.midiaId);
    }
    return resultado;
  } catch (e) {
    const motivo = e instanceof Error ? e.message : 'Erro ao processar a mídia.';
    // Em caso de resposta ambígua, preserve os arquivos: a atualização pode ter sido aplicada.
    const falha = await daTentativa(supabase.from('midias').update({ processamento: 'falhou', motivo_processamento: motivo }));
    if (falha.error) console.warn('Falha ao registrar erro de mídia:', trabalho.midiaId, falha.error.message);
    return { status: 'falhou', bytesEntrada: 0, motivo };
  } finally {
    await rm(pasta, { recursive: true, force: true });
  }
}
