"use client";

import { AlertTriangle, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingFields } from "@/components/booking-fields";
import { Modal } from "@/components/modal";
import { ApiError } from "@/lib/api-client";
import {
  emptyForm,
  formFromSlot,
  toBookingValues,
  validateForm,
  type FormValues,
} from "@/lib/booking-form";
import type { BookingValues, Slot } from "@/lib/types";

export function EditDialog({
  slot,
  context,
  onClose,
  onSave,
}: {
  slot: Slot | null;
  context: "owner" | "admin";
  onClose: () => void;
  onSave: (values: BookingValues) => Promise<void>;
}) {
  const [values, setValues] = useState<FormValues>(() =>
    slot ? formFromSlot(slot) : emptyForm(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slot) {
      setValues(formFromSlot(slot));
      setErrors({});
      setError(null);
    }
  }, [slot]);

  if (!slot) return null;

  const patch = (next: Partial<FormValues>) => {
    setValues((current) => ({ ...current, ...next }));
    setErrors((current) => {
      if (Object.keys(current).length === 0) return current;
      const cleaned = { ...current };
      Object.keys(next).forEach((key) => delete cleaned[key]);
      return cleaned;
    });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const clientErrors = validateForm(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      setError("Controlla i campi evidenziati.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave(toBookingValues(values));
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fields) setErrors(err.fields);
      } else {
        setError("Non sono riuscito a salvare. Riprova.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(slot)}
      onClose={onClose}
      title="Modifica prenotazione"
      description={
        context === "admin"
          ? "Stai modificando come regia: puoi cambiare qualsiasi campo."
          : "Puoi correggere i tuoi dati quando vuoi, dal tuo telefono."
      }
      size="lg"
    >
      <form onSubmit={handleSave} noValidate className="space-y-4 px-5 py-4">
        <BookingFields
          values={values}
          errors={errors}
          onChange={patch}
          disabled={submitting}
          idPrefix={`edit-${slot.id}`}
        />

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-white/[0.07] pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost order-2 sm:order-1"
            disabled={submitting}
          >
            Annulla
          </button>
          <button type="submit" className="btn-primary order-1 sm:order-2" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvo…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salva modifiche
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
