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
  let body: { table: unknown; items: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { table, items } = body;

  if (
    !table ||
    typeof table !== "number" ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json(
      { error: "table (number) and items (non-empty array) are required" },
      { status: 400 }
    );
  }

  // Check table exists
  const tableResult = await client.execute({
    sql: "SELECT id FROM tables WHERE table_number = ?",
    args: [table],
  });
  if (tableResult.rows.length === 0) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

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
    sql: "INSERT INTO orders (table_number, items) VALUES (?, ?)",
    args: [table, JSON.stringify(items)],
  });

  return NextResponse.json(
    { orderId: Number(insertResult.lastInsertRowid), status: "pending" },
    { status: 201 }
  );
}
