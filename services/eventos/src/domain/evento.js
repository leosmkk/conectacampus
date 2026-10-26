export class ValidationError extends Error { status = 400 }

export function evento(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ValidationError('Evento inválido.');
  const result = {};
  for (const key of ['title', 'org', 'dateLabel', 'time', 'place']) {
    if (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > 200) {
      throw new ValidationError(`Campo ${key} obrigatório, com até 200 caracteres.`);
    }
    result[key] = input[key].trim();
  }
  for (const key of ['seatsUsed', 'seatsTotal', 'order']) {
    const value = input[key] ?? (key === 'order' ? 1 : 0);
    if (!Number.isSafeInteger(value) || value < 0) throw new ValidationError(`Campo ${key} deve ser inteiro não negativo.`);
    result[key] = value;
  }
  if (result.seatsTotal < 1 || result.seatsUsed > result.seatsTotal) throw new ValidationError('Vagas ocupadas não podem superar a capacidade, que deve ser positiva.');
  if (!['vagas', 'lotado', 'inscrito'].includes(input.status ?? 'vagas')) throw new ValidationError('Status inválido.');
  result.status = result.seatsUsed === result.seatsTotal ? 'lotado' : (input.status === 'inscrito' ? 'inscrito' : 'vagas');
  return result;
}
