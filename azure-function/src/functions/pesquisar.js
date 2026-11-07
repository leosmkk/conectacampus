// registra funções HTTP na Azure Functions
const { app } = require('@azure/functions');
const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db');
const { getTipo } = require('../collection');

// app.http: registra uma função que poderá ser executada quando uma requisição HTTP chegar
app.http('pesquisar', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'pesquisar',

  // handler: é a função executada quando uma requisição chega
  // request: representa a requisição HTTP, assim conseguimos acessar os parâmetros enviados pelo frontend
  // context: contém informações sobre a execução da Azure e disponibiliza recursos como registro de erro
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
