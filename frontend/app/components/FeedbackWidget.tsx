"use client";

import { useState, useRef, useEffect } from "react";

type Step = "idle" | "open" | "done";

export function FeedbackWidget() {
  const [step, setStep] = useState<Step>("idle");
  const [signedup, setSignedup] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");
  const [general, setGeneral] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (step !== "open") return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setStep("idle");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [step]);

  // Auto-close "done" state after 3s
  useEffect(() => {
    if (step !== "done") return;
    const t = setTimeout(() => setStep("idle"), 3000);
    return () => clearTimeout(t);
  }, [step]);

  function reset() {
    setStep("idle");
    setSignedup(null);
    setReason("");
    setGeneral("");
  }

  async function submit() {
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedup, reason: signedup === false ? reason : null, general }),
      });
    } catch {
      // best-effort
    }
    setSubmitting(false);
    setStep("done");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      {step === "open" && (
        <div
          ref={panelRef}
          className="w-80 bg-[#111] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
            <p className="text-sm font-semibold text-white">Quick feedback</p>
            <button
              onClick={reset}
              className="h-6 w-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-white/6 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-4 space-y-4">
            {/* Did you sign up */}
            <div>
              <p className="text-xs font-medium text-zinc-300 mb-2">Did you sign up?</p>
              <div className="flex gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setSignedup(v)}
                    className={`flex-1 h-8 rounded-lg text-xs font-medium border transition-colors ${
                      signedup === v
                        ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                        : "bg-white/4 border-white/6 text-zinc-500 hover:text-zinc-300 hover:bg-white/6"
                    }`}
                  >
                    {v ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>

            {/* What stopped you — only when No */}
            {signedup === false && (
              <div>
                <p className="text-xs font-medium text-zinc-300 mb-2">
                  What stopped you from signing up?
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Missing feature, pricing, unclear value…"
                  rows={3}
                  className="w-full bg-[#0d0d0d] border border-white/8 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-700 resize-none outline-none focus:border-blue-500/40 transition-colors"
                />
              </div>
            )}

            {/* General */}
            <div>
              <p className="text-xs font-medium text-zinc-300 mb-2">Any other thoughts?</p>
              <textarea
                value={general}
                onChange={(e) => setGeneral(e.target.value)}
                placeholder="What could be better, what you liked…"
                rows={3}
                className="w-full bg-[#0d0d0d] border border-white/8 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-700 resize-none outline-none focus:border-blue-500/40 transition-colors"
              />
            </div>

            <button
              onClick={submit}
              disabled={submitting || (signedup === null && !general.trim())}
              className="w-full h-9 rounded-lg bg-blue-500 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-400 transition-colors"
            >
              {submitting ? "Sending…" : "Send feedback"}
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/6 flex flex-col gap-1">
            <p className="text-[10px] text-zinc-600 mb-1">Or get in touch directly:</p>
            <div className="flex flex-col gap-1.5">
              {process.env.NEXT_PUBLIC_FEEDBACK_EMAIL && (
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_FEEDBACK_EMAIL}`}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {process.env.NEXT_PUBLIC_FEEDBACK_EMAIL}
                </a>
              )}
              <a
                href="https://reddit.com/u/sludge_dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
                u/sludge_dev on Reddit
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="bg-[#111] border border-white/8 rounded-2xl px-5 py-4 shadow-2xl shadow-black/60 text-center">
          <p className="text-sm font-semibold text-white mb-0.5">Thanks!</p>
          <p className="text-xs text-zinc-500">Your feedback was received.</p>
        </div>
      )}

      {/* Wiki link */}
      <a
        href="https://github.com/acrticsludge/Stackwatch/wiki"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 h-9 px-4 rounded-full bg-[#1a1a1a] border border-white/10 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-white/20 shadow-lg transition-colors"
      >
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Docs
      </a>

      {/* Trigger button */}
      {step !== "done" && (
        <button
          onClick={() => setStep((s) => (s === "open" ? "idle" : "open"))}
          className="flex items-center gap-2 h-9 px-4 rounded-full bg-[#1a1a1a] border border-white/10 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-white/20 shadow-lg transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Feedback
        </button>
      )}
    </div>
  );
}
