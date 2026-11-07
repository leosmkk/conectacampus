import test from 'node:test';
import assert from 'node:assert/strict';
import { evento } from '../src/domain/evento.js';
test('capacidade é uma invariante e lotação é derivada', () => {
  const body = { title: 'Evento', org: 'Campus', place: 'Sala', dateLabel: '26 de outubro', time: '19:00', seatsUsed: 10, seatsTotal: 10 };
  assert.equal(evento(body).status, 'lotado');
  assert.throws(() => evento({ ...body, seatsUsed: 11 }));
});
