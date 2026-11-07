import test from 'node:test';
import assert from 'node:assert/strict';
import { certificado } from '../src/domain/certificado.js';
import { publishEvents } from '../src/application/publish-events.js';
test('rejeita certificado com carga ou data inválida', () => {
  const body = { title: 'Evento', student: 'Participante', hours: 4, completedAt: '2026-10-26' };
  assert.equal(certificado(body).hours, 4);
  assert.throws(() => certificado({ ...body, hours: 0 }));
  assert.throws(() => certificado({ ...body, completedAt: '2026-02-30' }));
});
test('outbox mantém evento pendente se fila falhar', async () => {
  let marked = false;
  await assert.rejects(publishEvents({ pending: async () => [{ id: '1', payload: '{}' }], published: async () => { marked = true; } }, { sendMessage: async () => { throw new Error('offline'); } }), /offline/);
  assert.equal(marked, false);
});
