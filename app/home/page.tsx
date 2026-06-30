"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Shell } from "@/components/shell";
import { MotiveCard } from "@/components/motive-card";
import { useApp } from "@/app/providers";
import { normalizeName } from "@/lib/format";

const FILTERS = ["All", "This Week", "Pool", "Food", "Party", "Chill", "My RSVPs"];

export default function HomePage() {
  const { name, motives } = useApp();
  const [filter, setFilter] = useState("All");
  const weekFromNow = Date.now() + 7 * 864e5;

  const visible = motives
    .filter((m) => {
      if (filter === "All") return true;
      if (filter === "My RSVPs") return !!m.rsvps[normalizeName(name)];
      if (filter === "This Week") return new Date(m.date).getTime() < weekFromNow;
      if (filter === "Food") return ["BBQ", "Dinner", "Potluck"].includes(m.category);
      return m.category.toLowerCase().includes(filter.toLowerCase());
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Shell>
      <header className="mb-7 flex items-start justify-between">
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

      <div className="scrollbar-none -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip ${filter === f ? "active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map((m) => (
          <MotiveCard key={m.id} motive={m} />
        ))}
        {!visible.length && (
          <div className="card px-6 py-14 text-center">
            <h2 className="text-xl font-bold">No motives yet.</h2>
            <p className="mt-2 muted">Start the first one.</p>
            <Link href="/create" className="btn btn-primary mt-5">
              Create Motive
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}
