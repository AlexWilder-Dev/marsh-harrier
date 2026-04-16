import { NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// GET /api/tables — list all open tables with their pending orders
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tablesResult = await client.execute(
    `SELECT t.*,
      (SELECT COUNT(*) FROM orders o WHERE o.table_number = t.table_number AND o.status = 'pending') as pending_count
     FROM tables t
     WHERE t.status = 'open'
     ORDER BY t.table_number`
  );

  const ordersResult = await client.execute(
    `SELECT * FROM orders
     WHERE status = 'pending'
     ORDER BY created_at ASC`
  );

  const ordersWithParsedItems = ordersResult.rows.map((o) => ({
    ...o,
    items: JSON.parse(o.items as string),
  }));

  return NextResponse.json({ tables: tablesResult.rows, orders: ordersWithParsedItems });
}
