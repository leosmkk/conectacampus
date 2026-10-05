const { app } = require('@azure/functions');
const { pesquisarEndpoint } = require('../shared/compositionRoot');

app.http('pesquisar', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'pesquisar',
  handler: pesquisarEndpoint
});
