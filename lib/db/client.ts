import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  pdpSql?: postgres.Sql;
  pdpDb?: Db;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!process.env.DATABASE_URL) return null;

  if (!globalForDb.pdpSql) {
    globalForDb.pdpSql = postgres(process.env.DATABASE_URL, {
      max: 5,
      prepare: false,
    });
    globalForDb.pdpDb = drizzle(globalForDb.pdpSql, { schema });
  }

  return globalForDb.pdpDb ?? null;
}
