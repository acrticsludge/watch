"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "pro_launch_banner_dismissed";

export function ProLaunchBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.07] px-4 py-3 text-sm">
      <span className="shrink-0 text-base">🎉</span>
      <p className="flex-1 text-zinc-300">
        <span className="font-semibold text-white">Pro is live!</span> Unlock
        5-account monitoring, Slack &amp; Discord alerts, 30-day history, and
        usage graphs.{" "}
        <Link
          href="/settings?tab=billing"
          className="underline underline-offset-2 text-blue-400 hover:text-blue-300"
        >
          Upgrade now →
        </Link>
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
