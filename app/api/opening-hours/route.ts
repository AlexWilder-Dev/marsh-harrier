import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { DEFAULT_OPENING_HOURS, type OpeningHour } from "@/lib/openingHours";

// GET /api/opening-hours — public. Reads the weekly schedule from the DB,
// falling back to the built-in defaults if the table is empty or missing.
export async function GET() {
  try {
    const res = await client.execute(
      "SELECT day_order, day, bar, kitchen, note FROM opening_hours ORDER BY day_order"
    );
    if (res.rows.length === 0) {
      return NextResponse.json(DEFAULT_OPENING_HOURS, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    const hours: OpeningHour[] = res.rows.map((r) => ({
      order: Number(r.day_order),
      day: String(r.day),
      bar: String(r.bar ?? ""),
      kitchen: String(r.kitchen ?? ""),
      note: r.note != null ? String(r.note) : null,
    }));
    return NextResponse.json(hours, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(DEFAULT_OPENING_HOURS, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

// PUT /api/opening-hours — admin only. Saves the full weekly schedule.
// Body: { hours: OpeningHour[] }
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { hours?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.hours) || body.hours.length === 0) {
    return NextResponse.json({ error: "hours array required" }, { status: 400 });
  }

  const statements: { sql: string; args: (string | number | null)[] }[] = [];
  for (const raw of body.hours) {
    const h = raw as Partial<OpeningHour>;
    const order = Number(h.order);
    if (!Number.isInteger(order) || order < 0 || order > 6) {
      return NextResponse.json(
        { error: "each row needs an order 0–6" },
        { status: 400 }
      );
    }
    if (typeof h.day !== "string" || h.day.trim() === "") {
      return NextResponse.json({ error: "each row needs a day" }, { status: 400 });
    }
    const bar = typeof h.bar === "string" ? h.bar.trim().slice(0, 120) : "";
    const kitchen =
      typeof h.kitchen === "string" ? h.kitchen.trim().slice(0, 120) : "";
    const note =
      typeof h.note === "string" && h.note.trim() !== ""
        ? h.note.trim().slice(0, 200)
        : null;
    statements.push({
      sql: `INSERT INTO opening_hours (day_order, day, bar, kitchen, note)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(day_order) DO UPDATE SET
              day = excluded.day,
              bar = excluded.bar,
              kitchen = excluded.kitchen,
              note = excluded.note`,
      args: [order, h.day.trim().slice(0, 20), bar, kitchen, note],
    });
  }

  await client.batch(statements, "write");

  const res = await client.execute(
    "SELECT day_order, day, bar, kitchen, note FROM opening_hours ORDER BY day_order"
  );
  const hours: OpeningHour[] = res.rows.map((r) => ({
    order: Number(r.day_order),
    day: String(r.day),
    bar: String(r.bar ?? ""),
    kitchen: String(r.kitchen ?? ""),
    note: r.note != null ? String(r.note) : null,
  }));
  return NextResponse.json(hours);
}
