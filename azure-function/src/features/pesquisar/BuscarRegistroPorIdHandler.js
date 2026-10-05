const { RegistroNaoEncontradoError } = require('../../domain/errors');

// Caso de uso: buscar um registro pelo id.
class BuscarRegistroPorIdHandler {
  constructor(registroFinder) {
    this.registroFinder = registroFinder;
  }

  async executar({ tipo, id }) {
    const registro = await this.registroFinder.buscarPorId(tipo, id);

    if (!registro) {
      throw new RegistroNaoEncontradoError();
    }

    return registro;
  }
}

module.exports = { BuscarRegistroPorIdHandler };
