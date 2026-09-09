import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Conexión cacheada a MongoDB Atlas.
 * El throw por faltar MONGODB_URI es PER-EZOSO: se lanza recién cuando
 * alguien pide la DB, así los builds sin la variable no explotan al importar.
 */
export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Falta MONGODB_URI. Definila en .env.local (ver .env.example)."
    );
  }

  cachedClient = await MongoClient.connect(uri);
  cachedDb = cachedClient.db("pegatina");
  return cachedDb;
}