"use client";

import { Check, Delete, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const MAX_DIGITS = 6;

export function AdminPinModal({
  open,
  onClose,
  onUnlock,
}: {
  open: boolean;
  onClose: () => void;
  onUnlock: (pin: string) => Promise<void>;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setPin("");
      setError(null);
      setBusy(false);
    }
  }, [open]);

  const submit = async (candidate?: string) => {
    const value = (candidate ?? pin).trim();
    if (value.length < 4) {
      setError("Il PIN ha almeno 4 cifre.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onUnlock(value);
      setPin("");
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status !== 0 ? err.message : "PIN errato. Riprova.",
      );
      setPin("");
    } finally {
      setBusy(false);
    }
  };

  const press = (digit: string) => {
    if (busy) return;
    setError(null);
    setPin((current) => (current.length >= MAX_DIGITS ? current : current + digit));
  };

  // tastiera fisica (comoda dal portatile della regia)
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        press(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        setPin((current) => current.slice(0, -1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        void submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pin, busy]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Regia"
      description="Inserisci il PIN per gestire la scaletta."
      size="sm"
    >
      <div className="px-5 py-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
          <Lock className="h-6 w-6" />
        </div>

        {/* pallini del PIN */}
        <div className="mt-4 flex items-center justify-center gap-2.5">
          {Array.from({ length: MAX_DIGITS }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-3.5 w-3.5 rounded-full border transition",
                index < pin.length
                  ? "border-amber-300 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                  : "border-white/15 bg-white/[0.04]",
                index === pin.length && "ring-2 ring-amber-400/25",
              )}
            />
          ))}
        </div>

        {error ? (
          <p className="mt-3 text-center text-[12.5px] font-semibold text-rose-300">
            {error}
          </p>
        ) : (
          <p className="mt-3 text-center text-[12px] text-zinc-500">
            PIN a 4–6 cifre · solo per la regia
          </p>
        )}

        {/* tastierino */}
        <div className="mx-auto mt-4 grid max-w-[280px] grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => press(digit)}
              className="rounded-xl border border-white/10 bg-white/[0.03] py-3 text-lg font-bold text-zinc-200 transition active:scale-[0.97] hover:border-white/25 hover:bg-white/[0.07]"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin("")}
            className="rounded-xl border border-white/10 bg-white/[0.02] py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 transition hover:border-white/20 hover:text-zinc-300"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => press("0")}
            className="rounded-xl border border-white/10 bg-white/[0.03] py-3 text-lg font-bold text-zinc-200 transition active:scale-[0.97] hover:border-white/25 hover:bg-white/[0.07]"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => setPin((current) => current.slice(0, -1))}
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] py-3 text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
            aria-label="Cancella ultima cifra"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy}
          className="btn-emerald mt-3 w-full"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifica…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Entra in regia
            </>
          )}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          Il PIN si imposta in config/site.ts o nella variabile ADMIN_PIN
        </p>
      </div>
    </Modal>
  );
}
