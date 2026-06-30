"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { useApp } from "@/app/providers";
import { uid } from "@/lib/format";

export default function CreatePage() {
  const { name, createMotive } = useApp();
  const router = useRouter();
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const addItem = () => {
    if (draft.trim()) {
      setItems([...items, draft.trim()]);
      setDraft("");
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") || "").trim();
    if (!title) {
      toast.error("What's the plan?");
      return;
    }
    const id = createMotive({
      title,
      category: "",
      location: String(data.get("location") || "").trim(),
      date: String(data.get("date")),
      startTime: String(data.get("startTime")),
      description: String(data.get("note") || "").trim(),
      createdBy: name,
      bringItems: items.map((label) => ({ id: uid(), label, status: "approved" })),
    });
    toast.success("Motive created");
    router.push(`/motives/${id}`);
  };

  return (
    <Shell>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-[-.03em]">New motive</h1>
        <p className="mt-1 muted">Keep it quick.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="card space-y-4 p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">What's happening?</label>
            <input
              name="title"
              className="field"
              placeholder="Pool day, dinner, movie night…"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Where?</label>
            <input name="location" className="field" placeholder="Downtown" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold">Day</label>
              <input name="date" type="date" className="field" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Time</label>
              <input name="startTime" type="time" className="field" required />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Note <span className="font-normal muted">(optional)</span>
            </label>
            <textarea
              name="note"
              className="field"
              placeholder="Anything people should know"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Bring list <span className="font-normal muted">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                className="field"
                placeholder="Add something to bring"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
              />
              <button type="button" className="btn btn-soft px-4" onClick={addItem}>
                <Plus />
              </button>
            </div>
            {!!items.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((it, i) => (
                  <button
                    key={it + i}
                    type="button"
                    onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                    className="chip flex items-center gap-1"
                  >
                    {it}
                    <X size={13} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="btn btn-primary w-full">Create motive</button>
      </form>
    </Shell>
  );
}
