// Somente para testes e prévia local. Produção sempre exige MongoDB e SQL.
import { randomUUID, randomBytes } from 'node:crypto';
import { certificateEvent } from '../../services/certificados/src/domain/certificado.js';
export function memoryRepository(kind, initial = []) {
  const key = kind === 'eventos' ? '_id' : 'id';
  const records = new Map(initial.map((row) => [row[key], structuredClone(row)]));
  const outbox = [];
  function emit(type, id, data) {
    if (kind === 'certificados') outbox.push({ id: randomUUID(), event: certificateEvent(type, id, data, randomUUID(), new Date().toISOString()), publishedAt: null });
  }
  return {
    async list() { return structuredClone([...records.values()]); },
    async get(id) { return structuredClone(records.get(id) ?? null); },
    async create(data) { const id = kind === 'eventos' ? randomBytes(12).toString('hex') : randomUUID(); const row = { ...data, [key]: id }; records.set(id, row); emit('certificate.created', id, data); return structuredClone(row); },
    async update(id, data) { if (!records.has(id)) return null; const row = { ...data, [key]: id }; records.set(id, row); emit('certificate.updated', id, data); return structuredClone(row); },
    async delete(id) { const row = records.get(id); if (!row) return false; records.delete(id); emit('certificate.deleted', id, row); return true; },
    async events() { return structuredClone(outbox); }
  };
}
