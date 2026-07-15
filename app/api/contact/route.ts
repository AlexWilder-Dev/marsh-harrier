import { NextRequest, NextResponse } from "next/server";

// POST /api/contact — forwards a general contact / booking enquiry to Formspree
// from the server.
//
// Reading the Formspree ID here (at runtime) rather than in the browser avoids
// the NEXT_PUBLIC_* build-time inlining problem: a client-side
// `process.env.NEXT_PUBLIC_...` is baked in when the bundle is built, so if the
// env var was missing (or added later without a rebuild) the browser sees
// `undefined`. Previously the contact form treated that as "not configured" and
// showed the customer a fake success screen — the message was never sent and
// the pub never received it. Forwarding through this route fixes that: the send
// works as long as the env var is present in the running environment.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const formspreeId =
    process.env.FORMSPREE_CONTACT_ID ||
    process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID ||
    // Fall back to the rooms-enquiry form if a separate contact form was never
    // configured, so messages still reach the pub rather than vanishing.
    process.env.FORMSPREE_ID ||
    process.env.NEXT_PUBLIC_FORMSPREE_ID;

  if (!formspreeId) {
    // Not configured anywhere. In development, simulate success so the flow can
    // be exercised locally; in production, tell the client it's unavailable so
    // it can surface a "please call us" message instead of a false success.
    if (process.env.NODE_ENV !== "production") {
      console.log("Contact (Formspree not configured):", body);
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
    console.error("Formspree rejected contact:", res.status, detail.slice(0, 500));
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  } catch (err) {
    console.error("Contact forward failed:", err);
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
