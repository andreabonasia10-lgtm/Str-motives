"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, LogOut, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { Shell } from "@/components/shell";
import { useApp } from "@/app/providers";
import { normalizeName } from "@/lib/format";

export default function YouPage() {
  const { name, admin, motives, online, logout } = useApp();
  const router = useRouter();
  const me = normalizeName(name);

  const hosting = motives.filter((m) => normalizeName(m.createdBy) === me).length;
  const going = motives.filter((m) => m.rsvps[me] === "going").length;

  const doLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <Shell>
      <header className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b8f35a] text-black">
          <UserRound size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm muted">
            <span className="h-2 w-2 rounded-full bg-[#b8f35a]" /> Online
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <b className="block text-2xl">{hosting}</b>
          <span className="text-xs muted">Hosting</span>
        </div>
        <div className="card p-4 text-center">
          <b className="block text-2xl">{going}</b>
          <span className="text-xs muted">Going</span>
        </div>
      </div>

      <section className="card mt-4 p-5">
        <span className="eyebrow">Online now</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {online.map((who) => (
            <span key={who} className="rounded-full bg-[#191c1f] px-3 py-1 text-sm capitalize">
              {who === me ? "You" : who}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-4 space-y-3">
        <Link
          href="/install"
          className="card flex items-center gap-4 p-4 transition active:scale-[.99]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#b8f35a]/12 text-[#b8f35a]">
            <Smartphone size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <b className="block">Put Motives on your phone</b>
            <span className="text-sm muted">Add it to your home screen like an app</span>
          </div>
          <ChevronRight size={18} className="text-[#626970]" />
        </Link>

        <Link href="/admin" className="btn btn-soft w-full justify-start">
          <ShieldCheck size={18} /> {admin ? "Admin controls" : "Admin mode"}
        </Link>
        <button onClick={doLogout} className="btn btn-soft w-full justify-start text-red-400">
          <LogOut size={18} /> Log out
        </button>
      </div>
    </Shell>
  );
}
