import { NextResponse } from "next/server";
import { list, put } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Diagnostics: which storage driver is active and is the store reachable.
// Never returns any token/URL (those are secrets).
export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN || "";
  const hasKv = !!(
    (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
    (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
  );
  const hasBlob = !!token;

  let readable = false;
  let writable = false;
  let detail = "";
  if (hasBlob && !hasKv) {
    try {
      await list({ prefix: "state.json", token });
      readable = true;
    } catch (e) {
      detail = "read " + String(e).slice(0, 140);
    }
    try {
      await put("__ping.json", String(Date.now()), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0,
        token,
      });
      writable = true;
    } catch (e) {
      if (!detail) detail = "write " + String(e).slice(0, 140);
    }
  }

  return NextResponse.json(
    {
      driver: hasKv ? "kv" : hasBlob ? "blob" : "memory",
      hasBlob,
      hasKv,
      readable,
      writable,
      detail,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
