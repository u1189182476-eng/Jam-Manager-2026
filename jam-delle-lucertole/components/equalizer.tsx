import { cn } from "@/lib/utils";

/** Piccola animazione "equalizzatore" usata nell'hero e nella card on stage. */
export function Equalizer({
  className,
  bars = 5,
}: {
  className?: string;
  bars?: number;
}) {
  return (
    <span
      className={cn("inline-flex h-5 items-end gap-[3px]", className)}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, index) => (
        <span
          key={index}
          className="w-[3px] origin-bottom rounded-full bg-current animate-eq"
          style={{
            height: `${8 + ((index * 5) % 12)}px`,
            animationDelay: `${index * 0.13}s`,
          }}
        />
      ))}
    </span>
  );
}
