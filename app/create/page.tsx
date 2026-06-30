"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { useApp } from "@/app/providers";
import { uid } from "@/lib/format";

const CATEGORIES = [
  "Pool Day",
  "Potluck",
  "BBQ",
  "Movie Night",
  "Basketball",
  "Golf",
  "Party",
  "Dinner",
  "Chill",
  "Random",
  "Other",
];

const FOOD = [
  "No food",
  "Host provides food",
  "Bring food",
  "Potluck",
  "Order together",
  "BBQ",
  "Snacks only",
  "Custom",
];

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
      toast.error("Give the motive a name");
      return;
    }
    const id = createMotive({
      title,
      category: String(data.get("category")),
      location: String(data.get("location")),
      address: String(data.get("address") || ""),
      date: String(data.get("date")),
      startTime: String(data.get("startTime")),
      endTime: String(data.get("endTime") || ""),
      description: String(data.get("description") || ""),
      rules: String(data.get("rules") || ""),
      requirements: String(data.get("requirements") || ""),
      maxGuests: Number(data.get("maxGuests")) || undefined,
      allowPlusOnes: data.get("plus") === "on",
      visibility: "everyone",
      invitedNames: [],
      foodSetup: String(data.get("food")),
      createdBy: name,
      bringItems: items.map((label) => ({ id: uid(), label, status: "approved" })),
    });
    toast.success("Motive is live");
    router.push(`/motives/${id}`);
  };

  return (
    <Shell>
      <header className="mb-7">
        <p className="eyebrow">New plan</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Create a motive</h1>
        <p className="mt-2 muted">Keep it simple. You can tweak it later.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <section className="card space-y-4 p-5">
          <span className="eyebrow">01 · Basic info</span>
          <input name="title" className="field" placeholder="What's happening?" required />
          <select name="category" className="field" defaultValue="Chill">
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <textarea name="description" className="field" placeholder="Set the vibe…" />
        </section>

        <section className="card space-y-4 p-5">
          <span className="eyebrow">02 · Time & place</span>
          <input name="location" className="field" placeholder="Location name" required />
          <input name="address" className="field" placeholder="Exact address (optional)" />
          <div className="grid grid-cols-2 gap-3">
            <input name="date" type="date" className="field" required />
            <input name="startTime" type="time" className="field" required />
          </div>
          <input name="endTime" type="time" className="field" aria-label="End time" />
          <p className="-mt-2 text-xs muted">End time is optional</p>
        </section>

        <section className="card space-y-4 p-5">
          <span className="eyebrow">03 · Who can come</span>
          <input
            name="maxGuests"
            type="number"
            min="1"
            className="field"
            placeholder="Max guests (optional)"
          />
          <label className="flex items-center justify-between rounded-2xl bg-[#191c1f] p-4">
            <span>Allow plus-ones</span>
            <input name="plus" type="checkbox" className="h-5 w-5 accent-[#b8f35a]" />
          </label>
        </section>

        <section className="card space-y-4 p-5">
          <span className="eyebrow">04 · Food & bring list</span>
          <select name="food" className="field">
            {FOOD.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              className="field"
              placeholder="Add an item"
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
          <div className="flex flex-wrap gap-2">
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
        </section>

        <section className="card space-y-4 p-5">
          <span className="eyebrow">05 · House rules</span>
          <textarea name="rules" className="field" placeholder="Rules (optional)" />
          <textarea
            name="requirements"
            className="field"
            placeholder="What should people know or bring?"
          />
        </section>

        <button className="btn btn-primary w-full">Create motive</button>
      </form>
    </Shell>
  );
}
