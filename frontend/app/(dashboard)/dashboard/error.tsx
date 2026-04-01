"use client";

import { useEffect } from "react";
import { Button } from "@/app/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-base font-semibold text-white mb-2">Failed to load dashboard</h2>
      <p className="text-zinc-500 text-sm mb-6 max-w-sm">
        Something went wrong loading your usage data. Try refreshing.
      </p>
      <Button onClick={reset} size="sm">Try again</Button>
    </div>
  );
}
