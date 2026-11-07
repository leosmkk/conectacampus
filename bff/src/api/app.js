import express from 'express';
import swagger from 'swagger-ui-express';
import { randomUUID } from 'node:crypto';
import { aggregate } from '../application/aggregate.js';
import { specification } from './openapi.js';

export function createApp(clients) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.use((req, res, next) => {
    res.set('X-Request-ID', randomUUID());
    res.set('Cache-Control', 'no-store');
    next();
  });
  const router = express.Router();
  router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'bff' }));
  router.get('/openapi.json', (_req, res) => res.json(specification));
  router.use('/docs', swagger.serve, swagger.setup(null, { swaggerOptions: { url: '../openapi.json', queryConfigEnabled: true } }));
  router.get('/specs/:service', async (req, res) => {
    const client = new Map([['eventos', clients.events], ['certificados', clients.certificates]]).get(req.params.service);
    if (!client) return res.status(404).json({ message: 'Serviço não encontrado.' });
    const spec = await client('/openapi.json');
    res.json({ ...spec, servers: [{ url: '/api' }], security: [] });
  });
  router.get('/aggregated-data', async (_req, res) => res.json(await aggregate(clients)));
  router.get('/events', async (_req, res) => res.json({ outbox: await clients.certificates('/events'), processed: await clients.processedEvents() }));
  for (const [resource, client] of [['eventos', clients.events], ['certificados', clients.certificates]]) {
    router.get(`/${resource}`, async (_req, res) => res.json(await client(`/${resource}`)));
    router.get(`/${resource}/:id`, async (req, res) => res.json(await client(`/${resource}/${encodeURIComponent(req.params.id)}`)));
    router.post(`/${resource}`, async (req, res) => res.status(201).json(await client(`/${resource}`, { method: 'POST', body: req.body })));
    router.put(`/${resource}/:id`, async (req, res) => res.json(await client(`/${resource}/${encodeURIComponent(req.params.id)}`, { method: 'PUT', body: req.body })));
    router.delete(`/${resource}/:id`, async (req, res) => {
      await client(`/${resource}/${encodeURIComponent(req.params.id)}`, { method: 'DELETE' });
      res.status(204).end();
    });
  }
  app.use('/api', router);
  app.use('/', router);
  app.use((_req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));
  app.use((error, _req, res, _next) => {
    const status = error.status ?? 500;
    if (status >= 500) console.error('bff.request_failed', error.name);
    res.status(status).json({ message: status < 500 || [502, 504].includes(status) ? error.message : 'Erro interno no BFF.' });
  });
  return app;
}
