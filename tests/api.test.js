import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp as eventsApp } from '../services/eventos/src/api/app.js';
import { createApp as certificatesApp } from '../services/certificados/src/api/app.js';
import { createApp as bffApp } from '../bff/src/api/app.js';
import { createClients } from '../bff/src/infrastructure/clients.js';
import { aggregate } from '../bff/src/application/aggregate.js';
import { memoryRepository } from '../scripts/lib/memory-repositories.mjs';
import { indicators } from '../azure-function/src/domain/indicators.js';

for (const [resource, factory, body] of [
  ['eventos', eventsApp, { title: 'Evento', org: 'Campus', dateLabel: '26 de outubro', time: '19:00', place: 'Auditório', seatsUsed: 0, seatsTotal: 10 }],
  ['certificados', certificatesApp, { title: 'Evento', student: 'Participante', hours: 10, completedAt: '2026-10-26' }]
]) test(`${resource}: CRUD HTTP, autenticação, validação e registro ausente`, async () => {
  const app = factory(memoryRepository(resource), 'secret');
  const call = (method, path) => request(app)[method](path).set('x-service-token', 'secret');
  await request(app).get(`/${resource}`).expect(401);
  await call('post', `/${resource}`).send({}).expect(400);
  const created = (await call('post', `/${resource}`).send(body).expect(201)).body;
  const id = created._id ?? created.id;
  assert.equal((await call('get', `/${resource}`).expect(200)).body.length, 1);
  await call('get', `/${resource}/${id}`).expect(200);
  const updated = (await call('put', `/${resource}/${id}`).send({ ...body, title: 'Alterado' }).expect(200)).body;
  assert.equal(updated.title, 'Alterado');
  await call('delete', `/${resource}/${id}`).expect(204);
  await call('get', `/${resource}/${id}`).expect(404);
  await call('put', `/${resource}/${id}`).send(body).expect(404);
  await call('delete', `/${resource}/${id}`).expect(404);
  await call('get', '/openapi.json').expect(200);
  await call('post', `/${resource}`).set('Content-Type', 'application/json').send('{broken').expect(400);
});

test('GET /aggregated-data consulta os dois serviços e a Function', async () => {
  const calls = [];
  const clients = {
    events: async (path) => { calls.push(path); return [{ seatsUsed: 4, seatsTotal: 10 }]; },
    certificates: async (path) => { calls.push(path); return [{ hours: 12 }]; },
    enrich: async (body) => { calls.push('function'); return indicators(body); }
  };
  const response = await request(bffApp(clients)).get('/aggregated-data').expect(200);
  assert.deepEqual(calls.sort(), ['/certificados', '/eventos', 'function'].sort());
  assert.equal(response.body.indicadores.availableSeats, 6);
  assert.equal(response.body.indicadores.totalHours, 12);
  await request(bffApp(clients)).get('/api/aggregated-data').expect(200);
});

test('agregação falha sem produzir sucesso parcial quando um serviço cai', async () => {
  await assert.rejects(aggregate({ events: async () => { throw new Error('offline'); }, certificates: async () => [] }), /offline/);
});

test('BFF preserva erros de domínio, esconde falhas e rejeita rotas fora da lista', async () => {
  const config = { events: 'http://events', certificates: 'http://sql', function: 'http://function', token: 'secret' };
  let client = createClients(config, async () => new Response(JSON.stringify({ message: 'Capacidade inválida.' }), { status: 400 }));
  await request(bffApp(client)).post('/eventos').send({}).expect(400, { message: 'Capacidade inválida.' });
  client = createClients(config, async () => { throw new Error('password=interna'); });
  const response = await request(bffApp(client)).get('/aggregated-data').expect(502);
  assert.ok(!JSON.stringify(response.body).includes('password'));
  await request(bffApp(client)).get('/admin').expect(404);
});

test('BFF encaminha token interno e Function key sem devolver credenciais', async () => {
  const clients = createClients({ events: 'http://events', certificates: 'http://sql', function: 'http://function', token: 'internal', functionKey: 'function-key' }, async (url, options) => {
    assert.equal(url, 'http://function/api/enrich');
    assert.equal(options.headers['x-functions-key'], 'function-key');
    assert.equal(options.headers['x-service-token'], 'internal');
    return new Response('{"ok":true}');
  });
  assert.deepEqual(await clients.enrich({}), { ok: true });
});
