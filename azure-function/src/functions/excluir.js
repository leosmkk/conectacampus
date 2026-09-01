const { app } = require('@azure/functions');
const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db');
const { getTipo } = require('../collection');

app.http('excluir', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'excluir/{id}',

  handler: async (request, context) => {
    try {
      const tipo = getTipo(request);
      const id = request.params.id;

      if (!tipo) {
        return {
          status: 400,
          jsonBody: { message: 'Tipo inválido. Utilize eventos ou certificados.' }
        };
      }

      if (!ObjectId.isValid(id)) {
        return {
          status: 400,
          jsonBody: { message: 'ID inválido.' }
        };
      }

      const resultado = await getDatabase()
        .collection(tipo)
        .deleteOne({ _id: new ObjectId(id) });

      if (resultado.deletedCount === 0) {
        return {
          status: 404,
          jsonBody: { message: 'Registro não encontrado.' }
        };
      }

      return {
        status: 200,
        jsonBody: { message: 'Registro excluído com sucesso.' }
      };
    } catch (error) {
      context.error('Erro ao excluir:', error);

      return {
        status: 500,
        jsonBody: { message: 'Erro ao excluir registro.' }
      };
    }
  }
});
