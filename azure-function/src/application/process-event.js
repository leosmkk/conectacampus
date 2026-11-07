export async function processEvent(event, ledger) {
  if (!event || event.version !== 1 || !/^certificate\.(created|updated|deleted)$/.test(event.type) ||
      !/^[a-f0-9-]{36}$/i.test(event.id ?? '') || !event.subject || !event.occurredAt) {
    throw new Error('Evento inválido.');
  }
  return ledger.record(event);
}
