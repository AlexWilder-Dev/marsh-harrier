import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tableNumber = parseInt(id, 10);
  if (isNaN(tableNumber)) {
    return NextResponse.json({ error: "Invalid table number" }, { status: 400 });
  }

  const result = await client.execute({
    sql: `UPDATE tables
          SET status = 'open', opened_at = CURRENT_TIMESTAMP, closed_at = NULL
          WHERE table_number = ?`,
    args: [tableNumber],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  const tableResult = await client.execute({
    sql: "SELECT * FROM tables WHERE table_number = ?",
    args: [tableNumber],
  });
  return NextResponse.json(tableResult.rows[0]);
}
