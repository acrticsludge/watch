"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MakePrimaryButtonProps {
  endpoint: string;
  /** Visual variant: "card" (inline small) or "page" (standalone full button). Defaults to "card". */
  variant?: "card" | "page";
}

export function MakePrimaryButton({ endpoint, variant = "card" }: MakePrimaryButtonProps) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPending(true);
    try {
      await fetch(endpoint, { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (variant === "page") {
    return (
      <button
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/6 hover:bg-white/10 text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {pending ? "Updating…" : "Make primary"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 flex items-center gap-1"
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
      {pending ? "Updating…" : "Make primary"}
    </button>
  );
}
