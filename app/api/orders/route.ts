import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// GET /api/orders — staff use, requires auth
// Query: ?status=pending|delivered|all
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") ?? "pending";

  const result =
    status === "all"
      ? await client.execute("SELECT * FROM orders ORDER BY created_at DESC")
      : await client.execute({
          sql: "SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC",
          args: [status],
        });

  return NextResponse.json(result.rows);
}

// POST /api/orders — customer creates order
// Body: { table: number, items: [{ id, name, quantity, price }] }
export async function POST(request: NextRequest) {
  let body: { table: unknown; items: unknown; customerName?: unknown; customerPhone?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { table, items, customerName, customerPhone } = body;

  // table 0 = takeaway (no physical table); 1–99 = dine-in
  if (
    typeof table !== "number" ||
    !Number.isInteger(table) ||
    table < 0 ||
    table > 99 ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json(
      { error: "table (0–99) and items (non-empty array) are required" },
      { status: 400 }
    );
  }

  const name = typeof customerName === "string" ? customerName.trim().slice(0, 100) : null;
  const phone = typeof customerPhone === "string" ? customerPhone.trim().slice(0, 30) : null;

  if (table === 0 && (!name || !phone)) {
    return NextResponse.json(
      { error: "Name and phone number are required for takeaway orders." },
      { status: 400 }
    );
  }

  if (phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }

  // Honour the admin's "pause online orders" toggle.
  // Wrapped in try so existing deployments still accept orders before /api/init runs.
  try {
    const pausedResult = await client.execute(
      "SELECT orders_paused FROM settings WHERE id = 1"
    );
    if (pausedResult.rows.length > 0 && Number(pausedResult.rows[0].orders_paused) === 1) {
      return NextResponse.json(
        { error: "We're a bit slammed right now — online ordering is paused. Please flag down a member of staff." },
        { status: 503 }
      );
    }
  } catch {
    // settings table not yet initialised — treat as accepting orders
  }

  // Auto-create table entry for dine-in and takeaway (table 0)
  await client.execute({
    sql: "INSERT OR IGNORE INTO tables (table_number) VALUES (?)",
    args: [table],
  });

  // Rate limit: max 10 orders per table per hour
  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as count FROM orders
          WHERE table_number = ? AND created_at > datetime('now', '-1 hour')`,
    args: [table],
  });
  const count = Number(countResult.rows[0].count);

  if (count >= 10) {
    return NextResponse.json(
      { error: "Too many orders placed. Please speak to a member of staff." },
      { status: 429 }
    );
  }

  // Auto-open table on first order
  await client.execute({
    sql: `UPDATE tables
          SET status = 'open',
              opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP),
              closed_at = NULL
          WHERE table_number = ? AND status = 'closed'`,
    args: [table],
  });

  const insertResult = await client.execute({
    sql: "INSERT INTO orders (table_number, items, customer_name, customer_phone) VALUES (?, ?, ?, ?)",
    args: [table, JSON.stringify(items), name, phone],
  });

  return NextResponse.json(
    { orderId: Number(insertResult.lastInsertRowid), status: "pending" },
    { status: 201 }
  );
}
