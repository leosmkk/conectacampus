const { app } = require('@azure/functions');
const { getDatabase } = require('../db');

app.http('eventos', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'eventos',

  handler: async (request, context) => {
    try {
      const db = getDatabase();

      const eventos = await db
        .collection('eventos')
        .find({})
        .sort({ order: 1 })
        .toArray();

      return {
        status: 200,
        jsonBody: eventos
      };
    } catch (error) {
      context.error('Erro ao consultar eventos:', error);

      return {
        status: 500,
        jsonBody: {
          message: 'Erro ao buscar eventos.'
        }
      };
    }
  }
});
