const { TipoRegistro } = require('../../domain/TipoRegistro');
const { RegistroId } = require('../../domain/RegistroId');
const { DadosRegistro } = require('../../domain/DadosRegistro');
const { responderErro } = require('../../shared/http');

// Presentation: PUT /api/alterar/{id}. Ordem de validação: tipo, id, corpo.
function alterarEndpoint(handler) {
  return async (request, context) => {
    try {
      const tipo = TipoRegistro.criar(request.query.get('tipo'));
      const id = RegistroId.criar(request.params.id);
      const dados = DadosRegistro.criar(await request.json());

      const registro = await handler.executar({ tipo, id, dados });

      return {
        status: 200,
        jsonBody: { message: 'Registro alterado com sucesso.', registro }
      };
    } catch (error) {
      return responderErro(error, context, 'alterar', 'Erro ao alterar registro.');
    }
  };
}

module.exports = { alterarEndpoint };
