"use client";

import { useState } from "react";
import { Lightbulb, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { useApp } from "@/app/providers";
import { normalizeName } from "@/lib/format";

export default function IdeasPage() {
  const { name, ideas, createIdea, voteIdea } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const me = normalizeName(name);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Drop an idea first");
      return;
    }
    createIdea({ title: title.trim(), description: description.trim() || undefined });
    setTitle("");
    setDescription("");
    toast.success("Idea added");
  };

  const ranked = [...ideas].sort(
    (a, b) =>
      Object.values(b.votes).reduce((x, y) => x + y, 0) -
      Object.values(a.votes).reduce((x, y) => x + y, 0)
  );

  return (
    <Shell>
      <header className="mb-7">
        <p className="eyebrow">The idea board</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">Future motives</h1>
        <p className="mt-2 muted">Float an idea. The group votes it up.</p>
      </header>

      <form onSubmit={submit} className="card space-y-4 p-5">
        <span className="eyebrow">New idea</span>
        <input
          className="field"
          placeholder="Camping trip? Karaoke night?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="field"
          placeholder="Any details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="btn btn-primary w-full">
          <Lightbulb size={18} /> Add idea
        </button>
      </form>

      <div className="mt-5 space-y-4">
        {ranked.map((idea) => {
          const score = Object.values(idea.votes).reduce((x, y) => x + y, 0);
          const mine = idea.votes[me];
          return (
            <div key={idea.id} className="card animate-in p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold">{idea.title}</h2>
                  {idea.description && (
                    <p className="mt-1 text-sm muted">{idea.description}</p>
                  )}
                  <p className="mt-2 text-xs muted">by {idea.createdBy}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#191c1f] px-3 py-1 text-sm font-bold">
                  {score > 0 ? `+${score}` : score}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => voteIdea(idea.id, mine === 1 ? 0 : 1)}
                  className={`btn ${mine === 1 ? "btn-primary" : "btn-soft"}`}
                >
                  <ThumbsUp size={18} />{" "}
                  {Object.values(idea.votes).filter((v) => v === 1).length}
                </button>
                <button
                  onClick={() => voteIdea(idea.id, mine === -1 ? 0 : -1)}
                  className={`btn ${mine === -1 ? "btn-primary" : "btn-soft"}`}
                >
                  <ThumbsDown size={18} />{" "}
                  {Object.values(idea.votes).filter((v) => v === -1).length}
                </button>
              </div>
            </div>
          );
        })}
        {!ranked.length && (
          <div className="card px-6 py-14 text-center">
            <h2 className="text-xl font-bold">No ideas yet.</h2>
            <p className="mt-2 muted">Be the one with the plan.</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
