const { DadosInvalidosError } = require('./errors');

// Value object: conteúdo de um registro. Deve ser um objeto; o _id é gerado pelo banco e nunca vem do cliente.
class DadosRegistro {
  constructor(valores) {
    this.valores = valores;
    Object.freeze(this);
  }

  static criar(corpo) {
    if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
      throw new DadosInvalidosError();
    }

    const { _id, ...valores } = corpo;

    return new DadosRegistro(valores);
  }
}

module.exports = { DadosRegistro };
