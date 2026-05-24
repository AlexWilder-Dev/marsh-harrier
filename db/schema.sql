-- The Marsh Harrier — Ordering System Schema
-- Turso (libSQL/SQLite)
--
-- This file is for reference only. The live schema is created automatically
-- by calling POST /api/init after first deployment (requires admin auth).
-- See README.md for setup instructions.

CREATE TABLE IF NOT EXISTS tables (
  id           INTEGER PRIMARY KEY,
  table_number INTEGER UNIQUE NOT NULL,
  status       TEXT    DEFAULT 'closed',  -- 'open' | 'closed'
  opened_at    DATETIME,
  closed_at    DATETIME
);

-- Tables 1–20 are pre-seeded by /api/init on first run.
-- Table 0 is reserved for takeaway orders and is auto-created on first takeaway order.

CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER  PRIMARY KEY AUTOINCREMENT,
  table_number   INTEGER  NOT NULL,
  items          TEXT     NOT NULL,       -- JSON array: [{ id, name, quantity, price, parentId? }]
  status         TEXT     DEFAULT 'pending', -- 'pending' | 'delivered'
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at   DATETIME,
  customer_name  TEXT,                    -- takeaway orders only
  customer_phone TEXT                     -- takeaway orders only
);

-- Single-row settings table for admin-controlled flags.
CREATE TABLE IF NOT EXISTS settings (
  id                  INTEGER PRIMARY KEY CHECK (id = 1),
  orders_paused       INTEGER NOT NULL DEFAULT 0, -- 0 = accepting, 1 = paused
  drink_delay_minutes INTEGER NOT NULL DEFAULT 0  -- 0 / 5 / 10 / 15 / 20
);
INSERT OR IGNORE INTO settings (id, orders_paused, drink_delay_minutes) VALUES (1, 0, 0);

-- Per-menu-item overrides. NULL = inherit from data/menu.json.
CREATE TABLE IF NOT EXISTS menu_overrides (
  menu_id     INTEGER PRIMARY KEY,
  available   INTEGER, -- 0 / 1 / NULL
  description TEXT
);
