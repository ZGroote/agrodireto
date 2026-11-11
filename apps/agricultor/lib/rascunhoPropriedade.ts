import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const chave = '@agrodireto/agricultor/propriedade-rascunho/v1';
export const camposPropriedadeVazios = { nome: '', cidade: '', uf: '', area: '', culturas: '' };
export type RascunhoPropriedade = typeof camposPropriedadeVazios;

async function chaveDaConta() {
  const sessao = await supabase?.auth.getSession();
  const id = sessao?.data.session?.user.id;
  if (!id) throw new Error('Sessão indisponível');
  return `${chave}/${id}`;
}

export async function lerRascunhoPropriedade(): Promise<RascunhoPropriedade | null> {
  const chaveConta = await chaveDaConta();
  const donoLegado = `${chave}/dono-legado`;
  let json = await AsyncStorage.getItem(chaveConta);
  if (json === null) {
    const legado = await AsyncStorage.getItem(chave);
    const dono = await AsyncStorage.getItem(donoLegado);
    if (legado !== null && (dono === null || dono === chaveConta)) {
      await AsyncStorage.setItem(donoLegado, chaveConta);
      await AsyncStorage.setItem(chaveConta, legado);
      await AsyncStorage.removeItem(chave);
      json = legado;
    }
  }
  if (json === null) return null;

  const dados: unknown = JSON.parse(json);
  if (!dados || typeof dados !== 'object' || !Object.keys(camposPropriedadeVazios).every(
    (campo) => typeof Reflect.get(dados, campo) === 'string',
  )) {
    throw new Error('Rascunho inválido');
  }
  return dados as RascunhoPropriedade;
}

/** Só depois de o servidor confirmar o envio (C01): o rascunho local não some antes disso. */
export async function removerRascunhoPropriedade() {
  return AsyncStorage.removeItem(await chaveDaConta());
}

export async function salvarRascunhoPropriedade(campos: RascunhoPropriedade) {
  return AsyncStorage.setItem(await chaveDaConta(), JSON.stringify(campos));
}
