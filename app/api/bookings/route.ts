import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { isYmd } from "@/lib/calendar";

const MAX_ROOM_PRICE_PENCE = 100_000; // £1,000/night ceiling

type BookingsPayload = {
  booked: string[];
  prices: Record<string, number>;
};

async function readAll(): Promise<BookingsPayload> {
  const [b, p] = await Promise.all([
    client.execute("SELECT date FROM room_bookings ORDER BY date"),
    client.execute("SELECT date, price FROM room_prices"),
  ]);
  const prices: Record<string, number> = {};
  for (const r of p.rows) prices[String(r.date)] = Number(r.price);
  return { booked: b.rows.map((r) => String(r.date)), prices };
}

// GET /api/bookings — public; returns booked (unavailable) nights and any
// per-night price overrides. Base weekday/weekend rates come from /api/settings.
export async function GET() {
  try {
    const payload = await readAll();
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // tables not initialised yet — nothing blocked, no overrides
    return NextResponse.json(
      { booked: [], prices: {} },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

// PUT /api/bookings — admin only. Marks nights booked/free and/or sets a
// per-night price override.
// Body: { date?: string, dates?: string[], booked?: boolean, price?: number | null }
//   booked: toggles availability. price: number sets an override (pence),
//   null clears it (falls back to the weekday/weekend base rate).
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    date?: unknown;
    dates?: unknown;
    booked?: unknown;
    price?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = Array.isArray(body.dates)
    ? body.dates
    : body.date !== undefined
    ? [body.date]
    : [];
  const dates = Array.from(new Set(raw)).filter(isYmd);
  if (dates.length === 0) {
    return NextResponse.json({ error: "No valid dates" }, { status: 400 });
  }

  const hasBooked = typeof body.booked === "boolean";
  const hasPrice = body.price !== undefined;
  if (!hasBooked && !hasPrice) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Validate price up front so a bad value never partially applies.
  let priceOp: { clear: true } | { set: number } | null = null;
  if (hasPrice) {
    if (body.price === null) {
      priceOp = { clear: true };
    } else if (typeof body.price === "number") {
      const pence = Math.round(body.price);
      if (!Number.isFinite(pence) || pence < 0 || pence > MAX_ROOM_PRICE_PENCE) {
        return NextResponse.json(
          { error: `price must be between 0 and ${MAX_ROOM_PRICE_PENCE} pence` },
          { status: 400 }
        );
      }
      priceOp = { set: pence };
    } else {
      return NextResponse.json(
        { error: "price must be a number or null" },
        { status: 400 }
      );
    }
  }

  const statements: { sql: string; args: (string | number)[] }[] = [];

  if (hasBooked) {
    const booked = body.booked as boolean;
    for (const date of dates) {
      statements.push(
        booked
          ? { sql: "INSERT OR IGNORE INTO room_bookings (date) VALUES (?)", args: [date] }
          : { sql: "DELETE FROM room_bookings WHERE date = ?", args: [date] }
      );
    }
  }

  if (priceOp) {
    for (const date of dates) {
      if ("clear" in priceOp) {
        statements.push({ sql: "DELETE FROM room_prices WHERE date = ?", args: [date] });
      } else {
        statements.push({
          sql: `INSERT INTO room_prices (date, price) VALUES (?, ?)
                ON CONFLICT(date) DO UPDATE SET price = excluded.price`,
          args: [date, priceOp.set],
        });
      }
    }
  }

  await client.batch(statements, "write");

  return NextResponse.json(await readAll());
}
