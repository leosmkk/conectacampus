// Composition root: único lugar que conhece as implementações concretas e injeta as portas nos casos de uso.
const { MongoRegistroInserter } = require('../features/inserir/MongoRegistroInserter');
const { InserirRegistroHandler } = require('../features/inserir/InserirRegistroHandler');
const { inserirEndpoint } = require('../features/inserir/inserirEndpoint');
const { MongoRegistroUpdater } = require('../features/alterar/MongoRegistroUpdater');
const { AlterarRegistroHandler } = require('../features/alterar/AlterarRegistroHandler');
const { alterarEndpoint } = require('../features/alterar/alterarEndpoint');

const inserirRegistroHandler = new InserirRegistroHandler(new MongoRegistroInserter());
const alterarRegistroHandler = new AlterarRegistroHandler(new MongoRegistroUpdater());

module.exports = {
  inserirEndpoint: inserirEndpoint(inserirRegistroHandler),
  alterarEndpoint: alterarEndpoint(alterarRegistroHandler)
};
