import { MongoClient } from 'mongodb';
import { mongoRepository } from './infrastructure/mongo-repository.js';
import { createApp } from './api/app.js';

if (!process.env.MONGODB_URI || !process.env.SERVICE_TOKEN) throw new Error('Configure MONGODB_URI e SERVICE_TOKEN.');
const client = await new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 }).connect();
const server = createApp(mongoRepository(client.db(process.env.MONGODB_DATABASE ?? 'conectacampus')), process.env.SERVICE_TOKEN)
  .listen(process.env.PORT ?? 3001, '0.0.0.0');
process.on('SIGTERM', () => server.close(async () => { await client.close(); process.exit(0); }));
