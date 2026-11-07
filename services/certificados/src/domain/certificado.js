export class ValidationError extends Error { status = 400 }

export function certificado(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ValidationError('Certificado inválido.');
  const result = {};
  for (const key of ['title', 'student', 'completedAt']) {
    if (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > 200) throw new ValidationError(`Campo ${key} obrigatório, com até 200 caracteres.`);
    result[key] = input[key].trim();
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.completedAt) || !Number.isFinite(Date.parse(result.completedAt)) || new Date(result.completedAt).toISOString().slice(0, 10) !== result.completedAt) throw new ValidationError('Data de conclusão inválida.');
  if (!Number.isInteger(input.hours) || input.hours < 1 || input.hours > 1000) throw new ValidationError('Carga horária deve estar entre 1 e 1000 horas.');
  result.hours = input.hours;
  result.status = input.status ?? 'disponivel';
  if (!['disponivel', 'emitido'].includes(result.status)) throw new ValidationError('Status inválido.');
  return result;
}

export function certificateEvent(type, id, data, eventId, now) {
  return { id: eventId, type, version: 1, source: 'certificados', subject: id, occurredAt: now, data: { certificateId: id, hours: data?.hours ?? 0 } };
}
