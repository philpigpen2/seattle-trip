"use client";

import { useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

const INTERVAL_MS = 30_000;

export function LiveRefresh({ observedAt, available }: { observedAt: string | null; available: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    const timer = window.setInterval(refresh, INTERVAL_MS);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  return (
    <div className="font-mono text-[9px] uppercase leading-5 tracking-[0.14em] text-[#777970]" aria-live="polite">
      <p className="flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${isPending ? "animate-pulse bg-[#ffbd59]" : available ? "bg-[#75c787]" : "bg-[#f16d63]"}`} aria-hidden="true" />
        {isPending ? "Refreshing live status" : available ? "Live · refreshes every 30 seconds" : "Live refresh unavailable · retrying"}
      </p>
      <p>{observedAt ? `Observed ${observedAt}` : "Last observation unavailable"}</p>
      <button
        type="button"
        onClick={refresh}
        disabled={isPending}
        className="mt-2 min-h-9 border border-white/15 px-3 py-1 text-[#d5d2c7] transition-colors hover:border-[#ffbd59]/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffbd59] disabled:cursor-wait disabled:opacity-60"
      >
        Refresh now
      </button>
    </div>
  );
}
