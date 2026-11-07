// node scripts/init-local.mjs. Gera credenciais locais, sem sobrescrever .env.
import { writeFile, mkdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
const values = {
  SERVICE_TOKEN: randomBytes(32).toString('hex'),
  FUNCTION_KEY: randomBytes(32).toString('base64url'),
  SQL_PASSWORD: `Campus!${randomBytes(20).toString('hex')}`,
  STORAGE_KEY: randomBytes(64).toString('base64')
};
await writeFile('.env', Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { flag: 'wx', mode: 0o600 });
await mkdir('.local/function-secrets', { recursive: true });
await writeFile('.local/function-secrets/host.json', JSON.stringify({
  masterKey: { name: 'master', value: randomBytes(32).toString('base64url'), encrypted: false },
  functionKeys: [{ name: 'bff', value: values.FUNCTION_KEY, encrypted: false }], systemKeys: []
}), { mode: 0o600 });
console.log('Configuração local criada em .env.');
