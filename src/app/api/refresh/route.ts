import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { CATALOGUE_TAG } from "@/lib/products";

/**
 * "Update the website now" link for the shop owner, so they don't have to wait
 * for the 5-minute refresh:  https://your-site/api/refresh?key=YOUR_REFRESH_KEY
 * (Google's published CSV itself can still lag by a few minutes.)
 */
export async function GET(request: NextRequest) {
  const expected = process.env.REFRESH_KEY;
  const key = request.nextUrl.searchParams.get("key");

  if (!expected) {
    return new Response("Set REFRESH_KEY in your hosting environment variables first.", { status: 501 });
  }
  if (key !== expected) {
    return new Response("Wrong key.", { status: 401 });
  }

  // expire: 0 → the next visit fetches the sheet straight away instead of showing the old copy.
  revalidateTag(CATALOGUE_TAG, { expire: 0 });
  return new Response("Done — the website will show the latest sheet on the next page load.", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
