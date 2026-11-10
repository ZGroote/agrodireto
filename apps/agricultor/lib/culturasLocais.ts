import AsyncStorage from '@react-native-async-storage/async-storage';

const chave = '@agrodireto/agricultor/culturas/v1';

export type DadosCultura = {
  cultura: string;
  variedade: string;
  area: string;
  plantio: string;
  etapa: string;
};

export type CulturaLocal = DadosCultura & { id: string };
const campos = ['id', 'cultura', 'variedade', 'area', 'plantio', 'etapa'] as const;

function culturaValida(valor: unknown): valor is CulturaLocal {
  return !!valor && typeof valor === 'object' && campos.every(
    (campo) => typeof Reflect.get(valor, campo) === 'string',
  );
}

export async function lerCulturas(): Promise<CulturaLocal[]> {
  const json = await AsyncStorage.getItem(chave);
  if (json === null) return [];
  const dados: unknown = JSON.parse(json);
  if (!Array.isArray(dados) || !dados.every(culturaValida)) {
    throw new Error('Registro de culturas inválido');
  }
  return dados;
}

export function areaValida(area: string) {
  const texto = area.trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(texto)) return false;
  const numero = Number(texto.replace(',', '.'));
  return Number.isFinite(numero) && numero > 0;
}

let gravacao = Promise.resolve();

export function salvarCultura(dados: DadosCultura, id?: string): Promise<void> {
  const operacao = gravacao.then(async () => {
    if (!dados.cultura.trim() || !areaValida(dados.area)) throw new Error('Cultura e área são obrigatórias');
    const culturas = await lerCulturas();
    const registro = {
      cultura: dados.cultura.trim(), variedade: dados.variedade.trim(),
      area: dados.area.trim(), plantio: dados.plantio, etapa: dados.etapa,
    };
    if (id) {
      const indice = culturas.findIndex((cultura) => cultura.id === id);
      if (indice === -1) throw new Error('Cultura não encontrada');
      culturas[indice] = { ...registro, id };
    } else {
      const base = Date.now().toString(36);
      let novoId = base;
      let sufixo = 0;
      while (culturas.some((cultura) => cultura.id === novoId)) {
        sufixo += 1;
        novoId = `${base}-${sufixo}`;
      }
      culturas.push({ ...registro, id: novoId });
    }
    await AsyncStorage.setItem(chave, JSON.stringify(culturas));
  });
  gravacao = operacao.catch(() => {});
  return operacao;
}
