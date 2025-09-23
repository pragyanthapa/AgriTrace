import { MongoClient } from 'mongodb';

let cachedClient = null;

export async function getDbClient() {
  if (cachedClient) return cachedClient;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agritrace';
  const client = new MongoClient(uri, { ignoreUndefined: true });
  await client.connect();
  cachedClient = client;
  return cachedClient;
}

export function getDb(client) {
  const dbName = process.env.MONGODB_DB || 'agritrace';
  return client.db(dbName);
}


