import { createClients } from './infrastructure/clients.js';
import { createApp } from './api/app.js';

for (const key of ['EVENTS_URL', 'CERTIFICATES_URL', 'FUNCTION_URL', 'SERVICE_TOKEN']) {
  if (!process.env[key]) throw new Error(`Configure ${key}.`);
}
const clients = createClients({
  events: process.env.EVENTS_URL, certificates: process.env.CERTIFICATES_URL,
  function: process.env.FUNCTION_URL, functionKey: process.env.FUNCTION_KEY, token: process.env.SERVICE_TOKEN
});
const server = createApp(clients).listen(process.env.PORT ?? 3000, '0.0.0.0');
process.on('SIGTERM', () => server.close(() => process.exit(0)));
