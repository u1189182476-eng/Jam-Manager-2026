"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { ApiError } from "@/lib/api-client";
import { BookingFields } from "@/components/booking-fields";
import {
  emptyForm,
  toBookingValues,
  validateForm,
  type FormValues,
} from "@/lib/booking-form";
import { statusStyles } from "@/lib/ui";
import type { BookingValues, JamMode, Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  onSubmit: (values: BookingValues & { website?: string }) => Promise<Slot>;
  onEditOwned: (slot: Slot) => void;
  onRequestDelete: (slot: Slot) => void;
  mySlots: Slot[];
  cooldownLeft: number;
  mode: JamMode;
};

export function BookingForm({
  onSubmit,
  onEditOwned,
  onRequestDelete,
  mySlots,
  cooldownLeft,
  mode,
}: Props) {
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Slot | null>(null);
  const [website, setWebsite] = useState("");
  const formOpenedAt = useRef(Date.now());

  const patch = (next: Partial<FormValues>) => {
    setValues((current) => ({ ...current, ...next }));
    setErrors((current) => {
      if (Object.keys(current).length === 0) return current;
      const cleaned = { ...current };
      Object.keys(next).forEach((key) => delete cleaned[key]);
      return cleaned;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const clientErrors = validateForm(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      setError("Manca qualcosa: controlla i campi evidenziati.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await onSubmit({ ...toBookingValues(values), website });
      setSuccess(created);
      setValues(emptyForm());
      setWebsite("");
      formOpenedAt.current = Date.now();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fields) setErrors(err.fields);
      } else {
        setError("Qualcosa è andato storto. Riprova tra un istante.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || cooldownLeft > 0;

  return (
    <section id="prenota" className="scroll-mt-24">
      <div className="surface card-highlight overflow-hidden">
        {/* intestazione */}
        <div className="border-b border-white/[0.07] px-4 pb-4 pt-5 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-zinc-100">
                {siteConfig.ui.formTitle}
              </h2>
              <p className="mt-0.5 text-[13px] leading-snug text-zinc-400">
                {siteConfig.ui.formSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* le mie prenotazioni */}
        {mySlots.length > 0 ? (
          <div className="border-b border-white/[0.07] bg-amber-400/[0.04] px-4 py-3.5 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
              Le tue prenotazioni su questo dispositivo
            </p>
            <ul className="mt-2 space-y-1.5">
              {mySlots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/30 px-2.5 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-zinc-200">
                      {slot.song}
                    </p>
                    <p className="truncate text-[11px] text-zinc-500">
                      {slot.artist} · {statusStyles[slot.status].label}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditOwned(slot)}
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-amber-400/40 hover:text-amber-300"
                    aria-label={`Modifica ${slot.song}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestDelete(slot)}
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-rose-400/40 hover:text-rose-300"
                    aria-label={`Cancella ${slot.song}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* corpo */}
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {success ? (
            <div className="animate-fade-up rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-bold">{siteConfig.ui.bookedTitle}</p>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-100/80">
                <strong className="text-emerald-50">{success.song}</strong>{" "}
                di {success.artist} è in scaletta. {siteConfig.ui.bookedBody}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEditOwned(success)}
                  className="btn-ghost !py-2.5 text-[13px]"
                >
                  <Pencil className="h-4 w-4" />
                  Modifica
                </button>
                <button
                  type="button"
                  onClick={() => setSuccess(null)}
                  className="btn-ghost !py-2.5 text-[13px]"
                >
                  <Plus className="h-4 w-4" />
                  Prenota un altro brano
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <BookingFields
                values={values}
                errors={errors}
                onChange={patch}
                disabled={submitting}
                idPrefix="public-booking"
              />

              {/* honeypot anti-bot: invisibile agli umani */}
              <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                <label htmlFor="public-booking-website">Non compilare</label>
                <input
                  id="public-booking-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              {error ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button type="submit" disabled={disabled} className="btn-primary w-full">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Invio in corso…
                  </>
                ) : cooldownLeft > 0 ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Aspetta {cooldownLeft}s
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Entra in scaletta
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-zinc-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Nessuna registrazione: la prenotazione resta collegata a questo
                browser (localStorage), così puoi correggerla o cancellarla dal
                telefono.
              </p>
            </form>
          )}
        </div>

        {/* piede */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-zinc-500 sm:px-5">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />
            Anti-spam attivo
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              mode === "redis" ? "text-emerald-400/80" : "text-amber-400/80",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                mode === "redis" ? "bg-emerald-400" : "bg-amber-400",
              )}
            />
            {mode === "redis" ? "Database connesso" : "Modalità demo (memoria)"}
          </span>
        </div>
      </div>
    </section>
  );
}
