"use client";

import { KeyRound, MicVocal, Pencil, Sparkles, Trash2, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Equalizer } from "@/components/equalizer";
import { InstrumentBadge } from "@/components/instrument-badge";
import type { Slot } from "@/lib/types";
import { cn, formatTime, initials } from "@/lib/utils";

type Props = {
  slots: Slot[];
  isOwner: (id: string) => boolean;
  onEdit: (slot: Slot) => void;
  onRequestDelete: (slot: Slot) => void;
};

export function OnStageSection({ slots, isOwner, onEdit, onRequestDelete }: Props) {
  return (
    <section id="on-stage" className="scroll-mt-24">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
          </span>
          {siteConfig.ui.onStageTitle}
        </h2>
        {slots.length > 0 ? (
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/70">
            <Equalizer className="h-4" bars={4} />
            live
          </span>
        ) : null}
      </div>

      {slots.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
          <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-amber-300">
            <MicVocal className="h-6 w-6" />
          </span>
          <p className="relative mt-3 text-lg font-bold text-zinc-200">
            {siteConfig.ui.onStageEmpty}
          </p>
          <p className="relative mx-auto mt-1 max-w-md text-sm text-zinc-500">
            Quando la regia chiama il tuo nome, la tua prenotazione compare qui in
            grande.
          </p>
          <a href="#prenota" className="btn-primary relative mt-4 !py-2.5 text-[13px]">
            <Sparkles className="h-4 w-4" />
            {siteConfig.ui.bookCta}
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot, index) => {
            const mine = isOwner(slot.id);
            return (
              <article
                key={slot.id}
                className={cn(
                  "relative overflow-hidden rounded-3xl p-[1px]",
                  index === 0
                    ? "bg-gradient-to-br from-amber-400/70 via-amber-500/20 to-emerald-400/50 shadow-glow"
                    : "bg-gradient-to-br from-white/15 to-white/5",
                )}
              >
                <div className="relative rounded-[23px] bg-gradient-to-b from-ink-850 to-ink-950 px-5 py-5 sm:px-7 sm:py-6">
                  <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

                  <div className="relative flex flex-wrap items-center justify-between gap-2">
                    <span className="chip border-amber-400/40 bg-amber-400/15 text-amber-200">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
                      </span>
                      Sul palco ora
                    </span>
                    <div className="flex items-center gap-2">
                      {mine ? (
                        <span className="chip border-amber-400/40 bg-amber-400/15 text-amber-200">
                          tua prenotazione
                        </span>
                      ) : null}
                      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                        dalle {formatTime(slot.createdAt)}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={cn(
                      "relative mt-3 font-display font-black tracking-tight text-white",
                      index === 0
                        ? "text-3xl leading-[1.05] sm:text-4xl lg:text-5xl"
                        : "text-2xl leading-tight sm:text-3xl",
                    )}
                  >
                    {slot.song}
                  </h3>
                  <p className="relative mt-1 text-sm text-zinc-400 sm:text-base">
                    {slot.artist}
                  </p>

                  <div className="relative mt-4 flex flex-wrap items-center gap-2">
                    <InstrumentBadge
                      instrument={slot.instrument}
                      detail={slot.instrumentDetail}
                    />
                    {slot.songKey ? (
                      <span className="chip border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                        <KeyRound className="h-3.5 w-3.5" />
                        {slot.songKey}
                      </span>
                    ) : null}
                  </div>

                  <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-emerald-500 text-[13px] font-black text-ink-950">
                        {initials(slot.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-zinc-100">{slot.name}</p>
                        <p className="truncate text-[12px] text-zinc-500">
                          {slot.members.length > 0
                            ? `sul palco con ${slot.members.length} ${
                                slot.members.length === 1 ? "musicista" : "musicisti"
                              }`
                            : "sul palco da solista"}
                        </p>
                      </div>
                    </div>

                    {mine ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(slot)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[12px] font-semibold text-zinc-300 transition hover:border-amber-400/40 hover:text-amber-300"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDelete(slot)}
                          className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-zinc-400 transition hover:border-rose-400/40 hover:text-rose-300"
                          aria-label="Cancella la mia prenotazione"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {slot.members.length > 0 ? (
                    <ul className="relative mt-3 flex flex-wrap gap-1.5">
                      {slot.members.map((member, memberIndex) => (
                        <li
                          key={`${member.name}-${memberIndex}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11.5px] text-zinc-300"
                        >
                          <Users className="h-3 w-3 text-zinc-500" />
                          <span className="font-semibold">{member.name}</span>
                          <span className="text-zinc-500">· {member.instrument}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
