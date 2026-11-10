import AsyncStorage from '@react-native-async-storage/async-storage';

const chave = '@agrodireto/agricultor/culturas/v1';

export type DadosCultura = {
  cultura: string;
  variedade: string;
  area: string;
  plantio: string;
  etapa: string;
};

export type PrevisaoLocal = {
  estimativaKg: number;
  colheita: string;
  minimoKg?: number;
  maximoKg?: number;
};

export type CulturaLocal = DadosCultura & { id: string; previsao?: PrevisaoLocal };
const campos = ['id', 'cultura', 'variedade', 'area', 'plantio', 'etapa'] as const;

export function lerDataColheita(texto: string): Date | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (data.getFullYear() !== Number(ano) || data.getMonth() !== Number(mes) - 1 || data.getDate() !== Number(dia)) {
    return null;
  }
  return data;
}

function kgPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isSafeInteger(valor) && valor > 0;
}

export function previsaoValida(valor: unknown): valor is PrevisaoLocal {
  if (!valor || typeof valor !== 'object') return false;
  const { estimativaKg, colheita, minimoKg, maximoKg } = valor as Record<string, unknown>;
  if (!kgPositivo(estimativaKg) || typeof colheita !== 'string' || !lerDataColheita(colheita)) return false;
  if (minimoKg === undefined && maximoKg === undefined) return true;
  return kgPositivo(minimoKg) && kgPositivo(maximoKg) && minimoKg <= estimativaKg && estimativaKg <= maximoKg;
}

function culturaValida(valor: unknown): valor is CulturaLocal {
  if (!valor || typeof valor !== 'object' || !campos.every(
    (campo) => typeof Reflect.get(valor, campo) === 'string',
  )) return false;
  const previsao: unknown = Reflect.get(valor, 'previsao');
  return previsao === undefined || previsaoValida(previsao);
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

function atualizarCulturas(alterar: (culturas: CulturaLocal[]) => void): Promise<void> {
  const operacao = gravacao.then(async () => {
    const culturas = await lerCulturas();
    alterar(culturas);
    await AsyncStorage.setItem(chave, JSON.stringify(culturas));
  });
  gravacao = operacao.catch(() => {});
  return operacao;
}

export function salvarCultura(dados: DadosCultura, id?: string): Promise<void> {
  return atualizarCulturas((culturas) => {
    if (!dados.cultura.trim() || !areaValida(dados.area)) throw new Error('Cultura e área são obrigatórias');
    const registro = {
      cultura: dados.cultura.trim(), variedade: dados.variedade.trim(),
      area: dados.area.trim(), plantio: dados.plantio, etapa: dados.etapa,
    };
    if (id) {
      const indice = culturas.findIndex((cultura) => cultura.id === id);
      if (indice === -1) throw new Error('Cultura não encontrada');
      culturas[indice] = { ...culturas[indice], ...registro };
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
  });
}

export function salvarPrevisao(id: string, previsao: PrevisaoLocal): Promise<void> {
  return atualizarCulturas((culturas) => {
    if (!previsaoValida(previsao)) throw new Error('Previsão inválida');
    const cultura = culturas.find((item) => item.id === id);
    if (!cultura) throw new Error('Cultura não encontrada');
    cultura.previsao = previsao;
  });
}
