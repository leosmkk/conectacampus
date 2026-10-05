const test = require('node:test');
const assert = require('node:assert/strict');
const { RegistroUpdater } = require('../src/features/alterar/RegistroUpdater');
const { AlterarRegistroHandler } = require('../src/features/alterar/AlterarRegistroHandler');
const { alterarEndpoint } = require('../src/features/alterar/alterarEndpoint');
const { fakeRequest, fakeContext } = require('./helpers');

const ID = '507f1f77bcf86cd799439011';

class FakeUpdater extends RegistroUpdater {
  constructor(resultado) { super(); this.resultado = resultado; }
  async atualizar(tipo, id, dados) {
    this.chamada = { tipo: tipo.valor, id: id.valor, dados: dados.valores };
    return this.resultado;
  }
}

const criar = (resultado) => {
  const repo = new FakeUpdater(resultado);
  return { repo, endpoint: alterarEndpoint(new AlterarRegistroHandler(repo)) };
};

test('200 com registro atualizado', async () => {
  const { repo, endpoint } = criar({ _id: ID, titulo: 'b' });
  const res = await endpoint(fakeRequest({ params: { id: ID }, body: { _id: 'x', titulo: 'b' } }), fakeContext());
  assert.deepEqual(res, { status: 200, jsonBody: { message: 'Registro alterado com sucesso.', registro: { _id: ID, titulo: 'b' } } });
  assert.deepEqual(repo.chamada, { tipo: 'eventos', id: ID, dados: { titulo: 'b' } });
});

test('404 quando não encontrado', async () => {
  const { endpoint } = criar(null);
  const res = await endpoint(fakeRequest({ params: { id: ID }, body: {} }), fakeContext());
  assert.deepEqual(res, { status: 404, jsonBody: { message: 'Registro não encontrado.' } });
});

test('400 tem precedência sobre JSON inválido: tipo, depois id, depois corpo', async () => {
  const { endpoint } = criar(null);
  const ruim = new Error('json');
  let res = await endpoint(fakeRequest({ query: { tipo: 'x' }, params: { id: 'zz' }, body: ruim }), fakeContext());
  assert.equal(res.jsonBody.message, 'Tipo inválido. Utilize eventos ou certificados.');
  res = await endpoint(fakeRequest({ params: { id: 'zz' }, body: ruim }), fakeContext());
  assert.deepEqual(res, { status: 400, jsonBody: { message: 'ID inválido.' } });
  res = await endpoint(fakeRequest({ params: { id: ID }, body: [] }), fakeContext());
  assert.deepEqual(res, { status: 400, jsonBody: { message: 'Dados inválidos.' } });
});

test('500 em erro inesperado', async () => {
  const { endpoint } = criar(null);
  const ctx = fakeContext();
  const res = await endpoint(fakeRequest({ params: { id: ID }, body: new Error('json') }), ctx);
  assert.deepEqual(res, { status: 500, jsonBody: { message: 'Erro ao alterar registro.' } });
  assert.equal(ctx.erros.length, 1);
});
