import { NextResponse } from "next/server";
import menu from "@/data/menu.json";

export function GET() {
  return NextResponse.json(menu, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
  });
}
