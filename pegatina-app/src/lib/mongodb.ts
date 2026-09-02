import { MongoClient, Db } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://svatzkymicaela_db_user:AcbSNIFdveUOjEK1@cluster0.qjofplw.mongodb.net/?appName=Cluster0";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  cachedClient = await MongoClient.connect(MONGODB_URI);
  cachedDb = cachedClient.db("pegatina");
  return cachedDb;
}
