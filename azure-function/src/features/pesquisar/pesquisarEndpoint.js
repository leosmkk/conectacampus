const { TipoRegistro } = require('../../domain/TipoRegistro');
const { RegistroId } = require('../../domain/RegistroId');
const { responderErro } = require('../../shared/http');

// Presentation: GET /api/pesquisar[?id=]. Com id busca um registro; sem id lista todos.
function pesquisarEndpoint({ buscarPorIdHandler, listarHandler }) {
  return async (request, context) => {
    try {
      const tipo = TipoRegistro.criar(request.query.get('tipo'));
      const idInformado = request.query.get('id');

      if (idInformado) {
        const id = RegistroId.criar(idInformado);
        return { status: 200, jsonBody: await buscarPorIdHandler.executar({ tipo, id }) };
      }

      return { status: 200, jsonBody: await listarHandler.executar({ tipo }) };
    } catch (error) {
      return responderErro(error, context, 'pesquisar', 'Erro ao pesquisar dados.');
    }
  };
}

module.exports = { pesquisarEndpoint };
