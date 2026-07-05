import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

type OverrideRow = {
  menu_id: number;
  available: number | null;
  description: string | null;
  name: string | null;
  price: number | null;
};

// £1,000 upper bound — a sane ceiling that still comfortably covers e.g. the
// Moët bottle. Prices are stored in pence.
const MAX_PRICE_PENCE = 100_000;

// GET /api/menu/overrides — admin only; returns full map of overrides
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const res = await client.execute(
      "SELECT menu_id, available, description, name, price FROM menu_overrides"
    );
    return NextResponse.json(res.rows as unknown as OverrideRow[]);
  } catch {
    return NextResponse.json([]);
  }
}

// PUT /api/menu/overrides — admin only; upserts a single override.
// Body: { menuId, available?, description?, name?, price? }
//   For each field: a concrete value sets the override, `null` clears it
//   (inherits menu.json), and `undefined`/omitted leaves it untouched.
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    menuId?: unknown;
    available?: unknown;
    description?: unknown;
    name?: unknown;
    price?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const menuId = Number(body.menuId);
  if (!Number.isInteger(menuId) || menuId <= 0) {
    return NextResponse.json({ error: "menuId required" }, { status: 400 });
  }

  // available: true | false | null (clear) | undefined (don't touch)
  let availableSql: number | null | undefined;
  if (body.available === true) availableSql = 1;
  else if (body.available === false) availableSql = 0;
  else if (body.available === null) availableSql = null;
  else availableSql = undefined;

  // description: string | null (clear) | undefined (don't touch)
  let descriptionSql: string | null | undefined;
  if (typeof body.description === "string") {
    descriptionSql = body.description.slice(0, 500);
  } else if (body.description === null) {
    descriptionSql = null;
  } else {
    descriptionSql = undefined;
  }

  // name: non-empty string | null (clear) | undefined (don't touch)
  let nameSql: string | null | undefined;
  if (typeof body.name === "string") {
    const trimmed = body.name.trim().slice(0, 120);
    if (trimmed.length === 0) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    nameSql = trimmed;
  } else if (body.name === null) {
    nameSql = null;
  } else {
    nameSql = undefined;
  }

  // price: integer pence in [0, MAX] | null (clear) | undefined (don't touch)
  let priceSql: number | null | undefined;
  if (typeof body.price === "number") {
    const p = Math.round(body.price);
    if (!Number.isFinite(p) || p < 0 || p > MAX_PRICE_PENCE) {
      return NextResponse.json(
        { error: `price must be between 0 and ${MAX_PRICE_PENCE} pence` },
        { status: 400 }
      );
    }
    priceSql = p;
  } else if (body.price === null) {
    priceSql = null;
  } else {
    priceSql = undefined;
  }

  if (
    availableSql === undefined &&
    descriptionSql === undefined &&
    nameSql === undefined &&
    priceSql === undefined
  ) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Read current row (if any) so we can preserve untouched columns on upsert.
  const existing = await client.execute({
    sql: "SELECT available, description, name, price FROM menu_overrides WHERE menu_id = ?",
    args: [menuId],
  });
  const cur = existing.rows[0] as unknown as
    | { available: number | null; description: string | null; name: string | null; price: number | null }
    | undefined;

  const finalAvailable = availableSql !== undefined ? availableSql : cur?.available ?? null;
  const finalDescription = descriptionSql !== undefined ? descriptionSql : cur?.description ?? null;
  const finalName = nameSql !== undefined ? nameSql : cur?.name ?? null;
  const finalPrice = priceSql !== undefined ? priceSql : cur?.price ?? null;

  // If every column ended up null, drop the row entirely.
  if (
    finalAvailable === null &&
    finalDescription === null &&
    finalName === null &&
    finalPrice === null
  ) {
    await client.execute({
      sql: "DELETE FROM menu_overrides WHERE menu_id = ?",
      args: [menuId],
    });
    return NextResponse.json({
      menuId,
      available: null,
      description: null,
      name: null,
      price: null,
    });
  }

  await client.execute({
    sql: `INSERT INTO menu_overrides (menu_id, available, description, name, price)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(menu_id) DO UPDATE SET
            available = excluded.available,
            description = excluded.description,
            name = excluded.name,
            price = excluded.price`,
    args: [menuId, finalAvailable, finalDescription, finalName, finalPrice],
  });

  return NextResponse.json({
    menuId,
    available: finalAvailable,
    description: finalDescription,
    name: finalName,
    price: finalPrice,
  });
}
