// Composition root: único lugar que conhece as implementações concretas e injeta as portas nos casos de uso.
const { MongoRegistroInserter } = require('../features/inserir/MongoRegistroInserter');
const { InserirRegistroHandler } = require('../features/inserir/InserirRegistroHandler');
const { inserirEndpoint } = require('../features/inserir/inserirEndpoint');
const { MongoRegistroUpdater } = require('../features/alterar/MongoRegistroUpdater');
const { AlterarRegistroHandler } = require('../features/alterar/AlterarRegistroHandler');
const { alterarEndpoint } = require('../features/alterar/alterarEndpoint');
const { MongoRegistroFinder } = require('../features/pesquisar/MongoRegistroFinder');
const { MongoRegistroLister } = require('../features/pesquisar/MongoRegistroLister');
const { BuscarRegistroPorIdHandler } = require('../features/pesquisar/BuscarRegistroPorIdHandler');
const { ListarRegistrosHandler } = require('../features/pesquisar/ListarRegistrosHandler');
const { pesquisarEndpoint } = require('../features/pesquisar/pesquisarEndpoint');
const { MongoRegistroRemover } = require('../features/excluir/MongoRegistroRemover');
const { ExcluirRegistroHandler } = require('../features/excluir/ExcluirRegistroHandler');
const { excluirEndpoint } = require('../features/excluir/excluirEndpoint');

const inserirRegistroHandler = new InserirRegistroHandler(new MongoRegistroInserter());
const alterarRegistroHandler = new AlterarRegistroHandler(new MongoRegistroUpdater());
const buscarRegistroPorIdHandler = new BuscarRegistroPorIdHandler(new MongoRegistroFinder());
const listarRegistrosHandler = new ListarRegistrosHandler(new MongoRegistroLister());
const excluirRegistroHandler = new ExcluirRegistroHandler(new MongoRegistroRemover());

module.exports = {
  inserirEndpoint: inserirEndpoint(inserirRegistroHandler),
  alterarEndpoint: alterarEndpoint(alterarRegistroHandler),
  pesquisarEndpoint: pesquisarEndpoint({
    buscarPorIdHandler: buscarRegistroPorIdHandler,
    listarHandler: listarRegistrosHandler
  }),
  excluirEndpoint: excluirEndpoint(excluirRegistroHandler)
};
