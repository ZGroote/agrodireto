/** Formatadores pt-BR (sem depender de Intl, que varia entre Hermes e web). */

const milhar = (n: string) => n.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** 2352 → "R$ 2.352" · 4.8 → "R$ 4,80" (centavos só quando existem). */
export function brl(valor: number, opts: { centavos?: boolean } = {}): string {
  const neg = valor < 0;
  const abs = Math.abs(valor);
  const comCentavos = opts.centavos ?? !Number.isInteger(abs);
  const [int, dec] = abs.toFixed(comCentavos ? 2 : 0).split('.');
  return `${neg ? '–' : ''}R$ ${milhar(int)}${dec ? `,${dec}` : ''}`;
}

/** 2000 → "2.000 kg" */
export function kg(valor: number): string {
  return `${milhar(String(Math.round(valor)))} kg`;
}

/** 1800, 2200 → "1.800 – 2.200 kg" */
export function faixaKg(min: number, max: number): string {
  return `${milhar(String(min))} – ${milhar(String(max))} kg`;
}

/** Máscara de campo numérico: "2000" → "2.000" (só dígitos). */
export const mascaraMilhar = (texto: string): string => milhar(texto.replace(/\D/g, ''));
