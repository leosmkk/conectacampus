const { IdInvalidoError } = require('./errors');

// Mesma regra de ObjectId.isValid para strings: 24 caracteres hexadecimais.
const FORMATO_ID = /^[0-9a-fA-F]{24}$/;

// Value object: identificador de um registro.
class RegistroId {
  constructor(valor) {
    this.valor = valor;
    Object.freeze(this);
  }

  static criar(valor) {
    if (typeof valor !== 'string' || !FORMATO_ID.test(valor)) {
      throw new IdInvalidoError();
    }

    return new RegistroId(valor);
  }

  toString() {
    return this.valor;
  }
}

module.exports = { RegistroId };
