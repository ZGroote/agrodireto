import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createConnection } from 'node:net';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const apps = [
  { id: 'agricultor', nome: 'Agricultor', descricao: 'Propriedades, lotes e evidências', porta: 8083 },
  { id: 'cliente', nome: 'Cliente', descricao: 'Catálogo e ofertas', porta: 8084 },
  { id: 'logistica', nome: 'Logística', descricao: 'Transportadoras, coletas e entregas', porta: 8085 },
  { id: 'administrador', nome: 'Administrador', descricao: 'Cadastros e revisão de evidências', porta: 8086 },
];
const host = '127.0.0.1';
const portaHub = 8082;
const cli = createRequire(import.meta.url).resolve('expo/bin/cli');
const processos = new Set();

function portaEmUso(porta) {
  return new Promise((resolve) => {
    const conexao = createConnection({ host, port: porta });
    conexao.once('connect', () => { conexao.destroy(); resolve(true); });
    conexao.once('error', () => resolve(false));
  });
}

const cards = apps.map(({ nome, descricao, porta }) => `
  <article>
    <h2>${nome}</h2>
    <p>${descricao}</p>
    <div class="acoes">
      <a class="primario" href="http://localhost:${porta}/entrar" target="_blank" rel="noopener">Abrir app</a>
      <a href="http://localhost:${porta}/telas" target="_blank" rel="noopener">Mapa de telas</a>
    </div>
  </article>`).join('');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AgroDireto | Hub de homologação</title>
<style>
  :root { color-scheme: light; font: 16px/1.5 system-ui, sans-serif; color: #19382b; background: #f3f5ef; }
  * { box-sizing: border-box; }
  body { margin: 0; }
  main { max-width: 960px; margin: auto; padding: clamp(24px, 7vw, 80px); }
  header { margin-bottom: 32px; }
  h1 { font-size: clamp(2.5rem, 7vw, 4rem); letter-spacing: -.055em; line-height: 1; margin: 0 0 16px; }
  h2 { font-size: 1.3rem; margin: 0; }
  p { color: #466053; margin: 8px 0; }
  .apps { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); }
  article { display: flex; flex-direction: column; background: #fff; border: 1px solid #d5e0d6; border-radius: 16px; padding: 24px; }
  .acoes { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: auto; padding-top: 16px; }
  a { color: #21553c; padding: 8px 2px; font-weight: 600; }
  .primario { background: #21553c; color: #fff; padding: 8px 14px; border-radius: 8px; text-decoration: none; }
  a:focus-visible { outline: 3px solid #866313; outline-offset: 3px; }
</style>
</head>
<body><main>
<header><h1>AgroDireto</h1><p>Escolha um perfil para abrir o app de homologação.</p></header>
<section class="apps" aria-label="Apps AgroDireto">${cards}</section>
</main></body></html>`;

const servidor = createServer((req, res) => {
  if (req.url !== '/' || (req.method !== 'GET' && req.method !== 'HEAD')) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(req.method === 'HEAD' ? undefined : html);
});

servidor.on('error', (erro) => {
  console.error(erro.message);
  process.exitCode = 1;
});
servidor.listen(portaHub, host, async () => {
  console.log(`Hub AgroDireto: http://localhost:${portaHub}`);
  await Promise.all(apps.map(async ({ id, nome, porta }) => {
    if (await portaEmUso(porta)) {
      console.log(`${nome}: reaproveitando a porta ${porta}.`);
      return;
    }
    const processo = spawn(process.execPath, [cli, 'start', '--localhost', '--port', String(porta)], {
      cwd: fileURLToPath(new URL(`../apps/${id}/`, import.meta.url)),
      env: { ...process.env, EXPO_OFFLINE: '1' },
      stdio: 'inherit',
    });
    processos.add(processo);
    processo.on('error', (erro) => console.error(`${nome}: ${erro.message}`));
    processo.on('exit', (codigo) => {
      processos.delete(processo);
      if (codigo) console.error(`${nome} encerrou com código ${codigo}.`);
    });
  }));
});

for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.once(sinal, () => {
    for (const processo of processos) processo.kill();
    servidor.close();
  });
}
