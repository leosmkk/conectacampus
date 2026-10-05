const test = require('node:test');
const assert = require('node:assert/strict');
const { RegistroFinder } = require('../src/features/pesquisar/RegistroFinder');
const { RegistroLister } = require('../src/features/pesquisar/RegistroLister');
const { BuscarRegistroPorIdHandler } = require('../src/features/pesquisar/BuscarRegistroPorIdHandler');
const { ListarRegistrosHandler } = require('../src/features/pesquisar/ListarRegistrosHandler');
const { pesquisarEndpoint } = require('../src/features/pesquisar/pesquisarEndpoint');
const { fakeRequest, fakeContext } = require('./helpers');

const ID = '507f1f77bcf86cd799439011';

class FakeFinder extends RegistroFinder {
  constructor(r) { super(); this.r = r; }
  async buscarPorId() { return this.r; }
}
class FakeLister extends RegistroLister {
  async listar(tipo) { return [{ tipo: tipo.valor }]; }
}

const criar = (achado) => pesquisarEndpoint({
  buscarPorIdHandler: new BuscarRegistroPorIdHandler(new FakeFinder(achado)),
  listarHandler: new ListarRegistrosHandler(new FakeLister())
});

test('lista quando não há id (id vazio também lista)', async () => {
  const ep = criar(null);
  assert.deepEqual(await ep(fakeRequest(), fakeContext()), { status: 200, jsonBody: [{ tipo: 'eventos' }] });
  const res = await ep(fakeRequest({ query: { tipo: 'certificados', id: '' } }), fakeContext());
  assert.deepEqual(res.jsonBody, [{ tipo: 'certificados' }]);
});

test('200 com documento, 404 quando ausente, 400 para id inválido', async () => {
  assert.deepEqual(await criar({ _id: ID }) (fakeRequest({ query: { id: ID } }), fakeContext()), { status: 200, jsonBody: { _id: ID } });
  assert.deepEqual(await criar(null)(fakeRequest({ query: { id: ID } }), fakeContext()), { status: 404, jsonBody: { message: 'Registro não encontrado.' } });
  assert.deepEqual(await criar(null)(fakeRequest({ query: { id: 'zz' } }), fakeContext()), { status: 400, jsonBody: { message: 'ID inválido.' } });
});

test('400 para tipo inválido e 500 em erro inesperado', async () => {
  const ep = criar(null);
  assert.equal((await ep(fakeRequest({ query: { tipo: 'x' } }), fakeContext())).status, 400);
  const quebrado = pesquisarEndpoint({
    buscarPorIdHandler: null,
    listarHandler: { executar: async () => { throw new Error('boom'); } }
  });
  const ctx = fakeContext();
  assert.deepEqual(await quebrado(fakeRequest(), ctx), { status: 500, jsonBody: { message: 'Erro ao pesquisar dados.' } });
  assert.equal(ctx.erros.length, 1);
});
