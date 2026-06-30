# STR Motives

> Plans leave the group chat and actually happen here.

A mobile-first group plans app. Create a **motive** (a plan), share the link, and
everyone RSVPs, votes, claims what they'll bring, and suggests changes — all on a
**shared backend** so what one person does shows up on everyone else's screen.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** for styling, **Geist** font, **lucide-react** icons, **sonner** toasts
- A small server API (`/api/state`, `/api/mutate`) backed by a swappable store

## How the shared state works

Unlike a typical "saves only in your browser" prototype, every change here is sent
to the server and is the single source of truth the whole group reads from:

- `GET /api/state` returns the shared `{ motives, ideas, friends }`.
- `POST /api/mutate` applies one action (create motive, RSVP, vote, claim, …) and
  returns the fresh state. The exact same pure reducer (`lib/reducer.ts`) runs on
  the client for instant optimistic updates and on the server as the source of
  truth, so they never disagree.
- Clients poll `/api/state` every few seconds (and on window focus), so a motive
  someone else creates appears for everyone within seconds.

### Storage drivers (`lib/store.ts`)

The store auto-selects a driver — **no setup required to run**:

1. **Durable (recommended for production):** if a Vercel KV / Upstash Redis store
   is connected (env `KV_REST_API_URL` + `KV_REST_API_TOKEN`, or the `UPSTASH_*`
   equivalents), state is persisted there durably and shared across every
   serverless instance. Add one from the Vercel dashboard → **Storage** → KV and
   it is picked up automatically, no code change.
2. **Fallback:** an in-process store on `globalThis`, so the app is fully
   functional out of the box.

Optional env: `ADMIN_PASSWORD` (defaults to `motives`).

## Develop

```bash
npm install
npm run dev
```

## Routes

`/` onboarding · `/home` feed · `/create` new motive · `/motives/[id]` detail ·
`/ideas` idea board · `/calendar` agenda · `/profile` you · `/admin` owner controls
