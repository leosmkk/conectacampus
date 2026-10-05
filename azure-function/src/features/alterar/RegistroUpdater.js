// Porta: atualiza um registro existente e devolve o registro atualizado, ou null se não existir.
class RegistroUpdater {
  /**
   * @param {import('../../domain/TipoRegistro').TipoRegistro} tipo
   * @param {import('../../domain/RegistroId').RegistroId} id
   * @param {import('../../domain/DadosRegistro').DadosRegistro} dados
   * @returns {Promise<object|null>}
   */
  async atualizar(tipo, id, dados) {
    throw new Error('RegistroUpdater.atualizar não implementado.');
  }
}

module.exports = { RegistroUpdater };
