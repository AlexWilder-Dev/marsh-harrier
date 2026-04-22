import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sha256Hex } from "@/lib/hash";

const SESSION_COOKIE = "mh_admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const expected = await sha256Hex(process.env.ADMIN_PASSWORD ?? "");

  if (token !== expected) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
