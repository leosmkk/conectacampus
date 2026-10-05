const { app } = require('@azure/functions');
const { alterarEndpoint } = require('../shared/compositionRoot');

app.http('alterar', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'alterar/{id}',
  handler: alterarEndpoint
});
