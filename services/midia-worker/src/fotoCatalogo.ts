import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.ts';
import { prepararCopiaFoto } from './copiaFoto.ts';

type Registro = { arquivo: string; copia_catalogo: string | null };
type FotoPendente = { lote_id: string; chave: string };
type ResultadoPendente = FotoPendente & ({ caminho: string } | { erro: string });
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const chaveValida = /^[a-z0-9-]{1,80}$/;

export async function prepararFotosPendentes(cliente: SupabaseClient, informar: (resultado: ResultadoPendente) => void) {
  const tamanhoPagina = 25;
  let ultima: FotoPendente | undefined;
  let concluidas = 0;
  let falhas = 0;

  while (true) {
    const consulta = cliente.from('evidencias_lote').select('lote_id,chave')
      .eq('tipo', 'foto').eq('revisao', 'aprovada').eq('autorizada_catalogo', true)
      .is('copia_catalogo', null).order('lote_id').order('chave').limit(tamanhoPagina);
    if (ultima) {
      consulta.or(`lote_id.gt.${ultima.lote_id},and(lote_id.eq.${ultima.lote_id},chave.gt.${ultima.chave})`);
    }
    const { data, error } = await consulta;
    if (error) throw new Error('Não foi possível consultar as fotos pendentes.');

    for (const foto of data) {
      let caminho: string;
      try {
        caminho = await prepararFotoCatalogo(cliente, foto.lote_id, foto.chave);
      } catch (erro) {
        falhas++;
        informar({ ...foto, erro: erro instanceof Error ? erro.message : 'Falha ao preparar a foto.' });
        continue;
      }
      concluidas++;
      informar({ ...foto, caminho });
    }
    if (data.length < tamanhoPagina) return { concluidas, falhas };
    ultima = data.at(-1);
  }
}

export async function prepararFotoCatalogo(cliente: SupabaseClient, lote: string, chave: string) {
  if (!uuid.test(lote) || !chaveValida.test(chave)) throw new Error('Informe um lote e uma chave válidos.');
  const { data, error } = await cliente.from('evidencias_lote').select('arquivo,copia_catalogo')
    .eq('lote_id', lote).eq('chave', chave).eq('tipo', 'foto')
    .eq('revisao', 'aprovada').eq('autorizada_catalogo', true).maybeSingle<Registro>();
  if (error) throw new Error('Não foi possível consultar a evidência.');
  if (!data) throw new Error('Foto aprovada e autorizada não encontrada.');
  if (data.copia_catalogo) return data.copia_catalogo;

  const [produtor, loteOrigem, arquivo, ...sobras] = data.arquivo.split('/');
  const extensao = arquivo?.split('.').at(-1);
  if (!produtor || !uuid.test(produtor) || loteOrigem !== lote || sobras.length ||
      !extensao || !['jpg', 'png', 'webp'].includes(extensao) || arquivo !== chave + '.' + extensao) {
    throw new Error('O caminho do original não corresponde à evidência.');
  }

  const pasta = await mkdtemp(join(config.pastaTemporaria, 'agro-catalogo-'));
  try {
    const { data: original, error: falhaDownload } = await cliente.storage.from('evidencias-lote').download(data.arquivo);
    if (falhaDownload || !original || original.size > 6 * 1024 * 1024) {
      throw new Error('Original indisponível ou acima do limite de tamanho.');
    }
    const entrada = join(pasta, 'original');
    const saida = join(pasta, 'copia.webp');
    await writeFile(entrada, Buffer.from(await original.arrayBuffer()));
    const resultado = await prepararCopiaFoto(entrada, saida);
    if (resultado.status !== 'pronta') throw new Error(resultado.motivo ?? 'A cópia não foi preparada.');

    const caminho = lote + '/' + chave + '.webp';
    const { error: falhaEnvio } = await cliente.storage.from('fotos-catalogo')
      .upload(caminho, await readFile(saida), { contentType: 'image/webp', upsert: true, cacheControl: '0' });
    if (falhaEnvio) throw new Error('Não foi possível gravar a cópia privada.');

    const registro = await cliente.from('evidencias_lote').update({ copia_catalogo: caminho })
      .eq('lote_id', lote).eq('chave', chave).eq('arquivo', data.arquivo)
      .eq('revisao', 'aprovada').eq('autorizada_catalogo', true)
      .select('copia_catalogo').maybeSingle<{ copia_catalogo: string }>();
    if (registro.error || registro.data?.copia_catalogo !== caminho) {
      throw new Error('A cópia foi gravada, mas não foi liberada. Confira a autorização e tente novamente.');
    }
    return caminho;
  } finally {
    await rm(pasta, { recursive: true, force: true });
  }
}
