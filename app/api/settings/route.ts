import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

const ALLOWED_DELAYS = new Set([0, 5, 10, 15, 20]);

type SettingsRow = {
  orders_paused: number;
  drink_delay_minutes: number;
};

async function readSettings(): Promise<SettingsRow> {
  const result = await client.execute(
    "SELECT orders_paused, drink_delay_minutes FROM settings WHERE id = 1"
  );
  if (result.rows.length === 0) {
    await client.execute(
      "INSERT OR IGNORE INTO settings (id, orders_paused, drink_delay_minutes) VALUES (1, 0, 0)"
    );
    return { orders_paused: 0, drink_delay_minutes: 0 };
  }
  const row = result.rows[0] as unknown as SettingsRow;
  return {
    orders_paused: Number(row.orders_paused) || 0,
    drink_delay_minutes: Number(row.drink_delay_minutes) || 0,
  };
}

// GET /api/settings — public; customers need to know if ordering is paused / delay
export async function GET() {
  try {
    const s = await readSettings();
    return NextResponse.json(
      {
        ordersPaused: s.orders_paused === 1,
        drinkDelayMinutes: s.drink_delay_minutes,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ordersPaused: false, drinkDelayMinutes: 0 },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

// PUT /api/settings — admin only; body: { ordersPaused?, drinkDelayMinutes? }
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ordersPaused?: unknown; drinkDelayMinutes?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: string[] = [];
  const args: (number | string)[] = [];

  if (typeof body.ordersPaused === "boolean") {
    updates.push("orders_paused = ?");
    args.push(body.ordersPaused ? 1 : 0);
  }
  if (typeof body.drinkDelayMinutes === "number") {
    if (!ALLOWED_DELAYS.has(body.drinkDelayMinutes)) {
      return NextResponse.json(
        { error: "drinkDelayMinutes must be one of 0, 5, 10, 15, 20" },
        { status: 400 }
      );
    }
    updates.push("drink_delay_minutes = ?");
    args.push(body.drinkDelayMinutes);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  await client.execute({
    sql: `UPDATE settings SET ${updates.join(", ")} WHERE id = 1`,
    args,
  });

  const s = await readSettings();
  return NextResponse.json({
    ordersPaused: s.orders_paused === 1,
    drinkDelayMinutes: s.drink_delay_minutes,
  });
}
