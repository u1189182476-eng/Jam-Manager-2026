"use client";

import { KeyRound, Music2, Plus, Trash2, User, Users, Wand2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  instrumentNeedsDetail,
  type FormValues,
} from "@/lib/booking-form";
import { cn } from "@/lib/utils";

type Props = {
  values: FormValues;
  errors: Record<string, string>;
  onChange: (patch: Partial<FormValues>) => void;
  disabled?: boolean;
  idPrefix?: string;
};

/** Campi della prenotazione, condivisi tra form pubblico e modifica in regia. */
export function BookingFields({
  values,
  errors,
  onChange,
  disabled = false,
  idPrefix = "booking",
}: Props) {
  const showDetail = instrumentNeedsDetail(values.instrument);

  const updateMember = (index: number, patch: Partial<{ name: string; instrument: string }>) => {
    const members = values.members.map((member, i) =>
      i === index ? { ...member, ...patch } : member,
    );
    onChange({ members });
  };

  const addMember = () => {
    if (values.members.length >= siteConfig.maxMembersPerSlot) return;
    onChange({ members: [...values.members, { name: "", instrument: "" }] });
  };

  const removeMember = (index: number) => {
    onChange({ members: values.members.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Nome e cognome */}
      <div>
        <label className="label" htmlFor={`${idPrefix}-name`}>
          <User className="h-3.5 w-3.5" />
          Nome e cognome <span className="text-amber-400">*</span>
        </label>
        <input
          id={`${idPrefix}-name`}
          className={cn("input", errors.name && "border-rose-500/60 focus:border-rose-500/80 focus:ring-rose-500/20")}
          value={values.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Es. Marta Russo"
          autoComplete="name"
          maxLength={siteConfig.limits.name}
          disabled={disabled}
          required
        />
        {errors.name ? <FieldError>{errors.name}</FieldError> : null}
      </div>

      {/* Strumento */}
      <div>
        <label className="label" htmlFor={`${idPrefix}-instrument`}>
          <Music2 className="h-3.5 w-3.5" />
          Strumento <span className="text-amber-400">*</span>
        </label>
        <select
          id={`${idPrefix}-instrument`}
          className={cn("input", errors.instrument && "border-rose-500/60 focus:border-rose-500/80 focus:ring-rose-500/20")}
          value={values.instrument}
          onChange={(event) => onChange({ instrument: event.target.value })}
          disabled={disabled}
          required
        >
          <option value="">Scegli lo strumento…</option>
          {siteConfig.instruments.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.instrument ? <FieldError>{errors.instrument}</FieldError> : null}

        {showDetail ? (
          <div className="mt-2">
            <input
              className={cn("input", errors.instrumentDetail && "border-rose-500/60")}
              value={values.instrumentDetail}
              onChange={(event) => onChange({ instrumentDetail: event.target.value })}
              placeholder="Quale strumento? Es. Armonica, Violino, Kazoo…"
              maxLength={siteConfig.limits.instrumentDetail}
              disabled={disabled}
            />
            {errors.instrumentDetail ? (
              <FieldError>{errors.instrumentDetail}</FieldError>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Brano e artista */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor={`${idPrefix}-song`}>
            <Wand2 className="h-3.5 w-3.5" />
            Titolo del brano <span className="text-amber-400">*</span>
          </label>
          <input
            id={`${idPrefix}-song`}
            className={cn("input", errors.song && "border-rose-500/60")}
            value={values.song}
            onChange={(event) => onChange({ song: event.target.value })}
            placeholder="Es. Proud Mary"
            maxLength={siteConfig.limits.song}
            disabled={disabled}
            required
          />
          {errors.song ? <FieldError>{errors.song}</FieldError> : null}
        </div>

        <div>
          <label className="label" htmlFor={`${idPrefix}-artist`}>
            Artista / Band <span className="text-amber-400">*</span>
          </label>
          <input
            id={`${idPrefix}-artist`}
            className={cn("input", errors.artist && "border-rose-500/60")}
            value={values.artist}
            onChange={(event) => onChange({ artist: event.target.value })}
            placeholder="Es. Creedence Clearwater Revival"
            maxLength={siteConfig.limits.artist}
            disabled={disabled}
            required
          />
          {errors.artist ? <FieldError>{errors.artist}</FieldError> : null}
        </div>

        <div>
          <label className="label" htmlFor={`${idPrefix}-key`}>
            <KeyRound className="h-3.5 w-3.5" />
            Tonalità <span className="font-normal normal-case tracking-normal text-zinc-600">(facoltativa)</span>
          </label>
          <input
            id={`${idPrefix}-key`}
            className="input"
            value={values.songKey}
            onChange={(event) => onChange({ songKey: event.target.value })}
            placeholder="Es. La minore, Do maggiore, Standard"
            maxLength={siteConfig.limits.songKey}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Altri musicisti */}
      <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              <Users className="h-3.5 w-3.5" />
              Altri musicisti <span className="font-normal normal-case tracking-normal text-zinc-600">(facoltativo)</span>
            </p>
            <p className="mt-1 text-[12px] leading-snug text-zinc-500">
              Hai già una band per questo pezzo? Aggiungi nome e strumento.
            </p>
          </div>
        </div>

        {values.members.length > 0 ? (
          <div className="mt-3 space-y-2">
            {values.members.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="input !py-2.5"
                  value={member.name}
                  onChange={(event) => updateMember(index, { name: event.target.value })}
                  placeholder={`Nome musicista ${index + 1}`}
                  maxLength={siteConfig.limits.memberName}
                  disabled={disabled}
                  aria-label={`Nome musicista ${index + 1}`}
                />
                <input
                  className="input !py-2.5"
                  value={member.instrument}
                  onChange={(event) => updateMember(index, { instrument: event.target.value })}
                  placeholder="Strumento"
                  maxLength={siteConfig.limits.memberInstrument}
                  disabled={disabled}
                  aria-label={`Strumento musicista ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="shrink-0 rounded-xl border border-white/10 p-2.5 text-zinc-500 transition hover:border-rose-400/40 hover:text-rose-300"
                  aria-label={`Rimuovi musicista ${index + 1}`}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={addMember}
          disabled={disabled || values.members.length >= siteConfig.maxMembersPerSlot}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-2 text-[12px] font-semibold text-zinc-400 transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Aggiungi musicista
        </button>
      </div>
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[12px] font-medium text-rose-300">{children}</p>
  );
}
