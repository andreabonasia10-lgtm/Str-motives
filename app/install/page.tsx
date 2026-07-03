"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, EllipsisVertical, Share, Sparkles, SquarePlus } from "lucide-react";
import { Shell } from "@/components/shell";

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#b8f35a] text-sm font-bold text-black">
        {n}
      </div>
      <div className="min-w-0 flex-1">
        <b className="block">{title}</b>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

/** A little fake phone-bar mockup so people recognize the exact button. */
function Mock({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#191c1f] px-4 py-3 text-sm">
      {children}
    </div>
  );
}

export default function InstallPage() {
  const router = useRouter();

  return (
    <Shell>
      <button
        onClick={() => router.back()}
        className="mb-6 flex h-11 items-center gap-2 muted"
      >
        <ArrowLeft size={19} /> Back
      </button>

      <header>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b8f35a] text-black">
          <Sparkles size={22} />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-[-.03em]">
          Put Motives on your phone
        </h1>
        <p className="mt-2 muted">
          Two taps and it sits on your home screen like a real app. No app store.
        </p>
      </header>

      <section className="card mt-6 space-y-6 p-5">
        <span className="eyebrow"> iPhone (Safari)</span>
        <Step n={1} title="Open this site in Safari">
          <p className="text-sm muted">str-motives.vercel.app</p>
        </Step>
        <Step n={2} title="Tap the Share button">
          <Mock>
            <span className="muted">bottom of the screen</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d84ff]/15 text-[#4da3ff]">
              <Share size={18} />
            </span>
          </Mock>
        </Step>
        <Step n={3} title={'Scroll down, tap "Add to Home Screen"'}>
          <Mock>
            <span>Add to Home Screen</span>
            <SquarePlus size={18} className="muted" />
          </Mock>
        </Step>
        <Step n={4} title={'Tap "Add" — done'}>
          <p className="text-sm muted">The Motives icon appears with your other apps.</p>
        </Step>
      </section>

      <section className="card mt-4 space-y-6 p-5">
        <span className="eyebrow">Android (Chrome)</span>
        <Step n={1} title="Open this site in Chrome">
          <p className="text-sm muted">str-motives.vercel.app</p>
        </Step>
        <Step n={2} title="Tap the 3 dots (top right)">
          <Mock>
            <span className="muted">top of the screen</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <EllipsisVertical size={18} />
            </span>
          </Mock>
        </Step>
        <Step n={3} title={'Tap "Add to Home screen", then "Add"'}>
          <Mock>
            <span>Add to Home screen</span>
            <SquarePlus size={18} className="muted" />
          </Mock>
        </Step>
      </section>

      <p className="mt-6 text-center text-sm muted">
        Send this page to the group chat so everyone installs it. 📲
      </p>
    </Shell>
  );
}
