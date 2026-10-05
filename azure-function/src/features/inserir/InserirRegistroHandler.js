// Caso de uso: inserir um registro. Depende apenas da porta RegistroInserter.
class InserirRegistroHandler {
  constructor(registroInserter) {
    this.registroInserter = registroInserter;
  }

  async executar({ tipo, dados }) {
    const _id = await this.registroInserter.inserir(tipo, dados);

    return { _id, ...dados.valores };
  }
}

module.exports = { InserirRegistroHandler };
