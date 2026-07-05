import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { isYmd } from "@/lib/calendar";

// GET /api/bookings — public; returns the list of booked (unavailable) nights
// as "YYYY-MM-DD" strings so the rooms calendar can block them out. No PII is
// exposed — just the dates.
export async function GET() {
  try {
    const res = await client.execute("SELECT date FROM room_bookings ORDER BY date");
    const dates = res.rows.map((r) => String(r.date));
    return NextResponse.json(dates, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // room_bookings table not initialised yet — nothing blocked
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}

// PUT /api/bookings — admin only; marks one or more nights as booked or free.
// Body: { date?: string, dates?: string[], booked: boolean }
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { date?: unknown; dates?: unknown; booked?: unknown };
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

  // De-duplicate and keep only well-formed YYYY-MM-DD strings.
  const dates = Array.from(new Set(raw)).filter(isYmd);
  if (dates.length === 0) {
    return NextResponse.json({ error: "No valid dates" }, { status: 400 });
  }
  if (typeof body.booked !== "boolean") {
    return NextResponse.json({ error: "booked must be a boolean" }, { status: 400 });
  }

  if (body.booked) {
    await client.batch(
      dates.map((date) => ({
        sql: "INSERT OR IGNORE INTO room_bookings (date) VALUES (?)",
        args: [date],
      })),
      "write"
    );
  } else {
    await client.batch(
      dates.map((date) => ({
        sql: "DELETE FROM room_bookings WHERE date = ?",
        args: [date],
      })),
      "write"
    );
  }

  const res = await client.execute("SELECT date FROM room_bookings ORDER BY date");
  return NextResponse.json(res.rows.map((r) => String(r.date)));
}
