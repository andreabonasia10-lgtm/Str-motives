"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/app/providers";

export default function AdminPage() {
  const app = useApp();
  const [password, setPassword] = useState("");
  const [friend, setFriend] = useState("");

  const login = async () => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      app.setAdmin(true);
      toast.success("Admin mode on");
    } else {
      toast.error("Wrong password");
    }
  };

  if (!app.ready) return null;

  if (!app.admin) {
    return (
      <main className="flex min-h-dvh items-center px-6">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 muted">
            <ArrowLeft size={18} /> Back
          </Link>
          <div className="card p-6">
            <ShieldCheck className="text-[#b8f35a]" />
            <h1 className="mt-5 text-2xl font-bold">Admin mode</h1>
            <p className="mt-2 text-sm muted">
              For the friend who has to keep this thing civilized.
            </p>
            <input
              type="password"
              className="field mt-6"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
            <button className="btn btn-primary mt-3 w-full" onClick={login}>
              Enter admin mode
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="mb-7 flex items-center justify-between">
        <div>
          <p className="eyebrow">Owner controls</p>
          <h1 className="mt-2 text-3xl font-bold">Admin</h1>
        </div>
        <Link href={app.name ? "/home" : "/"} className="chip">
          Done
        </Link>
      </header>

      <section className="card p-5">
        <div className="flex justify-between">
          <div>
            <span className="eyebrow">Friend list</span>
            <p className="mt-1 text-sm muted">{app.friends.length} people</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="field"
            placeholder="Add a friend"
            value={friend}
            onChange={(e) => setFriend(e.target.value)}
          />
          <button
            onClick={() => {
              app.addFriend(friend);
              setFriend("");
            }}
            className="btn btn-primary px-4"
          >
            <Plus />
          </button>
        </div>
        <div className="mt-3">
          {app.friends.map((f) => (
            <div
              key={f}
              className="flex items-center border-b border-white/8 py-3 last:border-0"
            >
              <span className="flex-1">{f}</span>
              <button onClick={() => app.removeFriend(f)} className="text-red-400">
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-4 p-5">
        <span className="eyebrow">All motives</span>
        <div className="mt-3">
          {app.motives.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 border-b border-white/8 py-3 last:border-0"
            >
              <Link href={`/motives/${m.id}`} className="min-w-0 flex-1">
                <b className="block truncate">{m.title}</b>
                <small className="muted">by {m.createdBy}</small>
              </Link>
              <button
                onClick={() => confirm("Delete this motive?") && app.deleteMotive(m.id)}
                className="text-red-400"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          {!app.motives.length && <p className="muted">No motives yet.</p>}
        </div>
      </section>

      <button
        onClick={() => app.setAdmin(false)}
        className="btn btn-soft mt-4 w-full"
      >
        Exit admin mode
      </button>
    </main>
  );
}
