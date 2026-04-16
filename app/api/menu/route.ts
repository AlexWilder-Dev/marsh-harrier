import { NextResponse } from "next/server";
import menu from "@/data/menu.json";

export function GET() {
  return NextResponse.json(menu);
}
