const test = require('node:test');
const assert = require('node:assert/strict');
const { RegistroInserter } = require('../src/features/inserir/RegistroInserter');
const { InserirRegistroHandler } = require('../src/features/inserir/InserirRegistroHandler');
const { inserirEndpoint } = require('../src/features/inserir/inserirEndpoint');
const { MongoRegistroInserter } = require('../src/features/inserir/MongoRegistroInserter');
const { fakeRequest, fakeContext } = require('./helpers');

class FakeInserter extends RegistroInserter {
  async inserir(tipo, dados) {
    this.chamada = { tipo: tipo.valor, dados: dados.valores };
    return 'id-1';
  }
}

function criar() {
  const repo = new FakeInserter();
  return { repo, endpoint: inserirEndpoint(new InserirRegistroHandler(repo)) };
}

test('201 com _id e dados, sem _id vindo do cliente', async () => {
  const { repo, endpoint } = criar();
  const res = await endpoint(fakeRequest({ body: { _id: 'x', titulo: 'a' } }), fakeContext());
  assert.equal(res.status, 201);
  assert.deepEqual(res.jsonBody, { message: 'Registro inserido com sucesso.', _id: 'id-1', titulo: 'a' });
  assert.deepEqual(repo.chamada, { tipo: 'eventos', dados: { titulo: 'a' } });
});

test('400 para tipo inválido e para corpo inválido', async () => {
  const { endpoint } = criar();
  let res = await endpoint(fakeRequest({ query: { tipo: 'x' }, body: {} }), fakeContext());
  assert.deepEqual(res, { status: 400, jsonBody: { message: 'Tipo inválido. Utilize eventos ou certificados.' } });
  res = await endpoint(fakeRequest({ body: [] }), fakeContext());
  assert.deepEqual(res, { status: 400, jsonBody: { message: 'Dados inválidos.' } });
});

test('500 quando JSON é inválido e loga o erro', async () => {
  const { endpoint } = criar();
  const ctx = fakeContext();
  const res = await endpoint(fakeRequest({ body: new Error('json') }), ctx);
  assert.deepEqual(res, { status: 500, jsonBody: { message: 'Erro ao inserir registro.' } });
  assert.equal(ctx.erros.length, 1);
});

test('500 sem MONGODB_ATLAS_URI (banco lazy)', async () => {
  const salvo = process.env.MONGODB_ATLAS_URI;
  delete process.env.MONGODB_ATLAS_URI;
  try {
    const endpoint = inserirEndpoint(new InserirRegistroHandler(new MongoRegistroInserter()));
    const res = await endpoint(fakeRequest({ body: { a: 1 } }), fakeContext());
    assert.equal(res.status, 500);
  } finally {
    if (salvo !== undefined) process.env.MONGODB_ATLAS_URI = salvo;
  }
});
