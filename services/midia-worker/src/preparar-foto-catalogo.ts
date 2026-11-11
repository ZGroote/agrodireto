import { createClient } from '@supabase/supabase-js';
import { prepararFotoCatalogo, prepararFotosPendentes } from './fotoCatalogo.ts';

const argumentos = process.argv.slice(2);
const [lote, chave] = argumentos;
const pendentes = argumentos.length === 1 && lote === '--pendentes';
const url = process.env.SUPABASE_URL;
const segredo = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !segredo) {
  console.error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do worker.');
  process.exitCode = 1;
} else if (!pendentes && (argumentos.length !== 2 || !lote || !chave || lote.startsWith('--'))) {
  console.error('Use --pendentes ou informe o UUID do lote e a chave da foto.');
  process.exitCode = 1;
} else {
  try {
    const cliente = createClient(url, segredo, { auth: { persistSession: false } });
    if (pendentes) {
      const resumo = await prepararFotosPendentes(cliente, (resultado) => {
        if ('erro' in resultado) console.error(`${resultado.lote_id}/${resultado.chave} — ${resultado.erro}`);
        else console.log(resultado.caminho);
      });
      console.log(`${resumo.concluidas} foto(s) preparada(s), ${resumo.falhas} falha(s).`);
      if (resumo.falhas) process.exitCode = 1;
    } else {
      console.log(await prepararFotoCatalogo(cliente, lote, chave));
    }
  } catch (erro) {
    console.error(erro instanceof Error ? erro.message : 'Não foi possível preparar a foto.');
    process.exitCode = 1;
  }
}
