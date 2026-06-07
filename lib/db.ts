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
        delivered_at DATETIME,
        customer_name TEXT,
        customer_phone TEXT,
        discount_percent INTEGER NOT NULL DEFAULT 0,
        discount_reason TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        orders_paused INTEGER NOT NULL DEFAULT 0,
        drink_delay_minutes INTEGER NOT NULL DEFAULT 0
      )`,
      `INSERT OR IGNORE INTO settings (id, orders_paused, drink_delay_minutes) VALUES (1, 0, 0)`,
      `CREATE TABLE IF NOT EXISTS menu_overrides (
        menu_id     INTEGER PRIMARY KEY,
        available   INTEGER,
        description TEXT
      )`,
    ],
    "write"
  );

  // Idempotent migrations for columns added after launch. ALTER TABLE will
  // throw "duplicate column" once the column exists; swallow that case only.
  const migrations = [
    `ALTER TABLE orders ADD COLUMN discount_percent INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE orders ADD COLUMN discount_reason TEXT`,
  ];
  for (const sql of migrations) {
    try {
      await client.execute(sql);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (!/duplicate column/i.test(msg)) throw e;
    }
  }

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
