import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
async function files(root) {
  return (await Promise.all((await readdir(root, { withFileTypes: true })).map((entry) => entry.isDirectory() ? files(path.join(root, entry.name)) : [path.join(root, entry.name)]))).flat();
}
test('fronteiras de camadas e repositório', async () => {
  for (const file of (await files('src')).filter((name) => /\.(js|jsx)$/.test(name))) {
    const source = await readFile(file, 'utf8');
    const imports = [...source.matchAll(/(?:from\s+|import\s*\()(['"])([^'"]+)\1/g)].map((match) => match[2]);
    if (file.includes('/domain/')) assert.deepEqual(imports, [], file);
    if (file.includes('/application/')) assert.ok(imports.every((name) => name.startsWith('.') && !/infrastructure|\/api\//.test(name)), file);
    for (const name of imports.filter((value) => value.startsWith('.'))) assert.ok(path.resolve(path.dirname(file), name).startsWith(path.resolve('src') + path.sep), file);
  }
});
