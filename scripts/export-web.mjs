import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = createRequire(import.meta.url).resolve('expo/bin/cli');
const output = mkdtempSync(join(tmpdir(), 'agrodireto-web-'));

for (const app of ['agricultor', 'cliente', 'logistica', 'administrador']) {
  console.log(`\nExportando ${app}…`);
  const result = spawnSync(process.execPath, [
    cli, 'export', '--platform', 'web', '--output-dir', join(output, app),
  ], {
    cwd: join(root, 'apps', app),
    env: { ...process.env, CI: 'true', EXPO_OFFLINE: '1' },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`\nExportações concluídas em ${output}`);
