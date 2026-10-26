import test from 'node:test';
import assert from 'node:assert/strict';
import { indicators } from '../src/domain/indicators.js';
import { processEvent } from '../src/application/process-event.js';
test('indicadores não dividem por zero', () => {
  assert.equal(indicators({ eventCount: 0, certificateCount: 0, seatsUsed: 0, seatsTotal: 0, totalHours: 0 }).occupancyPercent, 0);
});
test('trigger rejeita mensagem incompatível', async () => { await assert.rejects(processEvent({ version: 2 }, {})); });
