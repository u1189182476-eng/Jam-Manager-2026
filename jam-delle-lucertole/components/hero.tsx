import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListMusic,
  MapPin,
  MicVocal,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Equalizer } from "@/components/equalizer";

export function Hero({
  waitingCount,
  onstageCount,
  playedCount,
}: {
  waitingCount: number;
  onstageCount: number;
  playedCount: number;
}) {
  const total = waitingCount + onstageCount + playedCount;

  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      {/* sfondo: foto del palco + velature */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.55]"
        style={{ backgroundImage: "url('/hero-jam.jpg')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/25"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/45 to-ink-950"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-amber-500/15 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]"
        aria-hidden="true"
      />

      <div className="container-page relative py-10 sm:py-14 lg:py-16">
        <div className="max-w-3xl">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/90 sm:text-[11px] sm:tracking-[0.24em]">
            <Equalizer className="h-4 text-emerald-400" bars={4} />
            {siteConfig.kicker}
          </p>

          <h1 className="mt-3 text-balance font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {siteConfig.eventName}
          </h1>

          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-zinc-300 sm:text-base">
            {siteConfig.subtitle}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-[12.5px] text-zinc-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              {siteConfig.venue} · {siteConfig.city}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-400" />
              {siteConfig.scheduleLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              Scaletta in tempo reale
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <a href="#prenota" className="btn-primary w-full sm:w-auto">
              <Sparkles className="h-4 w-4" />
              {siteConfig.ui.bookCta}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#scaletta" className="btn-ghost w-full sm:w-auto">
              <ListMusic className="h-4 w-4" />
              Guarda la scaletta
            </a>
          </div>
        </div>

        {/* contatori */}
        <dl className="mt-8 grid grid-cols-3 gap-2.5 sm:mt-10 sm:max-w-xl sm:gap-3">
          <StatCard
            icon={<MicVocal className="h-4 w-4" />}
            value={onstageCount}
            label="sul palco"
            shortLabel="palco"
            tone="amber"
            live={onstageCount > 0}
          />
          <StatCard
            icon={<ListMusic className="h-4 w-4" />}
            value={waitingCount}
            label="in coda"
            shortLabel="coda"
            tone="zinc"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            value={playedCount}
            label="già suonati"
            shortLabel="suonati"
            tone="emerald"
          />
        </dl>

        <p className="mt-3 text-[11.5px] text-zinc-600">
          {total === 0
            ? "La scaletta è ancora vuota: tocca a te inaugurare il palco."
            : `${total} ${total === 1 ? "prenotazione" : "prenotazioni"} in scaletta stasera`}
        </p>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
  shortLabel,
  tone,
  live = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  shortLabel: string;
  tone: "amber" | "emerald" | "zinc";
  live?: boolean;
}) {
  const tones = {
    amber: "border-amber-400/25 bg-amber-400/[0.07] text-amber-300",
    emerald: "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300",
    zinc: "border-white/10 bg-white/[0.03] text-zinc-300",
  } as const;

  return (
    <div className={`rounded-2xl border px-3 py-2.5 backdrop-blur-sm ${tones[tone]}`}>
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">
        {icon}
        {live ? (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
          </span>
        ) : null}
        <span className="truncate sm:hidden">{shortLabel}</span>
        <span className="hidden truncate sm:inline">{label}</span>
      </dt>
      <dd className="mt-1 font-display text-2xl font-black tabular-nums leading-none text-white sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}
