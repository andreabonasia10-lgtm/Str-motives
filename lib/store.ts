import "server-only";
import { list, put } from "@vercel/blob";
import { applyAction, type Action } from "./reducer";
import { emptyState, type AppState } from "./types";

/**
 * Server-side source of truth for the whole group.
 *
 * Driver selection (automatic):
 *  1. Vercel KV / Upstash Redis, if connected.
 *  2. Vercel Blob (first-party, durable object storage) via a scoped
 *     BLOB_READ_WRITE_TOKEN. Provisioned automatically by the deploy pipeline.
 *  3. In-process fallback on globalThis (local dev / brief store hiccups).
 */

const KEY = "str-motives:state";
const STATE_PATH = "state.json";

const KV_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";

const usingKv = Boolean(KV_URL && KV_TOKEN);
const usingBlob = !usingKv && Boolean(BLOB_TOKEN);

export const usingDurableStore = usingKv || usingBlob;

type Globals = typeof globalThis & {
  __STR_STATE?: AppState;
  __STR_BLOB_URL?: string | null;
};
const g = globalThis as Globals;
if (!g.__STR_STATE) g.__STR_STATE = emptyState();

const merge = (raw: Partial<AppState> | null | undefined): AppState => ({
  ...emptyState(),
  ...(raw || {}),
});

/* ------------------------------ Redis (REST) ------------------------------- */

async function kvGet(): Promise<AppState> {
  const res = await fetch(`${KV_URL}/get/${encodeURIComponent(KEY)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV get ${res.status}`);
  const body = (await res.json()) as { result: string | null };
  return body.result ? merge(JSON.parse(body.result)) : emptyState();
}

async function kvSet(state: AppState): Promise<void> {
  const res = await fetch(`${KV_URL}/set/${encodeURIComponent(KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(JSON.stringify(state)),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV set ${res.status}`);
}

/* ------------------------------ Vercel Blob -------------------------------- */

async function resolveBlobUrl(): Promise<string | null> {
  if (g.__STR_BLOB_URL) return g.__STR_BLOB_URL;
  const { blobs } = await list({ prefix: STATE_PATH, token: BLOB_TOKEN });
  const found = blobs.find((b) => b.pathname === STATE_PATH) ?? null;
  g.__STR_BLOB_URL = found?.url ?? null;
  return g.__STR_BLOB_URL;
}

async function blobGet(): Promise<AppState> {
  const url = await resolveBlobUrl();
  if (!url) return emptyState();
  const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) g.__STR_BLOB_URL = null;
    throw new Error(`blob get ${res.status}`);
  }
  return merge((await res.json()) as Partial<AppState>);
}

async function blobSet(state: AppState): Promise<void> {
  const res = await put(STATE_PATH, JSON.stringify(state), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
    token: BLOB_TOKEN,
  });
  g.__STR_BLOB_URL = res.url;
}

/* -------------------------------- public API ------------------------------- */

export async function getState(): Promise<AppState> {
  try {
    if (usingKv) return await kvGet();
    if (usingBlob) return await blobGet();
  } catch (err) {
    console.error("getState falling back to memory:", err);
  }
  return g.__STR_STATE!;
}

/** Read → apply → persist, returning the fresh shared state. */
export async function runMutation(action: Action): Promise<AppState> {
  const current = await getState();
  const next = applyAction(current, action);
  g.__STR_STATE = next;
  try {
    if (usingKv) await kvSet(next);
    else if (usingBlob) await blobSet(next);
  } catch (err) {
    console.error("runMutation persist failed:", err);
  }
  return next;
}
