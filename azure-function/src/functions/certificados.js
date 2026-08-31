const { app } = require('@azure/functions');
const { getDatabase } = require('../db');

app.http('certificados', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'certificados',

  handler: async (request, context) => {
    try {
      const db = getDatabase();

      const certificados = await db
        .collection('certificados')
        .find({})
        .sort({ order: 1 })
        .toArray();

      return {
        status: 200,
        jsonBody: certificados
      };
    } catch (error) {
      context.error('Erro ao consultar certificados:', error);

      return {
        status: 500,
        jsonBody: {
          message: 'Erro ao buscar certificados.'
        }
      };
    }
  }
});
