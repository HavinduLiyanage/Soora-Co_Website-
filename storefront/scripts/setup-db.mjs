import { Pool } from "pg";
import { getMigrations } from "better-auth/db/migration";
import { readFile } from "node:fs/promises";
import { authOptions } from "../lib/server/auth-options.ts";
if (
  !process.env.DATABASE_URL ||
  !process.env.BETTER_AUTH_SECRET ||
  !process.env.BETTER_AUTH_URL
)
  throw new Error(
    "Set DATABASE_URL, BETTER_AUTH_SECRET and BETTER_AUTH_URL in .env.local first.",
  );
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  const migration = await getMigrations(authOptions(pool));
  await migration.runMigrations();
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(
      await readFile(new URL("../db/001-store.sql", import.meta.url), "utf8"),
    );
    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
  console.log(
    "Auth and store schema ready. No sample inventory was published.",
  );
} finally {
  await pool.end();
}
