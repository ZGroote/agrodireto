import { mkdir } from 'node:fs/promises';
import { basename, join, parse } from 'node:path';
import { prepararCopiaFoto } from './copiaFoto.ts';
import { processarArquivo } from './processar.ts';

/** Uso: node src/cli.ts <arquivo> [pasta-de-saida]  — otimiza um arquivo local e imprime o resultado. */
const [, , primeiro, ...resto] = process.argv;
const copia = primeiro === '--copia-foto';
const [arquivo, pastaSaida = '.'] = copia ? resto : [primeiro, ...resto];

if (!arquivo) {
  console.error('Uso: node src/cli.ts [--copia-foto] <arquivo> [pasta-de-saida]');
  process.exit(2);
}

await mkdir(pastaSaida, { recursive: true });
const resultado = copia
  ? await prepararCopiaFoto(arquivo, join(pastaSaida, `${parse(arquivo).name}.sanitizada.webp`))
  : await processarArquivo(arquivo, basename(arquivo), pastaSaida);
console.log(JSON.stringify(resultado, null, 2));
process.exit(resultado.status === 'falhou' ? 1 : 0);
