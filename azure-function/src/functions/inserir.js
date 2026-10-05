const { app } = require('@azure/functions');
const { inserirEndpoint } = require('../shared/compositionRoot');

app.http('inserir', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'inserir',
  handler: inserirEndpoint
});
