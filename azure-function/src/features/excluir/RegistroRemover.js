// Porta: remove um registro; devolve true se removeu, false se não existia.
class RegistroRemover {
  /**
   * @param {import('../../domain/TipoRegistro').TipoRegistro} tipo
   * @param {import('../../domain/RegistroId').RegistroId} id
   * @returns {Promise<boolean>}
   */
  async remover(tipo, id) {
    throw new Error('RegistroRemover.remover não implementado.');
  }
}

module.exports = { RegistroRemover };
