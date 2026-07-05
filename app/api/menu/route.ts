import { NextResponse } from "next/server";
import menu from "@/data/menu.json";
import { client } from "@/lib/db";

type OverrideRow = {
  menu_id: number;
  available: number | null;
  description: string | null;
  name: string | null;
  price: number | null;
};

export async function GET() {
  let overrides = new Map<number, OverrideRow>();
  try {
    const res = await client.execute(
      "SELECT menu_id, available, description, name, price FROM menu_overrides"
    );
    overrides = new Map(
      (res.rows as unknown as OverrideRow[]).map((r) => [Number(r.menu_id), r])
    );
  } catch {
    // menu_overrides table not initialised yet — serve menu.json as-is
  }

  const merged = (menu as Array<Record<string, unknown>>).map((item) => {
    const o = overrides.get(Number(item.id));
    if (!o) return item;
    return {
      ...item,
      ...(o.available !== null ? { available: Number(o.available) === 1 } : {}),
      ...(o.description !== null ? { description: o.description } : {}),
      ...(o.name !== null && o.name !== undefined ? { name: o.name } : {}),
      ...(o.price !== null && o.price !== undefined ? { price: Number(o.price) } : {}),
    };
  });

  return NextResponse.json(merged, {
    headers: { "Cache-Control": "no-store" },
  });
}
