import "server-only";
import { applyAction, type Action } from "./reducer";
import { emptyState, type AppState } from "./types";

/**
 * Server-side source of truth for the whole group.
 *
 * Driver selection (automatic, no setup required to run):
 *  1. If a Vercel KV / Upstash Redis store is connected (env vars present), the
 *     shared state is persisted there durably — survives restarts and is shared
 *     across every serverless instance. Connect one in the Vercel dashboard
 *     ("Storage" -> add KV) and it is picked up automatically, no code change.
 *  2. Otherwise it falls back to an in-process store kept on globalThis so the
 *     app is fully functional out of the box (shared via the API for everyone
 *     hitting the same instance).
 */

const KEY = "str-motives:state";

const KV_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const usingDurableStore = Boolean(KV_URL && KV_TOKEN);

/* ---------------------------- in-memory fallback --------------------------- */

type Globals = typeof globalThis & { __STR_STATE?: AppState };
const g = globalThis as Globals;
if (!g.__STR_STATE) g.__STR_STATE = emptyState();

/* ------------------------------ Redis (REST) ------------------------------- */

async function kvGet(): Promise<AppState> {
  const res = await fetch(`${KV_URL}/get/${encodeURIComponent(KEY)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV get failed: ${res.status}`);
  const body = (await res.json()) as { result: string | null };
  if (!body.result) return emptyState();
  try {
    return { ...emptyState(), ...(JSON.parse(body.result) as AppState) };
  } catch {
    return emptyState();
  }
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
  if (!res.ok) throw new Error(`KV set failed: ${res.status}`);
}

/* -------------------------------- public API ------------------------------- */

export async function getState(): Promise<AppState> {
  if (usingDurableStore) return kvGet();
  return g.__STR_STATE!;
}

/** Read → apply → write, returning the fresh shared state. */
export async function runMutation(action: Action): Promise<AppState> {
  const current = await getState();
  const next = applyAction(current, action);
  if (usingDurableStore) {
    await kvSet(next);
  } else {
    g.__STR_STATE = next;
  }
  return next;
}
