"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Shell } from "@/components/shell";
import { MotiveCard } from "@/components/motive-card";
import { useApp } from "@/app/providers";

export default function HomePage() {
  const { name, motives } = useApp();

  const visible = [...motives].sort((a, b) =>
    (a.date + a.startTime).localeCompare(b.date + b.startTime)
  );

  return (
    <Shell>
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="eyebrow">STR Motives</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">
            What's the motive,
            <br />
            {name}?
          </h1>
        </div>
        <Link
          href="/create"
          aria-label="Create motive"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b8f35a] text-black"
        >
          <Plus />
        </Link>
      </header>

      <div className="space-y-4">
        {visible.map((m) => (
          <MotiveCard key={m.id} motive={m} />
        ))}
        {!visible.length && (
          <div className="card px-6 py-14 text-center">
            <h2 className="text-xl font-bold">No motives yet.</h2>
            <p className="mt-2 muted">Start the first one.</p>
            <Link href="/create" className="btn btn-primary mt-5">
              Create motive
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}
