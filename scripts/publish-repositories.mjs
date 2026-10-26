// node scripts/publish-repositories.mjs GITHUB_OWNER [--sync]
// Publica os cinco componentes preservando o histórico com git subtree split.
import { spawnSync } from 'node:child_process';
const owner = process.argv[2];
const sync = process.argv.includes('--sync');
if (!/^[a-zA-Z0-9-]+$/.test(owner ?? '')) throw new Error('Informe a conta GitHub.');
function command(binary, args, capture = false) {
  const result = spawnSync(binary, args, { encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.status !== 0) throw new Error(`${binary}: ${capture ? result.stderr : 'Falha no comando'}`);
  return result.stdout?.trim();
}
if (command('git', ['status', '--porcelain'], true)) throw new Error('Faça commit antes da publicação.');
for (const [directory, slug] of [['frontend', 'microfrontend'], ['bff', 'bff'], ['services/eventos', 'eventos'], ['services/certificados', 'certificados'], ['azure-function', 'functions']]) {
  const name = `${owner}/conectacampus-${slug}`;
  const exists = spawnSync('gh', ['repo', 'view', name, '--json', 'name'], { stdio: 'ignore' });
  if (exists.status === 0 && !sync) throw new Error(`${name} já existe. Verifique o histórico antes de publicar.`);
  const sha = command('git', ['subtree', 'split', `--prefix=${directory}`, 'HEAD'], true);
  if (exists.status !== 0) command('gh', ['repo', 'create', name, '--public', '--description', `ConectaCampus PJBL: ${slug}`]);
  command('git', ['push', `https://github.com/${name}.git`, `${sha}:refs/heads/main`]);
  console.log(`Publicado: https://github.com/${name}`);
}
