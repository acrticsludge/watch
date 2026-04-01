"use client";

import { useEffect } from "react";
import { Button } from "@/app/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
      <p className="text-zinc-500 text-sm mb-6 max-w-sm">
        An unexpected error occurred. Try refreshing the page or contact support if the issue persists.
      </p>
      <Button onClick={reset} size="sm">Try again</Button>
    </div>
  );
}
