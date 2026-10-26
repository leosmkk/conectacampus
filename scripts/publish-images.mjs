// node scripts/publish-images.mjs DOCKERHUB_USER v1 [--push]
// Faça docker login antes de usar --push. Docker Hub usa usuário/repositório:tag.
import { spawnSync } from 'node:child_process';
const [account, tag = 'v1', mode] = process.argv.slice(2);
if (!/^[a-z0-9][a-z0-9_-]+$/.test(account ?? '') || !/^[\w.-]+$/.test(tag)) throw new Error('Informe usuário Docker Hub e tag válidos.');
for (const [name, path] of [['frontend', 'frontend'], ['bff', 'bff'], ['eventos', 'services/eventos'], ['certificados', 'services/certificados'], ['function', 'azure-function'], ['gateway', 'gateway']]) {
  const image = `${account}/conectacampus-${name}:${tag}`;
  if (spawnSync('docker', ['build', '-t', image, path], { stdio: 'inherit' }).status !== 0) process.exit(1);
  if (mode === '--push' && spawnSync('docker', ['push', image], { stdio: 'inherit' }).status !== 0) process.exit(1);
}
