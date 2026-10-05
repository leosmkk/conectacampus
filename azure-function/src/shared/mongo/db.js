const { MongoClient } = require('mongodb');

let client;
let database;

function getDatabase() {
  if (database) {
    return database;
  }

  const uri = process.env.MONGODB_ATLAS_URI;
  const databaseName =
    process.env.MONGODB_ATLAS_DATABASE || 'conectacampus';

  if (!uri) {
    throw new Error('MONGODB_ATLAS_URI não configurada.');
  }

  client = client || new MongoClient(uri);
  database = client.db(databaseName);

  return database;
}

module.exports = {
  getDatabase
};
