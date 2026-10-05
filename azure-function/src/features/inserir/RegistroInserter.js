// Porta: persiste um novo registro e devolve o _id gerado.
class RegistroInserter {
  /**
   * @param {import('../../domain/TipoRegistro').TipoRegistro} tipo
   * @param {import('../../domain/DadosRegistro').DadosRegistro} dados
   * @returns {Promise<*>} id gerado
   */
  async inserir(tipo, dados) {
    throw new Error('RegistroInserter.inserir não implementado.');
  }
}

module.exports = { RegistroInserter };
