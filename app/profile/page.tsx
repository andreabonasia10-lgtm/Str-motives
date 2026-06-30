"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Shell } from "@/components/shell";
import { useApp } from "@/app/providers";
import { normalizeName } from "@/lib/format";

export default function ProfilePage() {
  const { name, admin, motives, friends, logout } = useApp();
  const router = useRouter();
  const me = normalizeName(name);

  const mine = motives.filter((m) => normalizeName(m.createdBy) === me);
  const going = motives.filter((m) => m.rsvps[me] === "going");

  const doLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <Shell>
      <header className="mb-7 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b8f35a] text-black">
          <UserRound size={28} />
        </div>
        <div>
          <p className="eyebrow">Signed in as</p>
          <h1 className="text-2xl font-bold">{name}</h1>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <b className="block text-2xl">{mine.length}</b>
          <span className="text-xs muted">Hosted</span>
        </div>
        <div className="card p-4 text-center">
          <b className="block text-2xl">{going.length}</b>
          <span className="text-xs muted">Going</span>
        </div>
        <div className="card p-4 text-center">
          <b className="block text-2xl">{friends.length}</b>
          <span className="text-xs muted">Friends</span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Link href="/admin" className="btn btn-soft w-full justify-start">
          <ShieldCheck size={18} /> {admin ? "Admin controls" : "Admin mode"}
        </Link>
        <button
          onClick={doLogout}
          className="btn btn-soft w-full justify-start text-red-400"
        >
          <LogOut size={18} /> Log out
        </button>
      </div>

      <p className="mt-8 text-center text-xs muted">STR Motives · What's the motive?</p>
    </Shell>
  );
}
