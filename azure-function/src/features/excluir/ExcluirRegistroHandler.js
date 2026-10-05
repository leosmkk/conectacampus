const { RegistroNaoEncontradoError } = require('../../domain/errors');

// Caso de uso: excluir um registro. Depende apenas da porta RegistroRemover.
class ExcluirRegistroHandler {
  constructor(registroRemover) {
    this.registroRemover = registroRemover;
  }

  async executar({ tipo, id }) {
    const removido = await this.registroRemover.remover(tipo, id);

    if (!removido) {
      throw new RegistroNaoEncontradoError();
    }
  }
}

module.exports = { ExcluirRegistroHandler };
