const { app } = require('@azure/functions');
const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db');
const { getTipo } = require('../collection');

app.http('pesquisar', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'pesquisar',

  handler: async (request, context) => {
    try {
      const tipo = getTipo(request);

      if (!tipo) {
        return {
          status: 400,
          jsonBody: { message: 'Tipo inválido. Utilize eventos ou certificados.' }
        };
      }

      const collection = getDatabase().collection(tipo);
      const id = request.query.get('id');

      if (id) {
        if (!ObjectId.isValid(id)) {
          return {
            status: 400,
            jsonBody: { message: 'ID inválido.' }
          };
        }

        const documento = await collection.findOne({ _id: new ObjectId(id) });

        if (!documento) {
          return {
            status: 404,
            jsonBody: { message: 'Registro não encontrado.' }
          };
        }

        return { status: 200, jsonBody: documento };
      }

      const documentos = await collection.find({}).sort({ order: 1 }).toArray();

      return { status: 200, jsonBody: documentos };
    } catch (error) {
      context.error('Erro ao pesquisar:', error);

      return {
        status: 500,
        jsonBody: { message: 'Erro ao pesquisar dados.' }
      };
    }
  }
});
