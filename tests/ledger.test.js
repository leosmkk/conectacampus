import test from 'node:test';
import assert from 'node:assert/strict';
import { createLedger } from '../azure-function/src/infrastructure/table-ledger.js';

test('ledger real trata conflito de chave como duplicata e propaga falha de armazenamento', async () => {
  const entries = new Map();
  const ledger = createLedger({
    async createEntity(row) {
      if (entries.has(row.rowKey)) { const error = new Error('Conflict'); error.statusCode = 409; throw error; }
      entries.set(row.rowKey, row);
    }
  });
  const event = { id: '1', type: 'certificate.created', subject: 'certificate', occurredAt: '2026-10-26T00:00:00Z', version: 1 };
  assert.deepEqual(await ledger.record(event), { duplicate: false });
  assert.deepEqual(await ledger.record(event), { duplicate: true });
  assert.equal(entries.size, 1);
  await assert.rejects(createLedger({ createEntity: async () => { throw new Error('storage offline'); } }).record(event), /storage offline/);
});
