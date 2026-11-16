import type { Accent } from "@/config/site";
import type { SlotStatus } from "@/lib/types";

type AccentStyle = {
  /** badge strumento */
  badge: string;
  /** pallino colorato */
  dot: string;
  /** bordo/alone per card evidenziate */
  soft: string;
};

/**
 * Classi scritte per esteso: Tailwind le include sempre nel bundle CSS.
 */
export const accentStyles: Record<Accent, AccentStyle> = {
  amber: {
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    dot: "bg-amber-400",
    soft: "border-amber-400/30 bg-amber-400/[0.06]",
  },
  emerald: {
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    dot: "bg-emerald-400",
    soft: "border-emerald-400/30 bg-emerald-400/[0.06]",
  },
  sky: {
    badge: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    dot: "bg-sky-400",
    soft: "border-sky-400/30 bg-sky-400/[0.06]",
  },
  rose: {
    badge: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    dot: "bg-rose-400",
    soft: "border-rose-400/30 bg-rose-400/[0.06]",
  },
  violet: {
    badge: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    dot: "bg-violet-400",
    soft: "border-violet-400/30 bg-violet-400/[0.06]",
  },
  orange: {
    badge: "border-orange-400/30 bg-orange-400/10 text-orange-200",
    dot: "bg-orange-400",
    soft: "border-orange-400/30 bg-orange-400/[0.06]",
  },
  lime: {
    badge: "border-lime-400/30 bg-lime-400/10 text-lime-200",
    dot: "bg-lime-400",
    soft: "border-lime-400/30 bg-lime-400/[0.06]",
  },
  zinc: {
    badge: "border-zinc-400/30 bg-zinc-400/10 text-zinc-200",
    dot: "bg-zinc-400",
    soft: "border-zinc-400/30 bg-zinc-400/[0.06]",
  },
};

export const statusStyles: Record<
  SlotStatus,
  { label: string; short: string; badge: string; dot: string }
> = {
  onstage: {
    label: "Sul palco",
    short: "ON STAGE",
    badge: "border-amber-400/40 bg-amber-400/15 text-amber-200",
    dot: "bg-amber-400",
  },
  waiting: {
    label: "In attesa",
    short: "IN CODA",
    badge: "border-white/15 bg-white/[0.06] text-zinc-300",
    dot: "bg-zinc-400",
  },
  played: {
    label: "Suonato",
    short: "SUONATO",
    badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-500",
  },
};

export const statusOrder: SlotStatus[] = ["waiting", "onstage", "played"];
