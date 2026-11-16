"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Clock,
  GripVertical,
  ListMusic,
  Loader2,
  LogOut,
  MicVocal,
  Pencil,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { InstrumentBadge } from "@/components/instrument-badge";
import { ApiError } from "@/lib/api-client";
import type { Slot, SlotStatus } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  slots: Slot[];
  busy: boolean;
  lastSync: number;
  onSetStatus: (id: string, status: SlotStatus) => Promise<void>;
  onReorder: (ids: string[]) => Promise<void>;
  onReset: () => Promise<void>;
  onEdit: (slot: Slot) => void;
  onDelete: (slot: Slot) => void;
  onLock: () => void;
  onRefresh: () => void;
};

const statusButtons: {
  value: SlotStatus;
  label: string;
  icon: React.ReactNode;
  active: string;
}[] = [
  {
    value: "waiting",
    label: "In attesa",
    icon: <Clock className="h-3 w-3" />,
    active: "border-white/30 bg-white/15 text-white",
  },
  {
    value: "onstage",
    label: "Sul palco",
    icon: <MicVocal className="h-3 w-3" />,
    active: "border-amber-400/50 bg-amber-400/20 text-amber-200",
  },
  {
    value: "played",
    label: "Suonato",
    icon: <CheckCircle2 className="h-3 w-3" />,
    active: "border-emerald-400/50 bg-emerald-400/20 text-emerald-200",
  },
];

