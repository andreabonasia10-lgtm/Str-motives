"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarPlus, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { useApp } from "@/app/providers";
import { normalizeName, prettyDate, prettyTime } from "@/lib/format";
import type { Rsvp } from "@/lib/types";

const RSVP_ORDER: Record<Rsvp, number> = { going: 0, maybe: 1, cant: 2 };

export default function MotivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const app = useApp();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState("");

  const motive = app.motives.find((m) => m.id === id);

  if (!motive) {
    return (
      <Shell>
        <button onClick={() => router.back()} className="muted">
          ← Back
        </button>
        <div className="card mt-8 p-8 text-center">This motive wandered off.</div>
      </Shell>
    );
  }

  const me = normalizeName(app.name);
  const canManage = app.admin || normalizeName(motive.createdBy) === me;

  const roster = Object.entries(motive.rsvps).sort(
    (a, b) => RSVP_ORDER[a[1]] - RSVP_ORDER[b[1]]
  );
  const goingCount = roster.filter(([, v]) => v === "going").length;

  const addToCalendar = () => {
    const day = motive.date.replaceAll("-", "");
    const start = motive.startTime.replace(":", "") + "00";
    const end = (motive.endTime || motive.startTime).replace(":", "") + "00";
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${day}T${start}\r\nDTEND:${day}T${end}\r\nSUMMARY:${motive.title}\r\nLOCATION:${motive.location}\r\nDESCRIPTION:${motive.description || ""}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${motive.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: motive.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <Shell>
      <button
        onClick={() => router.back()}
        className="mb-6 flex h-11 items-center gap-2 muted"
      >
        <ArrowLeft size={19} /> Back
      </button>

      <header>
        <h1 className="text-4xl font-bold leading-[1.04] tracking-[-.05em]">
          {motive.title}
        </h1>
        <p className="mt-3 muted">by {motive.createdBy}</p>
      </header>

      <div className="card mt-6 p-5">
        <div className="flex justify-between">
          <div>
            <b>{prettyDate(motive.date)}</b>
            <p className="mt-1 text-sm muted">{prettyTime(motive.startTime)}</p>
          </div>
          <button
            aria-label="Add to calendar"
            onClick={addToCalendar}
            className="text-[#b8f35a]"
          >
            <CalendarPlus />
          </button>
        </div>
        {motive.location && (
          <div className="mt-5 flex items-start gap-3 border-t border-white/8 pt-4">
            <MapPin size={18} className="mt-0.5 text-[#b8f35a]" />
            <b>{motive.location}</b>
          </div>
        )}
      </div>

      {motive.description && (
        <section className="py-6">
          <p className="leading-7 text-[#d5d8d4]">{motive.description}</p>
        </section>
      )}

      {/* RSVP + who's going */}
      <section className="mt-2 card p-5">
        <h2 className="text-xl font-bold">Are you going?</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["going", "maybe", "cant"] as Rsvp[]).map((v) => (
            <button
              key={v}
              onClick={() => app.rsvp(id, v)}
              className={`min-h-20 rounded-2xl border p-2 text-sm font-bold ${
                motive.rsvps[me] === v
                  ? "border-[#b8f35a] bg-[#b8f35a]/12 text-[#b8f35a]"
                  : "border-white/10 bg-[#191c1f]"
              }`}
            >
              <span className="mb-1 block text-xl">
                {v === "going" ? "👍" : v === "maybe" ? "🤔" : "👎"}
              </span>
              {v === "going" ? "Going" : v === "maybe" ? "Maybe" : "Can't"}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Who's going</span>
            <span className="text-sm font-bold text-[#b8f35a]">{goingCount} going</span>
          </div>
          <div className="mt-3 space-y-2">
            {roster.length === 0 && (
              <p className="text-sm muted">No replies yet — be the first.</p>
            )}
            {roster.map(([person, status]) => (
              <div
                key={person}
                className="flex items-center justify-between rounded-xl bg-[#191c1f] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase">
                    {person.slice(0, 1)}
                  </div>
                  <span className="capitalize">{person}</span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    status === "going"
                      ? "text-[#b8f35a]"
                      : status === "cant"
                        ? "text-red-400"
                        : "muted"
                  }`}
                >
                  {status === "going" ? "Going" : status === "cant" ? "Not going" : "Maybe"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bring list */}
      {motive.bringItems.length > 0 && (
        <section className="mt-4 card p-5">
          <h2 className="text-xl font-bold">Bring list</h2>
          <p className="mt-1 text-sm muted">Tap to grab one.</p>
          <div className="mt-4 space-y-2">
            {motive.bringItems.map((it) => (
              <button
                key={it.id}
                onClick={() => {
                  if (!it.claimedBy || normalizeName(it.claimedBy) === me || app.admin) {
                    app.claim(id, it.id);
                  }
                }}
                className="flex w-full items-center justify-between rounded-2xl bg-[#191c1f] p-4 text-left"
              >
                <b>{it.label}</b>
                <span
                  className={`text-xs font-bold ${it.claimedBy ? "muted" : "text-[#b8f35a]"}`}
                >
                  {it.claimedBy ? `${it.claimedBy} ✓` : "I'll bring it"}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Suggestions */}
      <section className="mt-4 card p-5">
        <h2 className="text-xl font-bold">Suggestions</h2>
        <div className="mt-4 flex gap-2">
          <input
            className="field"
            placeholder="Start later? Add pizza?"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && suggestion.trim()) {
                app.addSuggestion(id, suggestion.trim());
                setSuggestion("");
                toast.success("Suggestion sent");
              }
            }}
          />
          <button
            className="btn btn-primary px-4"
            onClick={() => {
              if (suggestion.trim()) {
                app.addSuggestion(id, suggestion.trim());
                setSuggestion("");
                toast.success("Suggestion sent");
              }
            }}
          >
            Add
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {motive.suggestions.map((s) => (
            <div key={s.id} className="rounded-2xl bg-[#191c1f] p-4">
              <div className="flex justify-between">
                <b className="text-sm capitalize">{s.userName}</b>
                {s.status !== "new" && (
                  <span className="text-xs uppercase text-[#b8f35a]">{s.status}</span>
                )}
              </div>
              <p className="mt-2 text-sm muted">{s.text}</p>
              {canManage && (
                <div className="mt-3 flex gap-3">
                  {["accepted", "rejected", "done"].map((st) => (
                    <button
                      key={st}
                      onClick={() => app.statusSuggestion(id, s.id, st)}
                      className="text-xs muted"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <button onClick={share} className="btn btn-soft mt-4 w-full">
        Share
      </button>
      <button onClick={addToCalendar} className="btn btn-primary mt-3 w-full">
        <CalendarPlus size={18} /> Add to calendar
      </button>

      {canManage && (
        <button
          onClick={() => {
            if (confirm("Delete this motive?")) {
              app.deleteMotive(id);
              router.push("/home");
            }
          }}
          className="btn mt-3 w-full text-red-400"
        >
          <Trash2 size={18} /> Delete motive
        </button>
      )}
    </Shell>
  );
}
