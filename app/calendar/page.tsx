"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { Shell } from "@/components/shell";
import { useApp } from "@/app/providers";
import { prettyDate, prettyTime } from "@/lib/format";

export default function CalendarPage() {
  const { motives } = useApp();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = motives
    .filter((m) => new Date(`${m.date}T12:00:00`) >= today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const past = motives
    .filter((m) => new Date(`${m.date}T12:00:00`) < today)
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));

  const Row = ({ id, title, date, startTime, location }: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    location: string;
  }) => (
    <Link
      href={`/motives/${id}`}
      className="card animate-in flex items-center gap-4 p-4"
    >
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#191c1f] text-center">
        <span className="text-[10px] uppercase muted">
          {prettyDate(date).split(" ")[1]}
        </span>
        <span className="text-lg font-bold leading-none">
          {prettyDate(date).split(" ")[2]}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <b className="block truncate">{title}</b>
        <span className="flex items-center gap-1 text-sm muted">
          {prettyTime(startTime)} · <MapPin size={12} /> {location}
        </span>
      </div>
      <ChevronRight size={18} className="text-[#626970]" />
    </Link>
  );

  return (
    <Shell>
      <header className="mb-7">
        <p className="eyebrow">On the calendar</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">What's coming up</h1>
      </header>

      {!motives.length && (
        <div className="card px-6 py-14 text-center">
          <CalendarDays className="mx-auto text-[#b8f35a]" />
          <h2 className="mt-4 text-xl font-bold">Nothing scheduled.</h2>
          <p className="mt-2 muted">Create a motive to fill the calendar.</p>
        </div>
      )}

      {!!upcoming.length && (
        <>
          <span className="eyebrow">Upcoming</span>
          <div className="mt-3 space-y-3">
            {upcoming.map((m) => (
              <Row key={m.id} {...m} />
            ))}
          </div>
        </>
      )}

      {!!past.length && (
        <>
          <span className="eyebrow mt-8 block">Past</span>
          <div className="mt-3 space-y-3 opacity-60">
            {past.map((m) => (
              <Row key={m.id} {...m} />
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}
