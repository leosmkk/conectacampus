const { RegistroLister } = require('./RegistroLister');
const { colecao } = require('../../shared/mongo/colecao');

class MongoRegistroLister extends RegistroLister {
  async listar(tipo) {
    return colecao(tipo).find({}).sort({ order: 1 }).toArray();
  }
}

module.exports = { MongoRegistroLister };
