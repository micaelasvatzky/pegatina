import { MongoClient, Db } from "mongodb";

const rawMongoUri = process.env.MONGODB_URI;

if (!rawMongoUri) {
  throw new Error(
    "Falta MONGODB_URI. Definila en .env.local (ver .env.example)."
  );
}

const MONGODB_URI: string = rawMongoUri;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  cachedClient = await MongoClient.connect(MONGODB_URI);
  cachedDb = cachedClient.db("pegatina");
  return cachedDb;
}
