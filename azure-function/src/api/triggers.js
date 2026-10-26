import { app } from '@azure/functions';
import { indicators } from '../domain/indicators.js';
import { processEvent } from '../application/process-event.js';
import { tableLedger } from '../infrastructure/table-ledger.js';

let ledgerPromise;
function ledger() {
  ledgerPromise ??= tableLedger(process.env.AzureWebJobsStorage).catch((error) => { ledgerPromise = undefined; throw error; });
  return ledgerPromise;
}

app.http('enrich', {
  methods: ['POST'], authLevel: 'function', route: 'enrich',
  handler: async (request, context) => {
    try { return { jsonBody: indicators(await request.json()) }; }
    catch (error) {
      context.error('enrich.failed', error.name);
      return { status: error.status ?? (error instanceof SyntaxError ? 400 : 500), jsonBody: { message: error.status === 400 ? error.message : 'Não foi possível calcular os indicadores.' } };
    }
  }
});

app.storageQueue('campusEvents', {
  queueName: 'campus-events', connection: 'AzureWebJobsStorage',
  handler: async (message, context) => {
    const event = typeof message === 'string' ? JSON.parse(message) : message;
    const result = await processEvent(event, await ledger());
    context.log('campus.event.processed', { id: event.id, duplicate: result.duplicate });
  }
});

app.http('events', {
  methods: ['GET'], authLevel: 'function', route: 'events',
  handler: async () => ({ jsonBody: await (await ledger()).list() })
});
