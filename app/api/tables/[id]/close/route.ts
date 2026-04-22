import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tableNumber = parseInt(id, 10);
  if (isNaN(tableNumber)) {
    return NextResponse.json({ error: "Invalid table number" }, { status: 400 });
  }

  const result = await client.execute({
    sql: `UPDATE tables
          SET status = 'closed', closed_at = CURRENT_TIMESTAMP, opened_at = NULL
          WHERE table_number = ?`,
    args: [tableNumber],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  await client.execute({
    sql: `UPDATE orders SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP
          WHERE table_number = ? AND status = 'pending'`,
    args: [tableNumber],
  });

  return NextResponse.json({ success: true });
}
