import "server-only";
import { applyAction, type Action } from "./reducer";
import { emptyState, type AppState } from "./types";

/**
 * Server-side source of truth for the whole group.
 *
 * Driver selection (automatic):
 *  1. Vercel KV / Upstash Redis, if connected (KV_REST_API_URL + KV_REST_API_TOKEN,
 *     or the UPSTASH_* equivalents). Durable + shared across every instance.
 *  2. A persistent JSON document at STATE_BLOB_URL. This is provisioned
 *     automatically by the deploy pipeline so motives survive restarts and are
 *     shared across every serverless instance, with zero manual setup.
 *  3. In-process fallback on globalThis, so the app still runs locally / if the
 *     remote store is briefly unreachable.
 */

const KEY = "str-motives:state";

const KV_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const BLOB_URL = process.env.STATE_BLOB_URL || "";

const usingKv = Boolean(KV_URL && KV_TOKEN);
const usingBlob = !usingKv && Boolean(BLOB_URL);

export const usingDurableStore = usingKv || usingBlob;

/* ---------------------------- in-memory fallback --------------------------- */

type Globals = typeof globalThis & { __STR_STATE?: AppState };
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

/* ------------------------------ JSON document ------------------------------ */

async function blobGet(): Promise<AppState> {
  const res = await fetch(BLOB_URL, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`blob get ${res.status}`);
  return merge((await res.json()) as Partial<AppState>);
}

async function blobSet(state: AppState): Promise<void> {
  const res = await fetch(BLOB_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(state),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`blob set ${res.status}`);
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
  g.__STR_STATE = next; // keep the local mirror warm either way
  try {
    if (usingKv) await kvSet(next);
    else if (usingBlob) await blobSet(next);
  } catch (err) {
    console.error("runMutation persist failed:", err);
  }
  return next;
}
