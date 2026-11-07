import express from 'express';
import swagger from 'swagger-ui-express';
import { ListEvents, GetEvent, CreateEvent, UpdateEvent, DeleteEvent } from '../application/features.js';
import { specification } from './openapi.js';

export function createApp(repository, token) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'eventos' }));
  app.use((req, res, next) => token && req.get('x-service-token') !== token ? res.status(401).json({ message: 'Acesso não autorizado.' }) : next());
  app.get('/openapi.json', (_req, res) => res.json(specification));
  app.use('/docs', swagger.serve, swagger.setup(specification));
  app.get('/eventos', async (_req, res) => res.json(await ListEvents(repository)()));
  app.get('/eventos/:id', async (req, res) => {
    const data = await GetEvent(repository)(req.params.id);
    res.status(data ? 200 : 404).json(data ?? { message: 'Evento não encontrado.' });
  });
  app.post('/eventos', async (req, res) => res.status(201).json(await CreateEvent(repository)(req.body)));
  app.put('/eventos/:id', async (req, res) => {
    const data = await UpdateEvent(repository)(req.params.id, req.body);
    res.status(data ? 200 : 404).json(data ?? { message: 'Evento não encontrado.' });
  });
  app.delete('/eventos/:id', async (req, res) => {
    if (await DeleteEvent(repository)(req.params.id)) return res.status(204).end();
    res.status(404).json({ message: 'Evento não encontrado.' });
  });
  app.use((error, _req, res, _next) => {
    const status = error.status ?? 500;
    if (status >= 500) console.error('eventos.request_failed', error.name);
    res.status(status).json({ message: status < 500 ? error.message : 'Serviço de eventos indisponível.' });
  });
  return app;
}
