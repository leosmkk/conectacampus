const { RegistroUpdater } = require('./RegistroUpdater');
const { colecao, filtroPorId } = require('../../shared/mongo/colecao');

class MongoRegistroUpdater extends RegistroUpdater {
  async atualizar(tipo, id, dados) {
    const collection = colecao(tipo);

    const resultado = await collection.updateOne(filtroPorId(id), { $set: { ...dados.valores } });

    if (resultado.matchedCount === 0) {
      return null;
    }

    return collection.findOne(filtroPorId(id));
  }
}

module.exports = { MongoRegistroUpdater };
