"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { useApp } from "@/app/providers";
import { normalizeName, prettyDate, prettyTime } from "@/lib/format";
import type { Motive } from "@/lib/types";

export function MotiveCard({ motive }: { motive: Motive }) {
  const { name } = useApp();
  const going = Object.values(motive.rsvps).filter((v) => v === "going").length;
  const mine = motive.rsvps[normalizeName(name)];

  return (
    <Link
      href={`/motives/${motive.id}`}
      className="card animate-in block p-5 transition active:scale-[.985]"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h2 className="text-[21px] font-bold tracking-[-.025em]">{motive.title}</h2>
          <p className="mt-1 text-sm muted">by {motive.createdBy}</p>
        </div>
        <ChevronRight className="mt-1 shrink-0 text-[#626970]" size={20} />
      </div>

      <div className="mt-4 rounded-2xl bg-[#191c1f] p-3 text-sm">
        <div className="flex items-center justify-between">
          <b>{prettyDate(motive.date)}</b>
          <span className="muted">{prettyTime(motive.startTime)}</span>
        </div>
        {motive.location && (
          <div className="mt-2 flex items-center gap-2 muted">
            <MapPin size={14} /> {motive.location}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="muted">{going ? `${going} going` : "No one's in yet"}</span>
        {mine && (
          <span className="rounded-full bg-[#b8f35a]/12 px-3 py-1 text-xs font-bold text-[#b8f35a]">
            You're {mine === "cant" ? "out" : mine}
          </span>
        )}
      </div>
    </Link>
  );
}
