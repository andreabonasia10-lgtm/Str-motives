"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  HandPlatter,
  Home,
  Lightbulb,
  PartyPopper,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { useApp } from "@/app/providers";

const TOUR_KEY = "str-tour-v1";

function TourRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-[#191c1f] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b8f35a]/12 text-[#b8f35a]">
        {icon}
      </div>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-5 muted">{text}</p>
      </div>
    </div>
  );
}

function Tour() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    if (!localStorage.getItem(TOUR_KEY)) queueMicrotask(show);
    window.addEventListener("str:show-tour", show);
    return () => window.removeEventListener("str:show-tour", show);
  }, []);

  const close = () => {
    localStorage.setItem(TOUR_KEY, "done");
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end bg-black/75 backdrop-blur-sm"
      role="presentation"
    >
      <section
        aria-labelledby="tour-title"
        aria-modal="true"
        role="dialog"
        className="mx-auto w-full max-w-[520px] rounded-t-[30px] border border-white/10 bg-[#121416] px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+22px)] shadow-2xl"
      >
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-white/15" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow text-[#b8f35a]">The 20-second tour</span>
            <h2 id="tour-title" className="mt-2 text-2xl font-bold tracking-[-.03em]">
              Make plans. Actually go.
            </h2>
          </div>
          <button
            aria-label="Close tutorial"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1d20] muted"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 space-y-3">
          <TourRow
            icon={<PartyPopper size={20} />}
            title="Start or open a motive"
            text="Create the plan, then share this link with the group."
          />
          <TourRow
            icon={<Check size={20} />}
            title="Tap your RSVP"
            text="Going, maybe, or out—you can change it anytime."
          />
          <TourRow
            icon={<HandPlatter size={20} />}
            title="Claim what you'll bring"
            text="Vote, grab an item, or suggest a better plan."
          />
        </div>
        <button onClick={close} className="btn btn-primary mt-6 w-full">
          <CalendarPlus size={18} /> Got it—show me the motives
        </button>
      </section>
    </div>
  );
}

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
      <Tour />
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
