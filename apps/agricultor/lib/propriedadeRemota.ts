import { camposPropriedadeEnviada, type PropriedadeEnviada } from '@agrodireto/dominio';
import { camposPropriedadeVazios, lerRascunhoPropriedade, removerRascunhoPropriedade, type RascunhoPropriedade } from './rascunhoPropriedade';
import { organizacaoEmUso, trocarContexto } from './organizacoes';
import { supabase } from './supabase';

// ponytail: o app mostra uma propriedade por vez (a primeira enviada da organização escolhida); escolher entre várias vem com a tela de propriedades.
export async function lerPropriedadeEnviada(): Promise<PropriedadeEnviada | null> {
  if (!supabase) throw new Error();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error();
  const organizacao = await organizacaoEmUso();
  if (!organizacao) return null;
  const { data, error } = await supabase.from('propriedades').select(camposPropriedadeEnviada)
    .eq('organizacao_id', organizacao)
    .order('enviada_em').order('id').limit(1).maybeSingle<PropriedadeEnviada>();
  if (error) throw error;
  return data;
}

export async function enviarPropriedade(rascunho: RascunhoPropriedade, revisao?: string) {
  if (!supabase) throw new Error('Ambiente de integração indisponível.');
  const areaTexto = rascunho.area.trim().replace(',', '.');
  const area = Number(areaTexto);
  if (rascunho.nome.trim().length < 2 || rascunho.cidade.trim().length < 2 ||
    !/^[a-z]{2}$/i.test(rascunho.uf.trim()) || !/^\d+(?:\.\d+)?$/.test(areaTexto) ||
    !Number.isFinite(area) || area <= 0 || !rascunho.culturas.trim()) {
    throw new Error('Confira o nome, a cidade, a UF, a área e as culturas antes de enviar.');
  }
  const dados = {
    p_nome: rascunho.nome,
    p_cidade: rascunho.cidade,
    p_uf: rascunho.uf,
    p_area: area,
    p_culturas: rascunho.culturas,
  };
  const atual = revisao ? await lerPropriedadeEnviada() : null;
  if (revisao && !atual) throw new Error('O cadastro mudou. Volte e abra a versão atual.');
  const organizacao = atual ? null : await organizacaoEmUso();
  const { data: id, error } = atual
    ? await supabase.rpc('reenviar_propriedade', { ...dados, p_id: atual.id, p_enviada_em: revisao })
    : await supabase.rpc('enviar_propriedade', { ...dados, p_organizacao: organizacao });
  if (error?.code === 'PT409') throw new Error('O cadastro mudou. Volte e abra a versão atual.');
  if (error?.code === '23514') throw new Error('Confira a UF e os limites dos campos da propriedade.');
  if (error?.code === '42501' && organizacao) throw new Error('Você não faz mais parte desta organização. Escolha outra em Perfil > Organização.');
  if (error) throw new Error('Não foi possível enviar a propriedade. Tente novamente.');
  if (atual || organizacao) return;
  // Primeiro envio criou a organização: o próprio envio é a escolha do usuário.
  const { data: criada, error: erroLeitura } = await supabase.from('propriedades').select('organizacao_id')
    .eq('id', id as string).single<{ organizacao_id: string }>();
  const aviso = 'Propriedade enviada. Escolha a organização em Perfil > Organização.';
  if (erroLeitura) throw new Error(aviso);
  await trocarContexto(criada.organizacao_id).catch(() => { throw new Error(aviso); });
}

/**
 * Envia o rascunho do aparelho (inclusive o herdado de antes da conta) e só então apaga o local (C01).
 * A confirmação é o id devolvido por enviar_propriedade; falha em qualquer passo antes disso mantém o local.
 * Repetir não duplica: o servidor devolve a mesma propriedade (organização + nome).
 */
export async function enviarRascunhoPropriedade(rascunho: RascunhoPropriedade) {
  await enviarPropriedade(rascunho);
  // Envio confirmado; se apagar falhar, o rascunho sobra sem efeito (a tela passa a mostrar a enviada).
  await removerRascunhoPropriedade().catch(() => undefined);
}

/**
 * Dados do formulário da 26. Correção após "ajustes solicitados" abre os dados do SERVIDOR, não o rascunho
 * local (que já foi apagado após o envio). null: não há o que corrigir; a tela volta.
 */
export async function lerFormularioPropriedade(corrigir: boolean): Promise<{ campos: RascunhoPropriedade; revisao?: string } | null> {
  if (!corrigir) return { campos: (await lerRascunhoPropriedade()) ?? camposPropriedadeVazios };
  const enviada = await lerPropriedadeEnviada();
  if (enviada?.status !== 'ajustes_solicitados') return null;
  const { nome, cidade, uf, area, culturas, enviada_em } = enviada;
  return { campos: { nome, cidade, uf, area: String(area), culturas }, revisao: enviada_em };
}
