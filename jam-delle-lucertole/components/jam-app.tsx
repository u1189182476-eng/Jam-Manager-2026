"use client";

import { CheckCircle2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminPanel } from "@/components/admin-panel";
import { AdminPinModal } from "@/components/admin-pin-modal";
import { BookingForm } from "@/components/booking-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EditDialog } from "@/components/edit-dialog";
import { Hero } from "@/components/hero";
import { OnStageSection } from "@/components/on-stage-section";
import { RulesCard } from "@/components/rules-card";
import { NextUpSection, PlayedSection } from "@/components/setlist";
import { SiteFooter } from "@/components/site-footer";
import { useJam } from "@/lib/use-jam";
import type { BookingValues, JamMode, Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

type EditingState = { slot: Slot; context: "owner" | "admin" } | null;
type ConfirmState = { slot: Slot; action: "owner" | "admin" } | null;

export function JamApp({
  initialSlots,
  initialMode,
}: {
  initialSlots: Slot[];
  initialMode: JamMode;
}) {
  const jam = useJam(initialSlots, initialMode);

  const [pinOpen, setPinOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "error" } | null>(
    null,
  );

  const toastTimer = useRef<number | null>(null);
  const notify = useCallback((message: string, tone: "ok" | "error" = "ok") => {
    setToast({ message, tone });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const liveSlot = editing ? jam.slots.find((s) => s.id === editing.slot.id) ?? editing.slot : null;

  /* ------------------------------------------------------------- azioni */

  const openAdmin = () => {
    if (jam.isAdmin) setAdminOpen(true);
    else setPinOpen(true);
  };

  const handleUnlock = async (pin: string) => {
    await jam.unlock(pin);
    setAdminOpen(true);
    notify("Regia sbloccata. Buona serata!");
  };

  const handleCreate = async (values: BookingValues & { website?: string }) => {
    const created = await jam.create(values);
    notify(`"${created.song}" è in scaletta!`);
    return created;
  };

  const handleSaveEdit = async (values: BookingValues) => {
    if (!editing) return;
    if (editing.context === "admin") {
      await jam.adminUpdate(editing.slot.id, values);
      notify("Prenotazione aggiornata (regia).");
    } else {
      await jam.updateOwned(editing.slot.id, values);
      notify("Prenotazione aggiornata.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.action === "admin") {
        await jam.adminDelete(confirm.slot.id);
      } else {
        await jam.deleteOwned(confirm.slot.id);
      }
      setConfirm(null);
      notify("Prenotazione cancellata.");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Non sono riuscito a cancellare.",
        "error",
      );
    }
  };

  const handleReset = async () => {
    await jam.adminReset();
    notify("Scaletta svuotata. Si riparte!");
  };

  const actions = {
    isOwner: jam.isOwner,
    onEdit: (slot: Slot) => setEditing({ slot, context: "owner" }),
    onRequestDelete: (slot: Slot) => setConfirm({ slot, action: "owner" }),
  };

  /* --------------------------------------------------------------- vista */

  return (
    <>
      <Hero
        waitingCount={jam.waiting.length}
        onstageCount={jam.onstage.length}
        playedCount={jam.played.length}
      />

      <main className="container-page py-7 sm:py-10">
        <div className="space-y-8">
          <OnStageSection
            slots={jam.onstage}
            isOwner={jam.isOwner}
            onEdit={(slot) => setEditing({ slot, context: "owner" })}
            onRequestDelete={(slot) => setConfirm({ slot, action: "owner" })}
          />

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <div className="order-2 space-y-6 lg:order-1">
              <NextUpSection slots={jam.waiting} actions={actions} />
              <PlayedSection slots={jam.played} actions={actions} />
            </div>

            <div className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-20">
              <BookingForm
                onSubmit={handleCreate}
                onEditOwned={(slot) => setEditing({ slot, context: "owner" })}
                onRequestDelete={(slot) => setConfirm({ slot, action: "owner" })}
                mySlots={jam.mySlots}
                cooldownLeft={jam.cooldownLeft}
                mode={jam.mode}
              />
              <RulesCard />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter
        mode={jam.mode}
        isAdmin={jam.isAdmin}
        onOpenAdmin={openAdmin}
      />

      {/* ----------------------------------------------------------- modali */}
      <AdminPinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onUnlock={handleUnlock}
      />

      <AdminPanel
        open={adminOpen && jam.isAdmin}
        onClose={() => setAdminOpen(false)}
        slots={jam.slots}
        busy={jam.busy}
        lastSync={jam.lastSync}
        onSetStatus={jam.adminSetStatus}
        onReorder={jam.adminReorder}
        onReset={handleReset}
        onEdit={(slot) => setEditing({ slot, context: "admin" })}
        onDelete={(slot) => setConfirm({ slot, action: "admin" })}
        onLock={() => {
          jam.lock();
          setAdminOpen(false);
          notify("Regia bloccata.", "ok");
        }}
        onRefresh={() => void jam.refresh(false)}
      />

      <EditDialog
        key={editing?.slot.id ?? "none"}
        slot={liveSlot}
        context={editing?.context ?? "owner"}
        onClose={() => setEditing(null)}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Cancellare la prenotazione?"
        message={
          confirm
            ? `"${confirm.slot.song}" di ${confirm.slot.artist} (${confirm.slot.name}) verrà rimossa dalla scaletta. L'operazione non si può annullare.`
            : ""
        }
        confirmLabel="Sì, cancella"
        busy={jam.busy}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setConfirm(null)}
      />

      {/* ------------------------------------------------------------- toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4"
        >
          <div
            className={cn(
              "pointer-events-auto flex max-w-md items-center gap-2 rounded-2xl border px-4 py-3 text-[13px] font-semibold shadow-2xl backdrop-blur-md animate-fade-up",
              toast.tone === "ok"
                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                : "border-rose-400/30 bg-rose-500/15 text-rose-100",
            )}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Chiudi notifica"
              className="rounded-md p-0.5 opacity-70 transition hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
