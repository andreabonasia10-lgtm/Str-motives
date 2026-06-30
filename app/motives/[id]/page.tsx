"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  MapPin,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { useApp } from "@/app/providers";
import { normalizeName, prettyDate, prettyTime } from "@/lib/format";
import type { Rsvp } from "@/lib/types";

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
        <button onClick={() => router.back()}>← Back</button>
        <div className="card mt-8 p-8 text-center">This motive wandered off.</div>
      </Shell>
    );
  }

  const me = normalizeName(app.name);
  const canManage = app.admin || normalizeName(motive.createdBy) === me;
  const going = Object.entries(motive.rsvps)
    .filter(([, v]) => v === "going")
    .map(([n]) => n);
  const namesFor = (value: Rsvp) =>
    Object.entries(motive.rsvps)
      .filter(([, v]) => v === value)
      .map(([n]) => n)
      .join(", ") || "Nobody yet";

  const addToCalendar = () => {
    const day = motive.date.replaceAll("-", "");
    const start = motive.startTime.replace(":", "") + "00";
    const end = (motive.endTime || motive.startTime).replace(":", "") + "00";
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${day}T${start}\r\nDTEND:${day}T${end}\r\nSUMMARY:${motive.title}\r\nLOCATION:${motive.location} ${
      motive.address || ""
    }\r\nDESCRIPTION:${[motive.description, motive.rules, motive.foodSetup, motive.requirements]
      .filter(Boolean)
      .join(" - ")}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
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
      /* user dismissed share sheet */
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
        <span className="chip active">{motive.category}</span>
        <h1 className="mt-5 text-4xl font-bold leading-[1.04] tracking-[-.05em]">
          {motive.title}
        </h1>
        <p className="mt-3 muted">Planned by {motive.createdBy}</p>
      </header>

      <div className="card mt-6 p-5">
        <div className="flex justify-between">
          <div>
            <b>{prettyDate(motive.date)}</b>
            <p className="mt-1 text-sm muted">
              {prettyTime(motive.startTime)}
              {motive.endTime ? ` – ${prettyTime(motive.endTime)}` : ""}
            </p>
          </div>
          <button aria-label="Add to calendar" onClick={addToCalendar}>
            <CalendarPlus className="text-[#b8f35a]" />
          </button>
        </div>
        <div className="mt-5 flex items-start gap-3 border-t border-white/8 pt-4">
          <MapPin size={18} className="mt-0.5 text-[#b8f35a]" />
          <div>
            <b>{motive.location}</b>
            {motive.address && <p className="mt-1 text-sm muted">{motive.address}</p>}
          </div>
        </div>
      </div>

      {motive.description && (
        <section className="py-7">
          <span className="eyebrow">The vibe</span>
          <p className="mt-3 leading-7 text-[#d5d8d4]">{motive.description}</p>
        </section>
      )}

      <section className="card p-5">
        <span className="eyebrow">Who's pulling up?</span>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["going", "maybe", "cant"] as Rsvp[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                if (
                  v === "going" &&
                  motive.maxGuests &&
                  going.length >= motive.maxGuests &&
                  motive.rsvps[me] !== "going"
                ) {
                  toast.error("This one's full");
                  return;
                }
                app.rsvp(id, v);
              }}
              className={`min-h-20 rounded-2xl border p-2 text-sm font-bold ${
                motive.rsvps[me] === v
                  ? "border-[#b8f35a] bg-[#b8f35a]/12 text-[#b8f35a]"
                  : "border-white/10 bg-[#191c1f]"
              }`}
            >
              <span className="mb-1 block text-xl">
                {v === "going" ? "👍" : v === "maybe" ? "🤔" : "👎"}
              </span>
              {v === "cant" ? "Can't go" : v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <p>
            <b>Going</b>
            <br />
            <span className="muted capitalize">{namesFor("going")}</span>
          </p>
          <p>
            <b>Maybe</b>
            <br />
            <span className="muted capitalize">{namesFor("maybe")}</span>
          </p>
          <p>
            <b>Can't go</b>
            <br />
            <span className="muted capitalize">{namesFor("cant")}</span>
          </p>
        </div>
        {motive.maxGuests && (
          <p className="mt-4 rounded-xl bg-[#191c1f] p-3 text-sm">
            {going.length >= motive.maxGuests
              ? "Full"
              : `${motive.maxGuests - going.length} spots remaining`}
          </p>
        )}
      </section>

      <section className="mt-4 card p-5">
        <span className="eyebrow">Is this the move?</span>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[1, -1].map((v) => (
            <button
              key={v}
              onClick={() => app.vote(id, v)}
              className={`btn ${motive.votes[me] === v ? "btn-primary" : "btn-soft"}`}
            >
              {v === 1 ? <ThumbsUp size={18} /> : <ThumbsDown size={18} />}{" "}
              {Object.values(motive.votes).filter((x) => x === v).length}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 card p-5">
        <span className="eyebrow">Bring list</span>
        <h2 className="mt-2 text-xl font-bold">Still needed</h2>
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
              <span>
                <b>{it.label}</b>
                {it.notes && <small className="block muted">{it.notes}</small>}
              </span>
              <span
                className={`text-xs font-bold ${it.claimedBy ? "muted" : "text-[#b8f35a]"}`}
              >
                {it.claimedBy ? `${it.claimedBy} ✓` : "I'll bring it"}
              </span>
            </button>
          ))}
          {!motive.bringItems.length && (
            <p className="muted">Nothing needed. Just pull up.</p>
          )}
        </div>
      </section>

      {(motive.rules || motive.requirements || motive.foodSetup) && (
        <section className="mt-4 card space-y-5 p-5">
          {motive.foodSetup && (
            <div>
              <span className="eyebrow">Food</span>
              <p className="mt-2">{motive.foodSetup}</p>
            </div>
          )}
          {motive.rules && (
            <div>
              <span className="eyebrow">Rules</span>
              <p className="mt-2 muted">{motive.rules}</p>
            </div>
          )}
          {motive.requirements && (
            <div>
              <span className="eyebrow">Good to know</span>
              <p className="mt-2 muted">{motive.requirements}</p>
            </div>
          )}
        </section>
      )}

      <section className="mt-4 card p-5">
        <span className="eyebrow">Suggestions</span>
        <div className="mt-4 flex gap-2">
          <input
            className="field"
            placeholder="Start later? Add pizza?"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
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
                <b className="text-sm">{s.userName}</b>
                <span className="text-xs uppercase text-[#b8f35a]">{s.status}</span>
              </div>
              <p className="mt-2 text-sm muted">{s.text}</p>
              {canManage && (
                <div className="mt-3 flex gap-2">
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
        Share this motive
      </button>

      <button onClick={addToCalendar} className="btn btn-primary mt-4 w-full">
        <CalendarPlus size={18} /> Add to Calendar
      </button>

      {canManage && (
        <button
          onClick={() => {
            if (confirm("Delete this motive?")) {
              app.deleteMotive(id);
              router.push("/home");
            }
          }}
          className="btn mt-4 w-full text-red-400"
        >
          <Trash2 size={18} /> Delete motive
        </button>
      )}
    </Shell>
  );
}
