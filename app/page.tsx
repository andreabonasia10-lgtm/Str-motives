"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "./providers";

export default function Onboarding() {
  const { name, ready, setName } = useApp();
  const [value, setValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (ready && name) router.replace("/home");
  }, [ready, name, router]);

  const go = () => {
    if (value.trim()) {
      setName(value);
      router.push("/home");
    }
  };

  return (
    <main className="flex min-h-dvh flex-col justify-between px-6 pt-[calc(env(safe-area-inset-top)+30px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <div className="mx-auto w-full max-w-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b8f35a] text-black">
          <Sparkles size={22} />
        </div>
        <div className="mt-16">
          <p className="eyebrow">Private plans. Good people.</p>
          <h1 className="mt-4 text-5xl font-bold leading-[.96] tracking-[-.06em]">
            Welcome to
            <br />
            STR Motives.
          </h1>
          <p className="mt-5 max-w-xs text-lg leading-7 muted">
            Plans leave the group chat and actually happen here.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <label className="mb-2 block text-sm font-semibold">
          What should we call you?
        </label>
        <input
          className="field text-base"
          placeholder="Enter your name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          autoCapitalize="words"
          autoFocus
        />
        <button className="btn btn-primary mt-3 w-full" onClick={go}>
          Continue <ArrowRight size={18} />
        </button>
        <Link href="/admin" className="mt-5 block text-center text-sm muted">
          Admin
        </Link>
      </div>
    </main>
  );
}
