import { Plus } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <Logo className="h-10 w-10" />
          <span className="min-w-0">
            <span className="block font-display text-[11px] font-black uppercase leading-[1.2] tracking-[0.13em] text-zinc-100 sm:truncate sm:text-[15px] sm:tracking-[0.16em]">
              {siteConfig.eventName}
            </span>
            <span className="hidden items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-zinc-500 sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Scaletta live
            </span>
          </span>
        </a>

        <nav className="flex items-center gap-2">
          <a
            href="#scaletta"
            className="hidden rounded-xl border border-white/10 px-3 py-2 text-[13px] font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white md:inline-flex"
          >
            Scaletta
          </a>
          <a href="#prenota" className="btn-primary !px-3.5 !py-2.5 text-[13px]">
            <Plus className="h-4 w-4" />
            {siteConfig.ui.bookCtaShort}
          </a>
        </nav>
      </div>
    </header>
  );
}
