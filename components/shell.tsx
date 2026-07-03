"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, UserRound } from "lucide-react";
import { useApp } from "@/app/providers";

export function Shell({ children }: { children: React.ReactNode }) {
  const { ready, name } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !name) router.replace("/");
  }, [ready, name, router]);

  if (!ready || !name) {
    return (
      <div className="shell">
        <div className="card h-36 animate-pulse" />
      </div>
    );
  }

  const tab = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <main className="shell">{children}</main>
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d0f10]/95 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-[520px] items-center justify-around px-6 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <Link
            href="/home"
            aria-current={tab("/home") || tab("/motives") ? "page" : undefined}
            className={`flex min-h-14 min-w-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
              tab("/home") || tab("/motives") ? "text-[#b8f35a]" : "text-[#7d858b]"
            }`}
          >
            <Home size={22} strokeWidth={tab("/home") ? 2.4 : 2} />
            Home
          </Link>

          <Link
            href="/create"
            aria-label="Create motive"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#b8f35a] text-black shadow-[0_6px_24px_rgba(184,243,90,.35)] transition active:scale-95"
          >
            <Plus size={26} strokeWidth={2.6} />
          </Link>

          <Link
            href="/profile"
            aria-current={tab("/profile") ? "page" : undefined}
            className={`flex min-h-14 min-w-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
              tab("/profile") ? "text-[#b8f35a]" : "text-[#7d858b]"
            }`}
          >
            <UserRound size={22} strokeWidth={tab("/profile") ? 2.4 : 2} />
            You
          </Link>
        </div>
      </nav>
    </>
  );
}
