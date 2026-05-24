import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

type OverrideRow = {
  menu_id: number;
  available: number | null;
  description: string | null;
};

// GET /api/menu/overrides — admin only; returns full map of overrides
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const res = await client.execute(
      "SELECT menu_id, available, description FROM menu_overrides"
    );
    return NextResponse.json(res.rows as unknown as OverrideRow[]);
  } catch {
    return NextResponse.json([]);
  }
}

// PUT /api/menu/overrides — admin only; upserts a single override
// Body: { menuId: number, available?: boolean | null, description?: string | null }
//   available/description set to `null` clears that override (inherits menu.json).
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { menuId?: unknown; available?: unknown; description?: unknown };
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

  if (availableSql === undefined && descriptionSql === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Read current row (if any) so we can preserve untouched columns on upsert.
  const existing = await client.execute({
    sql: "SELECT available, description FROM menu_overrides WHERE menu_id = ?",
    args: [menuId],
  });

  const currentAvailable =
    existing.rows.length > 0
      ? (existing.rows[0].available as number | null)
      : null;
  const currentDescription =
    existing.rows.length > 0
      ? (existing.rows[0].description as string | null)
      : null;

  const finalAvailable =
    availableSql !== undefined ? availableSql : currentAvailable;
  const finalDescription =
    descriptionSql !== undefined ? descriptionSql : currentDescription;

  // If both ended up null, just delete the row entirely.
  if (finalAvailable === null && finalDescription === null) {
    await client.execute({
      sql: "DELETE FROM menu_overrides WHERE menu_id = ?",
      args: [menuId],
    });
    return NextResponse.json({ menuId, available: null, description: null });
  }

  await client.execute({
    sql: `INSERT INTO menu_overrides (menu_id, available, description)
          VALUES (?, ?, ?)
          ON CONFLICT(menu_id) DO UPDATE SET
            available = excluded.available,
            description = excluded.description`,
    args: [menuId, finalAvailable, finalDescription],
  });

  return NextResponse.json({
    menuId,
    available: finalAvailable,
    description: finalDescription,
  });
}
