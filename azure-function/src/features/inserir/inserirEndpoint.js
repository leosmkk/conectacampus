const { TipoRegistro } = require('../../domain/TipoRegistro');
const { DadosRegistro } = require('../../domain/DadosRegistro');
const { responderErro } = require('../../shared/http');

// Presentation: POST /api/inserir. Traduz HTTP <-> caso de uso, sem acessar o banco.
function inserirEndpoint(handler) {
  return async (request, context) => {
    try {
      const tipo = TipoRegistro.criar(request.query.get('tipo'));
      const dados = DadosRegistro.criar(await request.json());

      const registro = await handler.executar({ tipo, dados });

      return {
        status: 201,
        jsonBody: { message: 'Registro inserido com sucesso.', ...registro }
      };
    } catch (error) {
      return responderErro(error, context, 'inserir', 'Erro ao inserir registro.');
    }
  };
}

module.exports = { inserirEndpoint };
