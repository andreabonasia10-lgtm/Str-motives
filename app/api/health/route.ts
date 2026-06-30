import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Diagnostics: which storage driver is active and is the store reachable.
// Never returns the store URL itself (it's a capability secret).
export async function GET() {
  const blobUrl = process.env.STATE_BLOB_URL || "";
  const hasKv = !!(
    (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
    (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
  );
  const hasBlob = !!blobUrl;

  let blobReadable = false;
  let blobWritable = false;
  let detail = "";
  if (hasBlob && !hasKv) {
    try {
      const r = await fetch(blobUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      blobReadable = r.ok;
      const current = r.ok ? await r.json() : {};
      const w = await fetch(blobUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...current, __ping: Date.now() }),
        cache: "no-store",
      });
      blobWritable = w.ok;
      if (!r.ok) detail = `read ${r.status}`;
      else if (!w.ok) detail = `write ${w.status}`;
    } catch (e) {
      detail = String(e).slice(0, 200);
    }
  }

  return NextResponse.json(
    {
      driver: hasKv ? "kv" : hasBlob ? "blob" : "memory",
      hasBlob,
      hasKv,
      blobReadable,
      blobWritable,
      detail,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
