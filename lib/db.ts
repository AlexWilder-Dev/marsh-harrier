import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/ordering.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// Module-level singleton — reused across requests in the same serverless instance
export const client = createClient(authToken ? { url, authToken } : { url });

export async function initDb() {
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS tables (
        id INTEGER PRIMARY KEY,
        table_number INTEGER UNIQUE NOT NULL,
        status TEXT DEFAULT 'closed',
        opened_at DATETIME,
        closed_at DATETIME
      )`,
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_number INTEGER NOT NULL,
        items TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        delivered_at DATETIME
      )`,
    ],
    "write"
  );

  // Pre-populate tables 1–20 on first run
  const result = await client.execute("SELECT COUNT(*) as count FROM tables");
  const count = Number(result.rows[0].count);

  if (count === 0) {
    await client.batch(
      Array.from({ length: 20 }, (_, i) => ({
        sql: "INSERT OR IGNORE INTO tables (table_number) VALUES (?)",
        args: [i + 1],
      })),
      "write"
    );
  }
}