export function AdminPanel({
  open,
  onClose,
  slots,
  busy,
  lastSync,
  onSetStatus,
  onReorder,
  onReset,
  onEdit,
  onDelete,
  onLock,
  onRefresh,
}: Props) {
  const [orderIds, setOrderIds] = useState<string[]>(() => slots.map((slot) => slot.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const orderRef = useRef<string[]>(orderIds);
  orderRef.current = orderIds;

  // riallinea l'ordine locale quando cambiano le prenotazioni (non quando
  // cambia solo l'ordine, così il drag non "salta" durante i refresh)
  useEffect(() => {
    setOrderIds((previous) => {
      const previousSet = [...previous].sort().join("|");
      const nextIds = slots.map((slot) => slot.id);
      const nextSet = [...nextIds].sort().join("|");
      return previousSet === nextSet ? previous : nextIds;
    });
  }, [slots]);

  // ESC + blocco scroll
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

  const orderedSlots = useMemo(() => {
    const byId = new Map(slots.map((slot) => [slot.id, slot]));
    return orderIds
      .map((id) => byId.get(id))
      .filter((slot): slot is Slot => Boolean(slot));
  }, [orderIds, slots]);

  const counts = useMemo(
    () => ({
      waiting: slots.filter((slot) => slot.status === "waiting").length,
      onstage: slots.filter((slot) => slot.status === "onstage").length,
      played: slots.filter((slot) => slot.status === "played").length,
    }),
    [slots],
  );

  async function commitOrder(nextOrder: string[]) {
    if (nextOrder.join("|") === slots.map((slot) => slot.id).join("|")) return;
    try {
      setError(null);
      await onReorder(nextOrder);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Riordino non riuscito.");
      setOrderIds(slots.map((slot) => slot.id));
    }
  }

  function moveBy(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= orderIds.length) return;
    const next = [...orderIds];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    setOrderIds(next);
    void commitOrder(next);
  }

  function handleDragStart(event: React.DragEvent, index: number) {
    dragIndex.current = index;
    setDraggingId(orderIds[index] ?? null);
    event.dataTransfer.effectAllowed = "move";
    try {
      event.dataTransfer.setData("text/plain", String(index));
    } catch {
      /* noop */
    }
  }

  function handleDragOver(event: React.DragEvent, index: number) {
    event.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === index) return;
    setOrderIds((previous) => {
      const next = [...previous];
      const [item] = next.splice(from, 1);
      next.splice(index, 0, item!);
      return next;
    });
    dragIndex.current = index;
  }

  function handleDragEnd() {
    dragIndex.current = null;
    setDraggingId(null);
    void commitOrder(orderRef.current);
  }

  async function handleStatus(id: string, status: SlotStatus) {
    setError(null);
    setPendingId(id);
    try {
      await onSetStatus(id, status);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cambio di stato non riuscito.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleReset() {
    setError(null);
    try {
      await onReset();
      setConfirmReset(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset non riuscito.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Chiudi la regia"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/80 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Regia"
        className="relative flex h-full w-full flex-col border-l border-white/10 bg-ink-900 shadow-2xl animate-fade-up sm:max-w-2xl"
      >
        {/* header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] bg-ink-900/95 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
              <MicVocal className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-black uppercase tracking-[0.18em] text-zinc-100">
                Regia
              </p>
              <p className="truncate text-[11px] text-zinc-500">
                {siteConfig.eventName} · aggiornato {formatTime(lastSync)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-white/25 hover:text-zinc-100"
              aria-label="Aggiorna la scaletta"
            >
              <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
            </button>
            <button
              type="button"
              onClick={onLock}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-2 text-[11px] font-semibold text-zinc-400 transition hover:border-amber-400/40 hover:text-amber-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Esci
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-white/25 hover:text-zinc-100"
              aria-label="Chiudi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* corpo */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {/* contatori */}
          <div className="grid grid-cols-3 gap-2">
            <Counter label="In coda" value={counts.waiting} tone="zinc" />
            <Counter label="Sul palco" value={counts.onstage} tone="amber" />
            <Counter label="Suonati" value={counts.played} tone="emerald" />
          </div>

          {error ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-[12.5px] text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* reset */}
          <div className="mt-3">
            {confirmReset ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.08] p-3">
                <p className="flex items-start gap-2 text-[12.5px] font-semibold text-rose-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Svuotare tutta la scaletta? L&apos;operazione è definitiva: le
                  prenotazioni non si possono recuperare.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleReset()}
                    disabled={busy}
                    className="btn-danger !py-2 text-[12px]"
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Sì, svuota tutto
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="btn-ghost !py-2 text-[12px]"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                disabled={slots.length === 0}
                className="btn-ghost w-full !py-2.5 text-[12.5px]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Svuota la scaletta (fine serata)
              </button>
            )}
          </div>

          {/* lista */}
          <div className="mt-5 flex items-end justify-between gap-3">
            <h3 className="flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.18em] text-zinc-300">
              <ListMusic className="h-3.5 w-3.5 text-emerald-400" />
              Scaletta completa
            </h3>
            <span className="text-[10.5px] uppercase tracking-wider text-zinc-600">
              trascina o usa le frecce
            </span>
          </div>

          {orderedSlots.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-white/12 px-4 py-8 text-center text-[13px] text-zinc-500">
              Nessuna prenotazione in scaletta.
            </p>
          ) : (
            <ul className="mt-2.5 space-y-2">
              {orderedSlots.map((slot, index) => (
                <li
                  key={slot.id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDragEnd();
                  }}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 transition",
                    draggingId === slot.id && "border-amber-400/50 bg-amber-400/[0.08] opacity-80",
                    slot.status === "onstage" && "border-amber-400/25",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <GripVertical className="h-4 w-4 cursor-grab text-zinc-600 active:cursor-grabbing" />
                      <span className="text-[10px] font-bold tabular-nums text-zinc-600">
                        {index + 1}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="truncate text-[13.5px] font-bold text-zinc-100">
                          {slot.song}
                        </p>
                        <p className="truncate text-[11.5px] text-zinc-500">{slot.artist}</p>
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-zinc-400">
                        <span className="font-semibold text-zinc-300">{slot.name}</span>
                        <InstrumentBadge
                          instrument={slot.instrument}
                          detail={slot.instrumentDetail}
                          className="!px-1.5 !py-0.5 !text-[10px]"
                        />
                        {slot.songKey ? (
                          <span className="text-[10.5px] text-zinc-500">{slot.songKey}</span>
                        ) : null}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {statusButtons.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => void handleStatus(slot.id, option.value)}
                            disabled={pendingId === slot.id}
                            aria-pressed={slot.status === option.value}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-lg border px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide transition sm:px-2 sm:text-[10.5px]",
                              slot.status === option.value
                                ? option.active
                                : "border-white/10 bg-white/[0.02] text-zinc-500 hover:border-white/25 hover:text-zinc-300",
                            )}
                          >
                            {pendingId === slot.id && slot.status !== option.value ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <span className="hidden sm:inline-flex">{option.icon}</span>
                            )}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-1">
                      <div className="flex gap-1">
                        <IconButton
                          label="Sposta su"
                          onClick={() => moveBy(index, -1)}
                          disabled={index === 0 || busy}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton
                          label="Sposta giù"
                          onClick={() => moveBy(index, 1)}
                          disabled={index === orderedSlots.length - 1 || busy}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                      <div className="flex gap-1">
                        <IconButton label="Modifica" onClick={() => onEdit(slot)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton
                          label="Elimina"
                          onClick={() => onDelete(slot)}
                          danger
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
            <Check className="h-3.5 w-3.5" />
            Le modifiche sono visibili subito a tutti i musicisti
          </p>
        </div>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "zinc" | "amber" | "emerald";
}) {
  const tones = {
    zinc: "border-white/10 bg-white/[0.03] text-zinc-300",
    amber: "border-amber-400/25 bg-amber-400/[0.07] text-amber-300",
    emerald: "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300",
  } as const;

  return (
    <div className={cn("rounded-xl border px-2.5 py-2", tones[tone])}>
      <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] opacity-75">{label}</p>
      <p className="font-display text-xl font-black tabular-nums leading-tight text-white">
        {value}
      </p>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.02] p-1.5 text-zinc-400 transition hover:border-white/25 hover:text-zinc-100 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-zinc-400",
        danger && "hover:border-rose-400/40 hover:text-rose-300",
      )}
    >
      {children}
    </button>
  );
}
