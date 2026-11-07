import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregate } from '../src/application/aggregate.js';
test('agrega serviços e envia contagens para a Function', async () => {
  const result = await aggregate({ events: async () => [{ seatsUsed: 2, seatsTotal: 10 }], certificates: async () => [{ hours: 4 }], enrich: async (body) => body });
  assert.equal(result.indicadores.seatsTotal, 10);
  assert.equal(result.indicadores.totalHours, 4);
});
test('rejeita agregado se dependência falhar', async () => {
  await assert.rejects(aggregate({ events: async () => { throw new Error('offline'); }, certificates: async () => [] }), /offline/);
});
