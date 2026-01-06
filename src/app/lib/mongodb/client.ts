/**
 * MongoDB Client
 *
 * Singleton connection pattern with global caching for dev hot reloads.
 * Connects to the same MongoDB database as pikselplay (char-ui) app.
 */

import { MongoClient, MongoClientOptions, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable');
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// In development, use global to preserve connection across hot reloads
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Get database instance
 * @param dbName - Optional database name, defaults to MONGODB_DB_NAME env var
 */
export async function getDatabase(dbName?: string): Promise<Db> {
  const mongoClient = await clientPromise;
  return mongoClient.db(dbName || process.env.MONGODB_DB_NAME || 'char');
}

/**
 * Get the assets collection
 */
export async function getAssetsCollection() {
  const db = await getDatabase();
  return db.collection('assets');
}
