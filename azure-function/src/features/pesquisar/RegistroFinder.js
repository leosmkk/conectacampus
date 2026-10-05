// Porta: busca um registro por id (null se não existir).
class RegistroFinder {
  /**
   * @param {import('../../domain/TipoRegistro').TipoRegistro} tipo
   * @param {import('../../domain/RegistroId').RegistroId} id
   * @returns {Promise<object|null>}
   */
  async buscarPorId(tipo, id) {
    throw new Error('RegistroFinder.buscarPorId não implementado.');
  }
}

module.exports = { RegistroFinder };
