import { NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function PUT() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await client.execute(
    `UPDATE tables
     SET status = 'closed', closed_at = CURRENT_TIMESTAMP, opened_at = NULL
     WHERE status = 'open'`
  );

  return NextResponse.json({ closedCount: result.rowsAffected });
}
