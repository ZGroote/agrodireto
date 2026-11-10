import { mkdir } from 'node:fs/promises';
import { basename } from 'node:path';
import { processarArquivo } from './processar.ts';

/** Uso: node src/cli.ts <arquivo> [pasta-de-saida]  — otimiza um arquivo local e imprime o resultado. */
const [, , arquivo, pastaSaida = '.'] = process.argv;

if (!arquivo) {
  console.error('Uso: node src/cli.ts <arquivo> [pasta-de-saida]');
  process.exit(2);
}

await mkdir(pastaSaida, { recursive: true });
const resultado = await processarArquivo(arquivo, basename(arquivo), pastaSaida);
console.log(JSON.stringify(resultado, null, 2));
process.exit(resultado.status === 'falhou' ? 1 : 0);
