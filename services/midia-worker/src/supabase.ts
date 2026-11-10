import { createWriteStream } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createClient } from '@supabase/supabase-js';
import { config } from './config.ts';
import { processarArquivo } from './processar.ts';
import type { Resultado } from './tipos.ts';

/**
 * ATENÇÃO: este adaptador NÃO foi testado contra um projeto Supabase real (o banco ainda não existe).
 * A lógica de otimização (imagem.ts e video.ts) é testada e independente dele.
 * Esperado: tabela `midias` com as colunas processamento, arquivo, tamanho_original_bytes,
 * tamanho_final_bytes e motivo_processamento (ver DOC/midias-compartilhadas.md).
 */
export type TrabalhoMidia = {
  midiaId: string;
  bucket: string;
  /** Caminho do original no Storage */
  caminho: string;
  /** Nome original do arquivo (com a extensão que o usuário enviou) */
  nomeOriginal: string;
};

const CONTENT_TYPE: Record<string, string> = { '.webp': 'image/webp', '.mp4': 'video/mp4' };

function exigir(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return valor;
}

/** Evita que um nome com "../" escape da pasta temporária. */
const nomeSeguro = (nome: string) => basename(nome).replace(/[^\w.\-]+/g, '_') || 'arquivo';

/** "propriedade/ab/foto.heic" + ".webp" → "propriedade/ab/foto.webp" */
const trocarExtensao = (caminho: string, extensao: string) => caminho.slice(0, caminho.length - extname(caminho).length) + extensao;

/**
 * Baixa o original do Storage, otimiza, sobe o resultado e atualiza a linha em `midias`.
 * Com `apagarOriginalAposOtimizar`, o original é removido depois do sucesso, para não acumular volume.
 */
export async function processarMidiaDoStorage(trabalho: TrabalhoMidia): Promise<Resultado> {
  const supabase = createClient(exigir('SUPABASE_URL'), exigir('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const pasta = await mkdtemp(join(config.pastaTemporaria, 'midia-'));

  try {
    await supabase.from('midias').update({ processamento: 'otimizando' }).eq('id', trabalho.midiaId);

    const baixado = await supabase.storage.from(trabalho.bucket).download(trabalho.caminho);
    if (baixado.error || !baixado.data) throw new Error(baixado.error?.message ?? 'Não foi possível baixar o original.');
    const nome = nomeSeguro(trabalho.nomeOriginal);
    const entrada = join(pasta, nome);
    // Baixa em fluxo para não carregar um vídeo inteiro na memória.
    await pipeline(Readable.fromWeb(baixado.data.stream() as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(entrada));

    const resultado = await processarArquivo(entrada, nome, pasta);

    let caminhoFinal = trabalho.caminho;
    if (resultado.status === 'pronta' && resultado.arquivoSaida) {
      const extensao = extname(resultado.arquivoSaida);
      caminhoFinal = trocarExtensao(trabalho.caminho, extensao);
      // Arquivos muito grandes devem subir por upload retomável (tus); aqui o resultado já é menor que o original.
      const enviado = await supabase.storage.from(trabalho.bucket).upload(caminhoFinal, await readFile(resultado.arquivoSaida), {
        upsert: true,
        contentType: CONTENT_TYPE[extensao] ?? 'application/octet-stream',
      });
      if (enviado.error) throw new Error(enviado.error.message);
      if (config.apagarOriginalAposOtimizar && caminhoFinal !== trabalho.caminho) {
        await supabase.storage.from(trabalho.bucket).remove([trabalho.caminho]);
      }
    }

    await supabase
      .from('midias')
      .update({
        processamento: resultado.status,
        arquivo: caminhoFinal,
        tamanho_original_bytes: resultado.bytesEntrada,
        tamanho_final_bytes: resultado.bytesSaida ?? resultado.bytesEntrada,
        motivo_processamento: resultado.motivo ?? null,
      })
      .eq('id', trabalho.midiaId);

    return resultado;
  } catch (e) {
    const motivo = e instanceof Error ? e.message : 'Erro ao processar a mídia.';
    await supabase.from('midias').update({ processamento: 'falhou', motivo_processamento: motivo }).eq('id', trabalho.midiaId);
    return { status: 'falhou', bytesEntrada: 0, motivo };
  } finally {
    await rm(pasta, { recursive: true, force: true });
  }
}
