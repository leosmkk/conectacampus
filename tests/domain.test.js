import test from 'node:test';
import assert from 'node:assert/strict';
import { evento } from '../services/eventos/src/domain/evento.js';
import { certificado, certificateEvent } from '../services/certificados/src/domain/certificado.js';
import { indicators } from '../azure-function/src/domain/indicators.js';
import { processEvent } from '../azure-function/src/application/process-event.js';
import { publishEvents } from '../services/certificados/src/application/publish-events.js';

const validEvent = { title: 'Evento', org: 'Campus', dateLabel: '26 de outubro', time: '19:00', place: 'Auditório', seatsUsed: 0, seatsTotal: 10 };
const validCertificate = { title: 'Evento', student: 'Participante', hours: 10, completedAt: '2026-10-26' };
test('evento impede lotação acima da capacidade e normaliza status', () => {
  assert.throws(() => evento({ ...validEvent, seatsUsed: 11 }), /capacidade/);
  assert.equal(evento({ ...validEvent, seatsUsed: 10 }).status, 'lotado');
  assert.equal(evento({ ...validEvent, status: 'lotado' }).status, 'vagas');
});
test('evento rejeita mass assignment, números fracionados e campos vazios', () => {
  assert.equal(evento({ ...validEvent, _id: 'intruso', administrator: true }).administrator, undefined);
  for (const body of [null, [], { ...validEvent, title: ' ' }, { ...validEvent, seatsUsed: 1.5 }, { ...validEvent, seatsTotal: 0 }]) assert.throws(() => evento(body));
});
test('certificado valida carga horária e datas reais', () => {
  for (const hours of [0, 1001, 2.5, '12']) assert.throws(() => certificado({ ...validCertificate, hours }));
  for (const completedAt of ['2026-02-30', 'ontem', '2026-13-01']) assert.throws(() => certificado({ ...validCertificate, completedAt }));
  assert.equal(certificado(validCertificate).hours, 10);
});
test('Function calcula indicadores e trata denominadores zero', () => {
  assert.deepEqual(indicators({ eventCount: 0, certificateCount: 0, seatsUsed: 0, seatsTotal: 0, totalHours: 0 }), {
    eventCount: 0, certificateCount: 0, seatsUsed: 0, seatsTotal: 0, totalHours: 0, availableSeats: 0, occupancyPercent: 0, averageCertificateHours: 0
  });
  const data = indicators({ eventCount: 2, certificateCount: 3, seatsUsed: 1, seatsTotal: 3, totalHours: 10 });
  assert.equal(data.occupancyPercent, 33.33); assert.equal(data.averageCertificateHours, 3.33);
  assert.throws(() => indicators({ eventCount: -1 }));
});
test('outbox só confirma publicação após envio, preserva evento em falha', async () => {
  const marked = [];
  const repository = { pending: async () => [{ id: '1', payload: '{"id":"1"}' }], published: async (id) => marked.push(id) };
  await assert.rejects(publishEvents(repository, { sendMessage: async () => { throw new Error('offline'); } }), /offline/);
  assert.deepEqual(marked, []);
  assert.equal(await publishEvents(repository, { sendMessage: async (message) => assert.equal(Buffer.from(message, 'base64').toString(), '{"id":"1"}') }), 1);
  assert.deepEqual(marked, ['1']);
});
test('evento usa contrato v1 sem dados pessoais e consumidor aceita reentrega', async () => {
  const event = certificateEvent('certificate.created', 'certificate-id', { ...validCertificate }, '12345678-1234-1234-1234-123456789abc', '2026-10-26T00:00:00Z');
  assert.equal(event.data.student, undefined);
  const seen = new Set();
  const ledger = { record: async ({ id }) => { const duplicate = seen.has(id); seen.add(id); return { duplicate }; } };
  assert.deepEqual(await processEvent(event, ledger), { duplicate: false });
  assert.deepEqual(await processEvent(event, ledger), { duplicate: true });
  await assert.rejects(processEvent({ ...event, version: 2 }, ledger), /inválido/);
});
