// Porta: lista todos os registros do tipo, ordenados por `order`.
class RegistroLister {
  /**
   * @param {import('../../domain/TipoRegistro').TipoRegistro} tipo
   * @returns {Promise<object[]>}
   */
  async listar(tipo) {
    throw new Error('RegistroLister.listar não implementado.');
  }
}

module.exports = { RegistroLister };
