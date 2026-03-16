"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function DashboardRefresher() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const refreshTimer = setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
      setSecondsAgo(0);
    }, REFRESH_INTERVAL_MS);

    const counterTimer = setInterval(() => {
      setSecondsAgo((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(counterTimer);
    };
  }, [router]);

  function handleManualRefresh() {
    router.refresh();
    setLastRefresh(new Date());
    setSecondsAgo(0);
  }

  const label =
    secondsAgo < 5
      ? "just now"
      : secondsAgo < 60
        ? `${secondsAgo}s ago`
        : `${Math.floor(secondsAgo / 60)}m ago`;

  return (
    <button
      onClick={handleManualRefresh}
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Refreshed {label}
    </button>
  );
}
