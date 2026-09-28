import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import sitemap from "@/app/sitemap";

// Push every sitemap URL to IndexNow, the protocol Bing (and Yandex, Seznam,
// Naver) use to learn about new or changed pages immediately instead of
// waiting to recrawl. Bing's index is what Microsoft Copilot, Alexa,
// DuckDuckGo, Yahoo, and ChatGPT search draw on — so this is the fastest way
// to get local service pages in front of those assistants.
//
// The key isn't a secret: IndexNow verifies ownership by fetching
// /<key>.txt from this domain, which lives in /public.

const HOST = "www.chatmansecurityandfire.com";
const KEY = "0a835c5db80c3624976cf3f6e8aaaf3f";

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || !["admin", "manager"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = sitemap()
    .map((e) => e.url)
    .filter((u) => u.startsWith(`https://${HOST}`));
  urls.push(`https://${HOST}/llms.txt`);

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  // 200 = accepted, 202 = accepted, key validation pending. Anything else is a
  // real failure worth surfacing (403 = key file not reachable, 422 = URLs
  // don't match host).
  const body = await res.text();
  return NextResponse.json(
    { submitted: urls.length, status: res.status, ok: res.status === 200 || res.status === 202, response: body.slice(0, 300) },
    { status: res.ok ? 200 : 502 }
  );
}
