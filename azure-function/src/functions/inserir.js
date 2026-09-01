const { app } = require('@azure/functions');
const { getDatabase } = require('../db');
const { getTipo } = require('../collection');

app.http('inserir', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'inserir',

  handler: async (request, context) => {
    try {
      const tipo = getTipo(request);

      if (!tipo) {
        return {
          status: 400,
          jsonBody: { message: 'Tipo inválido. Utilize eventos ou certificados.' }
        };
      }

      const body = await request.json();

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return {
          status: 400,
          jsonBody: { message: 'Dados inválidos.' }
        };
      }

      // O MongoDB gera o _id.
      delete body._id;

      const resultado = await getDatabase().collection(tipo).insertOne(body);

      return {
        status: 201,
        jsonBody: {
          message: 'Registro inserido com sucesso.',
          _id: resultado.insertedId,
          ...body
        }
      };
    } catch (error) {
      context.error('Erro ao inserir:', error);

      return {
        status: 500,
        jsonBody: { message: 'Erro ao inserir registro.' }
      };
    }
  }
});
