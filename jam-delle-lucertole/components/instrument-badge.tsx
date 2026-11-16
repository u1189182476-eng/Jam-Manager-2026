import {
  Drum,
  Guitar,
  MicVocal,
  Music4,
  Piano,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { findInstrument } from "@/config/site";
import { accentStyles } from "@/lib/ui";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  voce: MicVocal,
  "chitarra-elettrica": Guitar,
  "chitarra-acustica": Guitar,
  basso: Music4,
  batteria: Drum,
  tastiere: Piano,
  fiati: Wind,
  altro: Sparkles,
};

export function InstrumentIcon({
  instrument,
  className,
}: {
  instrument: string;
  className?: string;
}) {
  const Icon = iconMap[instrument] ?? Sparkles;
  return <Icon className={cn("h-3.5 w-3.5", className)} aria-hidden="true" />;
}

/** Badge colorato con icona + etichetta dello strumento. */
export function InstrumentBadge({
  instrument,
  detail,
  className,
}: {
  instrument: string;
  detail?: string;
  className?: string;
}) {
  const option = findInstrument(instrument);
  const styles = accentStyles[option.accent];

  return (
    <span className={cn("chip", styles.badge, className)}>
      <InstrumentIcon instrument={instrument} />
      <span className="truncate">
        {option.label}
        {detail ? <span className="opacity-70"> · {detail}</span> : null}
      </span>
    </span>
  );
}
