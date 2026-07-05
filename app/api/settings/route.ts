import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

const ALLOWED_DELAYS = new Set([0, 5, 10, 15, 20]);
const MAX_ROOM_PRICE_PENCE = 100_000; // £1,000/night ceiling

type SettingsRow = {
  orders_paused: number;
  drink_delay_minutes: number;
  room_weekday_price: number;
  room_weekend_price: number;
};

async function readSettings(): Promise<SettingsRow> {
  const result = await client.execute(
    "SELECT orders_paused, drink_delay_minutes, room_weekday_price, room_weekend_price FROM settings WHERE id = 1"
  );
  if (result.rows.length === 0) {
    await client.execute(
      "INSERT OR IGNORE INTO settings (id, orders_paused, drink_delay_minutes) VALUES (1, 0, 0)"
    );
    return {
      orders_paused: 0,
      drink_delay_minutes: 0,
      room_weekday_price: 0,
      room_weekend_price: 0,
    };
  }
  const row = result.rows[0] as unknown as SettingsRow;
  return {
    orders_paused: Number(row.orders_paused) || 0,
    drink_delay_minutes: Number(row.drink_delay_minutes) || 0,
    room_weekday_price: Number(row.room_weekday_price) || 0,
    room_weekend_price: Number(row.room_weekend_price) || 0,
  };
}

function toResponse(s: SettingsRow) {
  return {
    ordersPaused: s.orders_paused === 1,
    drinkDelayMinutes: s.drink_delay_minutes,
    roomWeekdayPrice: s.room_weekday_price,
    roomWeekendPrice: s.room_weekend_price,
  };
}

// GET /api/settings — public; customers need ordering status and room rates
export async function GET() {
  try {
    const s = await readSettings();
    return NextResponse.json(toResponse(s), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        ordersPaused: false,
        drinkDelayMinutes: 0,
        roomWeekdayPrice: 0,
        roomWeekendPrice: 0,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

// PUT /api/settings — admin only
// body: { ordersPaused?, drinkDelayMinutes?, roomWeekdayPrice?, roomWeekendPrice? }
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    ordersPaused?: unknown;
    drinkDelayMinutes?: unknown;
    roomWeekdayPrice?: unknown;
    roomWeekendPrice?: unknown;
  };
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

  for (const [key, column] of [
    ["roomWeekdayPrice", "room_weekday_price"],
    ["roomWeekendPrice", "room_weekend_price"],
  ] as const) {
    const value = body[key];
    if (typeof value === "number") {
      const pence = Math.round(value);
      if (!Number.isFinite(pence) || pence < 0 || pence > MAX_ROOM_PRICE_PENCE) {
        return NextResponse.json(
          { error: `${key} must be between 0 and ${MAX_ROOM_PRICE_PENCE} pence` },
          { status: 400 }
        );
      }
      updates.push(`${column} = ?`);
      args.push(pence);
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  await client.execute({
    sql: `UPDATE settings SET ${updates.join(", ")} WHERE id = 1`,
    args,
  });

  const s = await readSettings();
  return NextResponse.json(toResponse(s));
}
