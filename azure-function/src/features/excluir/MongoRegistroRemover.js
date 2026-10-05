const { RegistroRemover } = require('./RegistroRemover');
const { colecao, filtroPorId } = require('../../shared/mongo/colecao');

class MongoRegistroRemover extends RegistroRemover {
  async remover(tipo, id) {
    const resultado = await colecao(tipo).deleteOne(filtroPorId(id));

    return resultado.deletedCount > 0;
  }
}

module.exports = { MongoRegistroRemover };
