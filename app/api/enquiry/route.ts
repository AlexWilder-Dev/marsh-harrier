import { NextRequest, NextResponse } from "next/server";

// POST /api/enquiry — forwards a rooms enquiry to Formspree from the server.
// Reading the Formspree ID here (at runtime) rather than in the browser avoids
// the NEXT_PUBLIC_* build-time inlining problem: the enquiry works as long as
// the env var is present in the running environment, even if it wasn't baked
// into the client bundle.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const formspreeId =
    process.env.FORMSPREE_ID || process.env.NEXT_PUBLIC_FORMSPREE_ID;

  if (!formspreeId) {
    // Not configured anywhere. In development, simulate success so the flow can
    // be exercised locally; in production, tell the client it's unavailable.
    if (process.env.NODE_ENV !== "production") {
      console.log("Enquiry (Formspree not configured):", body);
      return NextResponse.json({ ok: true, simulated: true });
    }
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    // Surface Formspree's error so it shows up in server logs for debugging.
    const detail = await res.text().catch(() => "");
    console.error("Formspree rejected enquiry:", res.status, detail.slice(0, 500));
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  } catch (err) {
    console.error("Enquiry forward failed:", err);
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
