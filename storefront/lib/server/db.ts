import "server-only";
import { Pool } from "pg";

let pool: Pool | undefined;
export const databaseConfigured = () => Boolean(process.env.DATABASE_URL);
export const adminConfigured = () =>
  databaseConfigured() &&
  Boolean(process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_URL);
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured.");
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
      query_timeout: 20_000,
      allowExitOnIdle: true,
    });
    pool.on("error", () =>
      console.warn(
        "An idle database connection closed. The pool will reconnect.",
      ),
    );
  }
  return pool;
}
