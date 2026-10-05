// Composition root: único lugar que conhece as implementações concretas e injeta as portas nos casos de uso.
const { MongoRegistroInserter } = require('../features/inserir/MongoRegistroInserter');
const { InserirRegistroHandler } = require('../features/inserir/InserirRegistroHandler');
const { inserirEndpoint } = require('../features/inserir/inserirEndpoint');

const inserirRegistroHandler = new InserirRegistroHandler(new MongoRegistroInserter());

module.exports = {
  inserirEndpoint: inserirEndpoint(inserirRegistroHandler)
};
