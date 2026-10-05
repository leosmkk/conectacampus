const { RegistroNaoEncontradoError } = require('../../domain/errors');

// Caso de uso: alterar um registro. Depende apenas da porta RegistroUpdater.
class AlterarRegistroHandler {
  constructor(registroUpdater) {
    this.registroUpdater = registroUpdater;
  }

  async executar({ tipo, id, dados }) {
    const registro = await this.registroUpdater.atualizar(tipo, id, dados);

    if (!registro) {
      throw new RegistroNaoEncontradoError();
    }

    return registro;
  }
}

module.exports = { AlterarRegistroHandler };
