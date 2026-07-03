"use client";

import Link from "next/link";
import { Shell } from "@/components/shell";
import { MotiveCard } from "@/components/motive-card";
import { useApp } from "@/app/providers";
import { normalizeName } from "@/lib/format";

export default function HomePage() {
  const { name, motives, online } = useApp();
  const me = normalizeName(name);

  const feed = [...motives].sort((a, b) =>
    (a.date + a.startTime).localeCompare(b.date + b.startTime)
  );

  return (
    <Shell>
      <header className="mb-5">
        <p className="eyebrow">STR Motives</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">
          What's the motive,
          <br />
          {name}?
        </h1>
      </header>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#b8f35a]" />
        <span className="shrink-0 text-sm font-semibold">Online now</span>
        <div className="flex gap-2">
          {online.map((who) => (
            <span
              key={who}
              className="shrink-0 rounded-full bg-[#191c1f] px-3 py-1 text-sm capitalize"
            >
              {who === me ? "You" : who}
            </span>
          ))}
          {!online.length && <span className="text-sm muted">just you… for now</span>}
        </div>
      </div>

      <div className="space-y-4">
        {feed.map((m) => (
          <MotiveCard key={m.id} motive={m} />
        ))}
        {!feed.length && (
          <div className="card px-6 py-14 text-center">
            <h2 className="text-xl font-bold">No motives yet.</h2>
            <p className="mt-2 muted">Tap the green + to start one.</p>
            <Link href="/create" className="btn btn-primary mt-5">
              Create motive
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}
