import { NextResponse } from "next/server";
import { site } from "@/data/config";

/**
 * GITHUB ACTIVITY — recent public push events for the configured user.
 * Public API, no token needed (60 req/h unauthenticated; we cache 10 min).
 * Fails soft with an empty list — the widget hides itself.
 */

export const revalidate = 600;

function ago(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${site.githubUser}/events/public?per_page=30`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 600 },
      },
    );
    if (!res.ok) return NextResponse.json({ items: [] });
    const events = (await res.json()) as Array<{
      type: string;
      repo: { name: string };
      created_at: string;
    }>;
    const seen = new Set<string>();
    const items: Array<{ repo: string; url: string; when: string }> = [];
    for (const e of events) {
      if (e.type !== "PushEvent" || seen.has(e.repo.name)) continue;
      seen.add(e.repo.name);
      items.push({
        repo: e.repo.name.split("/")[1] ?? e.repo.name,
        url: `https://github.com/${e.repo.name}`,
        when: ago(e.created_at),
      });
      if (items.length >= 3) break;
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
