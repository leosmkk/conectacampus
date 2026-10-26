import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('frontend usa entrada do BFF e não credenciais de infraestrutura', async () => {
  const source = await readFile('src/services/api.js', 'utf8');
  assert.ok(source.includes("'/api'"));
  assert.ok(!/mongodb|mssql|x-service-token|FUNCTION_KEY|azurewebsites/.test(source));
});
