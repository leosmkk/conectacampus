const { TipoInvalidoError } = require('./errors');

const TIPOS_PERMITIDOS = ['eventos', 'certificados'];
const TIPO_PADRAO = 'eventos';

// Value object: tipo de registro (eventos OU certificados). Valor ausente assume eventos.
class TipoRegistro {
  constructor(valor) {
    this.valor = valor;
    Object.freeze(this);
  }

  static criar(valor) {
    const tipo = valor || TIPO_PADRAO;

    if (!TIPOS_PERMITIDOS.includes(tipo)) {
      throw new TipoInvalidoError();
    }

    return new TipoRegistro(tipo);
  }

  toString() {
    return this.valor;
  }
}

module.exports = { TipoRegistro, TIPOS_PERMITIDOS };
