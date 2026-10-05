class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class TipoInvalidoError extends DomainError {
  constructor() {
    super('Tipo inválido. Utilize eventos ou certificados.');
  }
}

class IdInvalidoError extends DomainError {
  constructor() {
    super('ID inválido.');
  }
}

class DadosInvalidosError extends DomainError {
  constructor() {
    super('Dados inválidos.');
  }
}

class RegistroNaoEncontradoError extends DomainError {
  constructor() {
    super('Registro não encontrado.');
  }
}

module.exports = {
  DomainError,
  TipoInvalidoError,
  IdInvalidoError,
  DadosInvalidosError,
  RegistroNaoEncontradoError
};
