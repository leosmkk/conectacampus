const test = require('node:test');
const assert = require('node:assert/strict');
const { RegistroRemover } = require('../src/features/excluir/RegistroRemover');
const { ExcluirRegistroHandler } = require('../src/features/excluir/ExcluirRegistroHandler');
const { excluirEndpoint } = require('../src/features/excluir/excluirEndpoint');
const { fakeRequest, fakeContext } = require('./helpers');

const ID = '507f1f77bcf86cd799439011';

class FakeRemover extends RegistroRemover {
  constructor(r) { super(); this.r = r; }
  async remover() { if (this.r instanceof Error) throw this.r; return this.r; }
}
const criar = (r) => excluirEndpoint(new ExcluirRegistroHandler(new FakeRemover(r)));

test('200, 404, 400 e 500', async () => {
  assert.deepEqual(await criar(true)(fakeRequest({ params: { id: ID } }), fakeContext()), { status: 200, jsonBody: { message: 'Registro excluído com sucesso.' } });
  assert.deepEqual(await criar(false)(fakeRequest({ params: { id: ID } }), fakeContext()), { status: 404, jsonBody: { message: 'Registro não encontrado.' } });
  assert.deepEqual(await criar(true)(fakeRequest({ params: { id: 'zz' } }), fakeContext()), { status: 400, jsonBody: { message: 'ID inválido.' } });
  assert.equal((await criar(true)(fakeRequest({ query: { tipo: 'x' }, params: { id: ID } }), fakeContext())).jsonBody.message, 'Tipo inválido. Utilize eventos ou certificados.');
  const ctx = fakeContext();
  assert.deepEqual(await criar(new Error('boom'))(fakeRequest({ params: { id: ID } }), ctx), { status: 500, jsonBody: { message: 'Erro ao excluir registro.' } });
  assert.equal(ctx.erros.length, 1);
});
