"use client";

import { Database, Instagram, Lock, LockOpen, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/logo";
import type { JamMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SiteFooter({
  mode,
  isAdmin,
  onOpenAdmin,
}: {
  mode: JamMode;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t border-white/[0.06] bg-black/40">
      <div className="container-page flex flex-col gap-6 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <p className="font-display text-[13px] font-black uppercase tracking-[0.16em] text-zinc-200">
              {siteConfig.eventName}
            </p>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-zinc-500">
            {siteConfig.footerNote}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
            {siteConfig.contacts.instagram ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-zinc-400">
                <Instagram className="h-3.5 w-3.5 text-amber-400/80" />
                {siteConfig.contacts.instagram}
              </span>
            ) : null}
            {siteConfig.contacts.email ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-zinc-400">
                <Mail className="h-3.5 w-3.5 text-emerald-400/80" />
                {siteConfig.contacts.email}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <button
            type="button"
            onClick={onOpenAdmin}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold transition",
              isAdmin
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15"
                : "border-white/10 text-zinc-500 hover:border-amber-400/40 hover:text-amber-300",
            )}
          >
            {isAdmin ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {isAdmin ? "Regia attiva" : siteConfig.adminLabel}
          </button>

          <p
            className={cn(
              "inline-flex items-center gap-1.5 text-[11px]",
              mode === "redis" ? "text-emerald-500/80" : "text-amber-500/80",
            )}
            title={
              mode === "redis"
                ? "Dati salvati su Upstash Redis / Vercel KV"
                : "Nessun database configurato: i dati vivono nella memoria del server"
            }
          >
            <Database className="h-3.5 w-3.5" />
            {mode === "redis" ? "Dati sincronizzati sul cloud" : "Demo: dati in memoria"}
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.05]">
        <div className="container-page flex flex-col gap-1 py-4 text-[11px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {siteConfig.eventName} · {siteConfig.venue}, {siteConfig.city}
          </span>
          <span>Scaletta live · Next.js + Tailwind</span>
        </div>
      </div>
    </footer>
  );
}
