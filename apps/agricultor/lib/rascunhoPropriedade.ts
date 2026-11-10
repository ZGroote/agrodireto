import AsyncStorage from '@react-native-async-storage/async-storage';

const chave = '@agrodireto/agricultor/propriedade-rascunho/v1';
export const camposPropriedadeVazios = { nome: '', cidade: '', uf: '', area: '', culturas: '' };
export type RascunhoPropriedade = typeof camposPropriedadeVazios;

export async function lerRascunhoPropriedade(): Promise<RascunhoPropriedade | null> {
  const json = await AsyncStorage.getItem(chave);
  if (json === null) return null;

  const dados: unknown = JSON.parse(json);
  if (!dados || typeof dados !== 'object' || !Object.keys(camposPropriedadeVazios).every(
    (campo) => typeof Reflect.get(dados, campo) === 'string',
  )) {
    throw new Error('Rascunho inválido');
  }
  return dados as RascunhoPropriedade;
}

export function salvarRascunhoPropriedade(campos: RascunhoPropriedade) {
  return AsyncStorage.setItem(chave, JSON.stringify(campos));
}
