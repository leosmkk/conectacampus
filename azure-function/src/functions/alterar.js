// registra funções HTTP na Azure Functions
const { app } = require('@azure/functions');
const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db');
const { getTipo } = require('../collection');

// PUT é usado para atualizar um recurso existente
app.http('alterar', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'alterar/{id}',

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

      const body = await request.json();

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return {
          status: 400,
          jsonBody: { message: 'Dados inválidos.' }
        };
      }

      delete body._id;

      const collection = getDatabase().collection(tipo);

      const resultado = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: body }
      );

      if (resultado.matchedCount === 0) {
        return {
          status: 404,
          jsonBody: { message: 'Registro não encontrado.' }
        };
      }

      // recupera o registro após a alteração
      const registro = await collection.findOne({ _id: new ObjectId(id) });

      return {
        status: 200,
        jsonBody: {
          message: 'Registro alterado com sucesso.',
          registro
        }
      };
    } catch (error) {
      context.error('Erro ao alterar:', error);

      return {
        status: 500,
        jsonBody: { message: 'Erro ao alterar registro.' }
      };
    }
  }
});
