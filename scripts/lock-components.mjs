// node scripts/lock-components.mjs. Atualiza locks independentes para Docker e repositórios.
import { spawnSync } from 'node:child_process';
for (const directory of ['frontend', 'bff', 'services/eventos', 'services/certificados', 'azure-function']) {
  const result = spawnSync('npm', ['install', '--package-lock-only', '--workspaces=false', '--ignore-scripts'], { cwd: directory, encoding: 'utf8' });
  if (result.status !== 0) { console.error(result.stderr, result.stdout); process.exit(result.status ?? 1); }
  console.log(`${directory}: lock atualizado`);
}
