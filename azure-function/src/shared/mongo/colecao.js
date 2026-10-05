const { ObjectId } = require('mongodb');
const { getDatabase } = require('./db');

// Acesso compartilhado às coleções (eventos/certificados) pelas implementações Mongo dos repositórios.
function colecao(tipo) {
  return getDatabase().collection(tipo.valor);
}

function filtroPorId(id) {
  return { _id: new ObjectId(id.valor) };
}

module.exports = { colecao, filtroPorId };
