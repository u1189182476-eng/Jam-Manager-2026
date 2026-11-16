"use client";

import {
  ChevronDown,
  CheckCircle2,
  KeyRound,
  ListMusic,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { InstrumentBadge } from "@/components/instrument-badge";
import type { Slot } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

type Actions = {
  isOwner: (id: string) => boolean;
  onEdit: (slot: Slot) => void;
  onRequestDelete: (slot: Slot) => void;
};

/* ------------------------------------------------------------ fila di brano */

function SlotRow({
  slot,
  position,
  mine,
  variant,
  actions,
}: {
  slot: Slot;
  position: number;
  mine: boolean;
  variant: "queue" | "played";
  actions: Actions;
}) {
  const played = variant === "played";

  return (
    <li
      className={cn(
        "surface group relative flex gap-3 p-3.5 transition sm:gap-4 sm:p-4",
        mine && "border-amber-400/25 bg-amber-400/[0.05]",
        !played && "hover:border-white/15 hover:bg-white/[0.04]",
      )}
    >
      {/* numero / pallino */}
      <div className="flex w-9 shrink-0 flex-col items-center">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black tabular-nums",
            played
              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
              : "border-amber-400/25 bg-amber-400/10 text-amber-300",
          )}
        >
          {played ? <CheckCircle2 className="h-4 w-4" /> : position}
        </span>
        {!played ? (
          <span className="mt-1 h-full w-px bg-gradient-to-b from-white/10 to-transparent" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className={cn(
                "truncate font-display text-[15px] font-bold leading-snug sm:text-base",
                played ? "text-zinc-400" : "text-zinc-100",
              )}
            >
              {slot.song}
            </h3>
            <p className="truncate text-[13px] text-zinc-500">{slot.artist}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {mine && !played ? (
              <span className="hidden rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-200 sm:inline">
                tua
              </span>
            ) : null}
            {mine ? (
              <>
                <button
                  type="button"
                  onClick={() => actions.onEdit(slot)}
                  className="rounded-lg border border-white/10 p-1.5 text-zinc-500 transition hover:border-amber-400/40 hover:text-amber-300"
                  aria-label={`Modifica ${slot.song}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => actions.onRequestDelete(slot)}
                  className="rounded-lg border border-white/10 p-1.5 text-zinc-500 transition hover:border-rose-400/40 hover:text-rose-300"
                  aria-label={`Cancella ${slot.song}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <InstrumentBadge
            instrument={slot.instrument}
            detail={slot.instrumentDetail}
            className={played ? "opacity-70" : undefined}
          />
          {slot.songKey ? (
            <span
              className={cn(
                "chip",
                played
                  ? "border-white/10 bg-white/[0.03] text-zinc-400"
                  : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
              )}
            >
              <KeyRound className="h-3.5 w-3.5" />
              {slot.songKey}
            </span>
          ) : null}
        </div>

        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
          <span className={cn("font-semibold", played ? "text-zinc-400" : "text-zinc-300")}>
            {slot.name}
          </span>
          {played ? (
            <span className="text-[11px] uppercase tracking-wider text-zinc-600">
              suonato alle {formatTime(slot.updatedAt)}
            </span>
          ) : null}
        </p>

        {slot.members.length > 0 ? (
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] leading-relaxed text-zinc-500">
            <Users className="h-3 w-3" />
            {slot.members.map((member, index) => (
              <span key={`${member.name}-${index}`}>
                <span className="text-zinc-400">{member.name}</span>
                <span className="text-zinc-600"> ({member.instrument})</span>
                {index < slot.members.length - 1 ? (
                  <span className="text-zinc-700">, </span>
                ) : null}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </li>
  );
}

/* --------------------------------------------------------------- prossimi */

export function NextUpSection({
  slots,
  actions,
}: {
  slots: Slot[];
  actions: Actions;
}) {
  return (
    <section id="scaletta" className="scroll-mt-24">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-zinc-300">
          <ListMusic className="h-4 w-4 text-emerald-400" />
          {siteConfig.ui.nextTitle}
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {slots.length} {slots.length === 1 ? "brano" : "brani"}
        </span>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-sm text-zinc-500">
          {siteConfig.ui.nextEmpty}
        </div>
      ) : (
        <ol className="space-y-2.5">
          {slots.map((slot, index) => (
            <SlotRow
              key={slot.id}
              slot={slot}
              position={index + 1}
              mine={actions.isOwner(slot.id)}
              variant="queue"
              actions={actions}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- suonati */

export function PlayedSection({
  slots,
  actions,
}: {
  slots: Slot[];
  actions: Actions;
}) {
  if (slots.length === 0) return null;

  return (
    <details className="group mt-8 scroll-mt-24" id="gia-suonati">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 transition hover:border-white/15 hover:bg-white/[0.04]">
        <span className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-500/80" />
          {siteConfig.ui.playedTitle}
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold tracking-normal text-zinc-400">
            {slots.length}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform group-open:rotate-180" />
      </summary>

      <ol className="mt-2.5 space-y-2">
        {slots.map((slot) => (
          <SlotRow
            key={slot.id}
            slot={slot}
            position={0}
            mine={actions.isOwner(slot.id)}
            variant="played"
            actions={actions}
          />
        ))}
      </ol>
    </details>
  );
}
