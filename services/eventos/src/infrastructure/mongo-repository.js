import { ObjectId } from 'mongodb';
import { ValidationError } from '../domain/evento.js';

function key(id) {
  if (!/^[a-f0-9]{24}$/i.test(id)) throw new ValidationError('Identificador inválido.');
  return new ObjectId(id);
}

export function mongoRepository(database) {
  const collection = database.collection('eventos');
  return {
    list: () => collection.find({}).sort({ order: 1, _id: 1 }).limit(1000).toArray(),
    get: (id) => collection.findOne({ _id: key(id) }),
    async create(data) {
      const { insertedId } = await collection.insertOne(data);
      return { ...data, _id: insertedId.toHexString() };
    },
    update: (id, data) => collection.findOneAndUpdate({ _id: key(id) }, { $set: data }, { returnDocument: 'after' }),
    async delete(id) { return (await collection.deleteOne({ _id: key(id) })).deletedCount > 0; }
  };
}
