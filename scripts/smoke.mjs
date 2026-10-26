// node scripts/smoke.mjs [https://gateway]. Requer bancos, fila e Function reais.
import assert from 'node:assert/strict';
const base = (process.argv[2] ?? 'http://localhost:8080').replace(/\/$/, '');
async function call(path, method = 'GET', body) {
  const response = await fetch(`${base}/api${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000) });
  assert.ok(response.ok, `${method} ${path}: ${response.status}`);
  return response.status === 204 ? null : response.json();
}
const eventBody = { title: 'Smoke PJBL', org: 'Grupo PJBL', dateLabel: '26 de outubro', time: '19:00', place: 'Campus', seatsUsed: 2, seatsTotal: 20 };
const certificateBody = { title: 'Smoke PJBL', student: 'Participante de teste', hours: 4, completedAt: '2026-10-26' };
let event, certificate;
try {
  event = await call('/eventos', 'POST', eventBody);
  assert.equal((await call(`/eventos/${event._id}`)).title, eventBody.title);
  assert.equal((await call(`/eventos/${event._id}`, 'PUT', { ...eventBody, title: 'Smoke atualizado' })).title, 'Smoke atualizado');
  certificate = await call('/certificados', 'POST', certificateBody);
  assert.equal((await call(`/certificados/${certificate.id}`)).hours, 4);
  assert.equal((await call(`/certificados/${certificate.id}`, 'PUT', { ...certificateBody, status: 'emitido' })).status, 'emitido');
  const data = await call('/aggregated-data');
  assert.ok(data.eventos.some((item) => item._id === event._id));
  assert.ok(data.certificados.some((item) => item.id === certificate.id));
  assert.ok(data.indicadores.totalHours >= 4);
  let processed = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    const events = await call('/events');
    if (events.outbox.some((item) => item.event.subject === certificate.id && item.publishedAt) && events.processed.some((item) => item.subject === certificate.id)) { processed = true; break; }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  assert.ok(processed, 'Evento deve sair da outbox e ser processado pela Function.');
  for (const path of ['/openapi.json', '/specs/eventos', '/specs/certificados']) assert.equal((await call(path)).openapi, '3.0.3');
  console.log('CRUD MongoDB, CRUD SQL, agregação, Function e mensageria validados.');
} finally {
  if (certificate) await call(`/certificados/${certificate.id}`, 'DELETE');
  if (event) await call(`/eventos/${event._id}`, 'DELETE');
}
