import { Music, ScrollText } from "lucide-react";
import { siteConfig } from "@/config/site";

export function RulesCard() {
  return (
    <section className="surface overflow-hidden" aria-labelledby="regole-title">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3.5">
        <ScrollText className="h-4 w-4 text-amber-400" />
        <h2
          id="regole-title"
          className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-zinc-200"
        >
          {siteConfig.rulesTitle}
        </h2>
      </div>

      <ol className="divide-y divide-white/[0.05]">
        {siteConfig.rules.map((rule, index) => (
          <li key={rule} className="flex gap-3 px-4 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10 text-[10px] font-black text-emerald-300">
              {index + 1}
            </span>
            <p className="text-[12.5px] leading-relaxed text-zinc-400">{rule}</p>
          </li>
        ))}
      </ol>

      <p className="flex items-start gap-2 border-t border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[12px] leading-relaxed text-zinc-500">
        <Music className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" />
        {siteConfig.rulesFootnote}
      </p>
    </section>
  );
}
