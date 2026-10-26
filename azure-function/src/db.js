/*
* Este arquivo é responsável por disponibilizar o acesso ao banco de dados
* */
const { MongoClient } = require('mongodb');

let client;
let database;

function getDatabase() {
  if (database) {
    return database;
  }

  // process.env permite acessar variáveis de ambiente
  // essas variáveis armazenam configurações que podem variar entre ambientes (Ambiente local, de teste ou de produção)
  const uri = process.env.MONGODB_ATLAS_URI;
  const databaseName =
    process.env.MONGODB_ATLAS_DATABASE || 'conectacampus';

  if (!uri) {
    throw new Error('MONGODB_ATLAS_URI não configurada.');
  }

  client = client || new MongoClient(uri); // cache de instância em escopo de módulo com inicialização sob demanda
  database = client.db(databaseName);

  return database;
}

module.exports = {
  getDatabase
};
