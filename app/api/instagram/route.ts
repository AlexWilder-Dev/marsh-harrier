import { NextResponse } from "next/server";

// Always run at request time so the current token is read from the environment
// (not frozen at build time like a NEXT_PUBLIC_* value would be).
export const dynamic = "force-dynamic";

type IgPost = {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
};

// GET /api/instagram — returns the latest posts for the homepage feed.
// Reads the token server-side at runtime (INSTAGRAM_ACCESS_TOKEN, or the older
// NEXT_PUBLIC_ name as a fallback) so the feed keeps working when the token is
// refreshed without needing a rebuild. Returns an empty list on any problem so
// the client falls back to its placeholder photos.
export async function GET() {
  const token =
    process.env.INSTAGRAM_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ posts: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  const url = `https://graph.instagram.com/me/media?fields=id,media_url,permalink,caption,media_type,thumbnail_url&limit=6&access_token=${encodeURIComponent(token)}`;

  try {
    // Cache the upstream response for 10 minutes so we don't hit Instagram on
    // every page view; a refreshed token still takes effect within that window.
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Instagram API error:", res.status, detail.slice(0, 300));
      return NextResponse.json({ posts: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    const data = (await res.json()) as { data?: IgPost[] };
    const posts = Array.isArray(data.data) ? data.data.slice(0, 6) : [];
    return NextResponse.json(
      { posts },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } }
    );
  } catch (err) {
    console.error("Instagram fetch failed:", err);
    return NextResponse.json({ posts: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
