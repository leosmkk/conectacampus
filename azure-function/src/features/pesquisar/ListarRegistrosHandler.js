// Caso de uso: listar os registros de um tipo.
class ListarRegistrosHandler {
  constructor(registroLister) {
    this.registroLister = registroLister;
  }

  async executar({ tipo }) {
    return this.registroLister.listar(tipo);
  }
}

module.exports = { ListarRegistrosHandler };
