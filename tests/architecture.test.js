import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

async function files(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(path.join(root, entry.name)) : [path.join(root, entry.name)]))).flat();
}
for (const project of ['services/eventos', 'services/certificados', 'azure-function', 'bff']) {
  test(`${project}: dependências respeitam as camadas e fronteiras de serviço`, async () => {
    for (const file of (await files(`${project}/src`)).filter((name) => name.endsWith('.js'))) {
      const source = await readFile(file, 'utf8');
      const imports = [...source.matchAll(/(?:from\s+|import\s*\()(['"])([^'"]+)\1/g)].map((match) => match[2]);
      if (file.includes('/domain/')) assert.deepEqual(imports, [], `${file}: domínio puro`);
      if (file.includes('/application/')) {
        assert.ok(imports.every((name) => name.startsWith('.') && !/infrastructure|\/api\//.test(name)), `${file}: aplicação não depende de adapters`);
      }
      for (const name of imports.filter((value) => value.startsWith('.'))) assert.ok(path.resolve(path.dirname(file), name).startsWith(path.resolve(project) + path.sep), `${file}: importação entre serviços`);
    }
  });
}
test('frontend não importa SDKs de banco nem endereça microserviços', async () => {
  const sources = await Promise.all((await files('frontend/src')).map((file) => readFile(file, 'utf8')));
  assert.ok(sources.every((source) => !/mongodb|mssql|azurewebsites\.net|x-service-token|FUNCTION_KEY/.test(source)));
  const api = await readFile('frontend/src/services/api.js', 'utf8');
  assert.ok(api.includes("'/api'"));
});
