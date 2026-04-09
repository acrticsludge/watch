"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/app/components/ui/dialog";

interface DeleteWithConfirmButtonProps {
  endpoint: string;
  title: string;
  description: string;
}

export function DeleteWithConfirmButton({
  endpoint,
  title,
  description,
}: DeleteWithConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setPending(true);
    try {
      await fetch(endpoint, { method: "DELETE" });
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="mt-2 text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#111] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{title}</DialogTitle>
            <DialogDescription className="text-zinc-400 mt-2 leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2.5 rounded-lg bg-red-500/8 border border-red-500/20 px-3.5 py-3">
            <svg className="h-4 w-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-400">This action is permanent and cannot be undone.</p>
          </div>
          <DialogFooter className="gap-2 mt-1">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/6 transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {pending ? "Deleting…" : "Yes, delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
