import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// POST /api/init — one-time DB schema creation and seeding
// Requires staff auth. Run once after deploying to Vercel.
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDb();
  return NextResponse.json({ ok: true, message: "Database initialised." });
}
