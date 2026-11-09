import sql from 'mssql';
import { readFile } from 'node:fs/promises';
import { QueueClient } from '@azure/storage-queue';
import { sqlRepository } from './infrastructure/sql-repository.js';
import { publishEvents } from './application/publish-events.js';
import { createApp } from './api/app.js';

for (const key of ['SQL_SERVER', 'SQL_DATABASE', 'SQL_USER', 'SQL_PASSWORD', 'STORAGE_CONNECTION_STRING', 'SERVICE_TOKEN']) {
  if (!process.env[key]) throw new Error(`Configure ${key}.`);
}
const pool = await new sql.ConnectionPool({
  server: process.env.SQL_SERVER, database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER, password: process.env.SQL_PASSWORD,
  options: { encrypt: process.env.SQL_ENCRYPT !== 'false', trustServerCertificate: process.env.SQL_TRUST_CERTIFICATE === 'true' },
  connectionTimeout: 30000, requestTimeout: 15000
}).connect();
await pool.request().batch(await readFile(new URL('./infrastructure/schema.sql', import.meta.url), 'utf8'));
const repository = sqlRepository(pool);
const queue = new QueueClient(process.env.STORAGE_CONNECTION_STRING, 'campus-events');
await queue.createIfNotExists();
let stopped = false;
// Intervalo de varredura da outbox (ms). Padrao 30 s; minimo 1 s.
const pollMs = Math.max(1000, Number(process.env.OUTBOX_POLL_MS) || 30000);
let timer;
async function dispatch() {
  try { await publishEvents(repository, queue); } catch (error) { console.error('outbox.retry_pending', error.name); }
  if (!stopped) timer = setTimeout(dispatch, pollMs);
}
void dispatch();
const server = createApp(repository, process.env.SERVICE_TOKEN).listen(process.env.PORT ?? 3002, '0.0.0.0');
process.on('SIGTERM', () => { stopped = true; clearTimeout(timer); server.close(async () => { await pool.close(); process.exit(0); }); });
