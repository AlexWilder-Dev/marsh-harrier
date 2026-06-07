import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// PUT /api/orders/[id]/discount — admin only
// Body: { percent: number, reason?: string }
//   percent 0 (or omitted reason + percent: 0) clears the discount entirely.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  let body: { percent?: unknown; reason?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const percent = Number(body.percent);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return NextResponse.json(
      { error: "percent must be a number between 0 and 100" },
      { status: 400 }
    );
  }

  const reason =
    typeof body.reason === "string" ? body.reason.trim().slice(0, 60) || null : null;

  // percent === 0 clears the reason too so the order looks pristine again.
  const finalReason = percent === 0 ? null : reason;

  const result = await client.execute({
    sql: `UPDATE orders
            SET discount_percent = ?, discount_reason = ?
          WHERE id = ?`,
    args: [Math.round(percent), finalReason, orderId],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderId,
    discountPercent: Math.round(percent),
    discountReason: finalReason,
  });
}
