const { TipoRegistro } = require('../../domain/TipoRegistro');
const { RegistroId } = require('../../domain/RegistroId');
const { responderErro } = require('../../shared/http');

// Presentation: DELETE /api/excluir/{id}.
function excluirEndpoint(handler) {
  return async (request, context) => {
    try {
      const tipo = TipoRegistro.criar(request.query.get('tipo'));
      const id = RegistroId.criar(request.params.id);

      await handler.executar({ tipo, id });

      return { status: 200, jsonBody: { message: 'Registro excluído com sucesso.' } };
    } catch (error) {
      return responderErro(error, context, 'excluir', 'Erro ao excluir registro.');
    }
  };
}

module.exports = { excluirEndpoint };
