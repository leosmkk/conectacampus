const test = require('node:test');
const assert = require('node:assert/strict');
const { ObjectId } = require('mongodb');
const { TipoRegistro } = require('../src/domain/TipoRegistro');
const { RegistroId } = require('../src/domain/RegistroId');
const { DadosRegistro } = require('../src/domain/DadosRegistro');
const { TipoInvalidoError, IdInvalidoError, DadosInvalidosError } = require('../src/domain/errors');

test('TipoRegistro assume eventos e rejeita tipos desconhecidos', () => {
  assert.equal(TipoRegistro.criar(null).valor, 'eventos');
  assert.equal(TipoRegistro.criar('certificados').valor, 'certificados');
  assert.throws(() => TipoRegistro.criar('usuarios'), TipoInvalidoError);
});

test('RegistroId equivale a ObjectId.isValid para strings', () => {
  for (const v of ['abcdefghijkl', '507f1f77bcf86cd799439011', '507F1F77BCF86CD799439011', 'xyz', '']) {
    let valido = true;
    try { RegistroId.criar(v); } catch (e) { assert.ok(e instanceof IdInvalidoError); valido = false; }
    assert.equal(valido, ObjectId.isValid(v), JSON.stringify(v));
  }
});

test('DadosRegistro exige objeto e descarta _id sem mutar o original', () => {
  const corpo = { _id: 'x', nome: 'a' };
  assert.deepEqual(DadosRegistro.criar(corpo).valores, { nome: 'a' });
  assert.equal(corpo._id, 'x');
  for (const invalido of [null, [], 'texto', 1]) {
    assert.throws(() => DadosRegistro.criar(invalido), DadosInvalidosError);
  }
});
