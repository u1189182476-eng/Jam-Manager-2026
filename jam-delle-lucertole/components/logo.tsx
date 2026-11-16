import { Music4 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marchio dell'app: nota musicale in ambra dentro una cornice
 * con gradiente ambra → smeraldo, con il "led" verde della lucertola.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-emerald-500 p-[1.5px] shadow-[0_8px_28px_-12px_rgba(251,191,36,0.9)]",
        className,
      )}
      aria-hidden="true"
    >
      <span className="flex h-full w-full items-center justify-center rounded-[14px] bg-ink-950">
        <Music4 className="h-[55%] w-[55%] text-amber-300" strokeWidth={2.4} />
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)] ring-2 ring-ink-950" />
    </span>
  );
}
