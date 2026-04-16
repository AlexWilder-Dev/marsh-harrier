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
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const updateResult = await client.execute({
    sql: `UPDATE orders
          SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP
          WHERE id = ? AND status = 'pending'`,
    args: [orderId],
  });

  if (updateResult.rowsAffected === 0) {
    return NextResponse.json(
      { error: "Order not found or already delivered" },
      { status: 404 }
    );
  }

  const orderResult = await client.execute({
    sql: "SELECT * FROM orders WHERE id = ?",
    args: [orderId],
  });
  return NextResponse.json(orderResult.rows[0]);
}
