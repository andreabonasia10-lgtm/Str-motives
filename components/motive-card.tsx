"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Users } from "lucide-react";
import { useApp } from "@/app/providers";
import { normalizeName, prettyDate, prettyTime } from "@/lib/format";
import type { Motive } from "@/lib/types";

export function MotiveCard({ motive }: { motive: Motive }) {
  const { name } = useApp();
  const values = Object.values(motive.rsvps);
  const going = values.filter((v) => v === "going").length;
  const maybe = values.filter((v) => v === "maybe").length;
  const out = values.filter((v) => v === "cant").length;
  const claimed = motive.bringItems.filter((i) => i.claimedBy).length;
  const need = motive.bringItems
    .filter((i) => !i.claimedBy)
    .slice(0, 2)
    .map((i) => i.label);
  const mine = motive.rsvps[normalizeName(name)];

  return (
    <Link
      href={`/motives/${motive.id}`}
      className="card animate-in block overflow-hidden p-5 transition active:scale-[.985]"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="eyebrow text-[#b8f35a]">{motive.category}</span>
          <h2 className="mt-2 text-[21px] font-bold tracking-[-.025em]">
            {motive.title}
          </h2>
          <p className="mt-1 text-sm muted">by {motive.createdBy}</p>
        </div>
        <ChevronRight className="mt-1 text-[#626970]" size={20} />
      </div>

      <div className="mb-4 rounded-2xl bg-[#191c1f] p-3">
        <div className="flex items-center justify-between text-sm">
          <b>{prettyDate(motive.date)}</b>
          <span className="muted">{prettyTime(motive.startTime)}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm muted">
          <MapPin size={14} />
          {motive.location}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <b className="block text-base text-white">{going}</b>
          <span className="muted">Going</span>
        </div>
        <div>
          <b className="block text-base text-white">{maybe}</b>
          <span className="muted">Maybe</span>
        </div>
        <div>
          <b className="block text-base text-white">{out}</b>
          <span className="muted">Out</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4 text-xs">
        <span className="muted">
          {need.length ? `Need: ${need.join(", ")}` : "Bring list covered"}
        </span>
        <span className="font-semibold">
          {claimed}/{motive.bringItems.length} claimed
        </span>
      </div>

      {motive.maxGuests ? (
        <div className="mt-3 flex items-center gap-2 text-xs muted">
          <Users size={13} />
          {going >= motive.maxGuests ? "Full" : `${motive.maxGuests - going} spots left`}
        </div>
      ) : null}

      {mine ? (
        <span className="mt-3 inline-block rounded-full bg-[#b8f35a]/12 px-3 py-1 text-xs font-bold text-[#b8f35a]">
          You're {mine === "cant" ? "out" : mine}
        </span>
      ) : null}
    </Link>
  );
}
