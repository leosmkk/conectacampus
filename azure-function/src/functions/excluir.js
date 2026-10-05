const { app } = require('@azure/functions');
const { excluirEndpoint } = require('../shared/compositionRoot');

app.http('excluir', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'excluir/{id}',
  handler: excluirEndpoint
});
