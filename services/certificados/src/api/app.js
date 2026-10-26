import express from 'express';
import swagger from 'swagger-ui-express';
import { ListCertificates, GetCertificate, CreateCertificate, UpdateCertificate, DeleteCertificate, ListEvents } from '../application/features.js';
import { specification } from './openapi.js';

export function createApp(repository, token) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'certificados' }));
  app.use((req, res, next) => token && req.get('x-service-token') !== token ? res.status(401).json({ message: 'Acesso não autorizado.' }) : next());
  app.get('/openapi.json', (_req, res) => res.json(specification));
  app.use('/docs', swagger.serve, swagger.setup(specification));
  app.get('/events', async (_req, res) => res.json(await ListEvents(repository)()));
  app.get('/certificados', async (_req, res) => res.json(await ListCertificates(repository)()));
  app.get('/certificados/:id', async (req, res) => {
    const data = await GetCertificate(repository)(req.params.id);
    res.status(data ? 200 : 404).json(data ?? { message: 'Certificado não encontrado.' });
  });
  app.post('/certificados', async (req, res) => res.status(201).json(await CreateCertificate(repository)(req.body)));
  app.put('/certificados/:id', async (req, res) => {
    const data = await UpdateCertificate(repository)(req.params.id, req.body);
    res.status(data ? 200 : 404).json(data ?? { message: 'Certificado não encontrado.' });
  });
  app.delete('/certificados/:id', async (req, res) => {
    if (await DeleteCertificate(repository)(req.params.id)) return res.status(204).end();
    res.status(404).json({ message: 'Certificado não encontrado.' });
  });
  app.use((error, _req, res, _next) => {
    const status = error.status ?? 500;
    if (status >= 500) console.error('certificados.request_failed', error.name);
    res.status(status).json({ message: status < 500 ? error.message : 'Serviço de certificados indisponível.' });
  });
  return app;
}
