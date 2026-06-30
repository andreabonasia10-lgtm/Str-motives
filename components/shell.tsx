"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Home, Lightbulb, Plus, UserRound } from "lucide-react";
import { useApp } from "@/app/providers";

const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/create", label: "Create", icon: Plus },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: UserRound },
];

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

  return (
    <>
      <main className="shell">{children}</main>
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d0f10]/95 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-[520px] items-center justify-around px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+7px)]">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 min-w-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold ${
                  active ? "text-[#b8f35a]" : "text-[#7d858b]"
                }`}
              >
                <Icon size={active ? 22 : 20} strokeWidth={active ? 2.4 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
