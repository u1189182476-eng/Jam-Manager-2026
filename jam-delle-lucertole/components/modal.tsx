"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Guscio modale riutilizzabile: backdrop, ESC, blocco scroll. */
export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  size = "md",
  align = "center",
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "center" | "right";
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  } as const;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        align === "right" ? "justify-end" : "items-center justify-center p-4",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Chiudi"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/75 backdrop-blur-sm"
      />

      <div
        className={cn(
          "relative flex w-full flex-col overflow-hidden border-white/10 bg-ink-900 shadow-2xl animate-fade-up",
          align === "right"
            ? "h-full max-h-dvh border-l"
            : cn("max-h-[92dvh] rounded-3xl border", widths[size]),
          className,
        )}
      >
        {title ? (
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-100">
                {title}
              </h2>
              {description ? (
                <p className="mt-0.5 text-sm text-zinc-400">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi"
              className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-zinc-400 transition hover:border-white/20 hover:text-zinc-100"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
