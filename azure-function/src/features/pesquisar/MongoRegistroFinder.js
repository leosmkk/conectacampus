const { RegistroFinder } = require('./RegistroFinder');
const { colecao, filtroPorId } = require('../../shared/mongo/colecao');

class MongoRegistroFinder extends RegistroFinder {
  async buscarPorId(tipo, id) {
    return colecao(tipo).findOne(filtroPorId(id));
  }
}

module.exports = { MongoRegistroFinder };
