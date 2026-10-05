const { RegistroInserter } = require('./RegistroInserter');
const { colecao } = require('../../shared/mongo/colecao');

class MongoRegistroInserter extends RegistroInserter {
  async inserir(tipo, dados) {
    const resultado = await colecao(tipo).insertOne({ ...dados.valores });

    return resultado.insertedId;
  }
}

module.exports = { MongoRegistroInserter };
