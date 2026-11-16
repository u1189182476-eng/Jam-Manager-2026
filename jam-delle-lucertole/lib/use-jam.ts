"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { ApiError, jamApi } from "@/lib/api-client";
import type {
  BookingValues,
  JamMode,
  Slot,
  SlotStatus,
  SlotsResponse,
} from "@/lib/types";

/* ----------------------------------------------------------- storage locale */

const OWNERS_KEY = "jam.owners.v1";
const LAST_SUBMIT_KEY = "jam.lastSubmit.v1";
const ADMIN_KEY = "jam.adminPin.v1";

function readOwners(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(OWNERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeOwners(owners: Record<string, string>) {
  try {
    window.localStorage.setItem(OWNERS_KEY, JSON.stringify(owners));
  } catch {
    /* storage pieno o disabilitato: pazienza */
  }
}

function readNumber(key: string): number {
  try {
    return Number(window.localStorage.getItem(key) || 0) || 0;
  } catch {
    return 0;
  }
}

const POLL_MS = 4000;

/* -------------------------------------------------------------------- hook */

export type JamApi = ReturnType<typeof useJam>;

export function useJam(initialSlots: Slot[], initialMode: JamMode) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [mode, setMode] = useState<JamMode>(initialMode);
  const [owners, setOwners] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastSync, setLastSync] = useState<number>(Date.now());
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const [lastSubmit, setLastSubmit] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const pending = useRef(0);

  const applyResponse = useCallback((res: SlotsResponse) => {
    setSlots(res.slots);
    if (res.mode) setMode(res.mode);
    setLastSync(Date.now());
  }, []);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    pending.current += 1;
    setBusy(true);
    try {
      return await fn();
    } finally {
      pending.current -= 1;
      if (pending.current <= 0) {
        pending.current = 0;
        setBusy(false);
      }
    }
  }, []);

  /* -------------------------------------------------- idratazione del browser */
  useEffect(() => {
    setOwners(readOwners());
    setLastSubmit(readNumber(LAST_SUBMIT_KEY));
    setHydrated(true);

    const storedPin = (() => {
      try {
        return window.sessionStorage.getItem(ADMIN_KEY);
      } catch {
        return null;
      }
    })();

    if (storedPin) {
      jamApi
        .verifyPin(storedPin)
        .then(() => setAdminPin(storedPin))
        .catch(() => {
          try {
            window.sessionStorage.removeItem(ADMIN_KEY);
          } catch {
            /* noop */
          }
        });
    }
  }, []);

  /* --------------------------------------------------------------- refresh */
  const refresh = useCallback(
    async (silent = true) => {
      if (pending.current > 0) return;
      if (!silent) setRefreshing(true);
      try {
        const res = await jamApi.list();
        applyResponse(res);
      } catch {
        /* offline: teniamo i dati che abbiamo */
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [applyResponse],
  );

  useEffect(() => {
    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      void refresh();
    };

    const id = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, [refresh]);

  // orologio per il countdown del cooldown
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  /* ------------------------------------------------------- gruppi in scaletta */
  const onstage = useMemo(
    () => slots.filter((slot) => slot.status === "onstage"),
    [slots],
  );
  const waiting = useMemo(
    () => slots.filter((slot) => slot.status === "waiting"),
    [slots],
  );
  const played = useMemo(
    () =>
      slots
        .filter((slot) => slot.status === "played")
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [slots],
  );

  const isOwner = useCallback(
    (id: string) => Boolean(owners[id]),
    [owners],
  );

  const mySlots = useMemo(
    () => slots.filter((slot) => Boolean(owners[slot.id])),
    [slots, owners],
  );

  /* -------------------------------------------------------------- cooldown */
  const cooldownSeconds = siteConfig.bookingCooldownSeconds;
  const cooldownLeft = useMemo(() => {
    if (!lastSubmit) return 0;
    const remaining = lastSubmit + cooldownSeconds * 1000 - now;
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }, [lastSubmit, now, cooldownSeconds]);

  /* --------------------------------------------------------------- azioni */

  const create = useCallback(
    async (values: BookingValues & { website?: string }) => {
      const res = await run(() => jamApi.create(values));
      applyResponse(res);

      const nextOwners = { ...readOwners(), [res.created.id]: res.ownerToken };
      writeOwners(nextOwners);
      setOwners(nextOwners);

      const stamp = Date.now();
      setLastSubmit(stamp);
      try {
        window.localStorage.setItem(LAST_SUBMIT_KEY, String(stamp));
      } catch {
        /* noop */
      }

      return res.created;
    },
    [applyResponse, run],
  );

  const updateOwned = useCallback(
    async (id: string, values: BookingValues) => {
      const token = owners[id];
      if (!token) {
        throw new ApiError(
          "Questa prenotazione non è modificabile da questo dispositivo.",
          403,
        );
      }
      const res = await run(() => jamApi.update(id, values, { ownerToken: token }));
      applyResponse(res);
    },
    [applyResponse, owners, run],
  );

  const deleteOwned = useCallback(
    async (id: string) => {
      const token = owners[id];
      if (!token) {
        throw new ApiError(
          "Questa prenotazione non è cancellabile da questo dispositivo.",
          403,
        );
      }
      const res = await run(() => jamApi.remove(id, { ownerToken: token }));
      applyResponse(res);

      const nextOwners = { ...readOwners() };
      delete nextOwners[id];
      writeOwners(nextOwners);
      setOwners(nextOwners);
    },
    [applyResponse, owners, run],
  );

  /* ------------------------------------------------------------------ regia */

  const unlock = useCallback(async (pin: string) => {
    await jamApi.verifyPin(pin);
    setAdminPin(pin);
    try {
      window.sessionStorage.setItem(ADMIN_KEY, pin);
    } catch {
      /* noop */
    }
  }, []);

  const lock = useCallback(() => {
    setAdminPin(null);
    try {
      window.sessionStorage.removeItem(ADMIN_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const requirePin = useCallback(() => {
    if (!adminPin) throw new ApiError("Sblocca la regia con il PIN.", 401);
    return adminPin;
  }, [adminPin]);

  const adminSetStatus = useCallback(
    async (id: string, status: SlotStatus) => {
      const pin = requirePin();
      const res = await run(() => jamApi.update(id, { status }, { adminPin: pin }));
      applyResponse(res);
    },
    [applyResponse, requirePin, run],
  );

  const adminUpdate = useCallback(
    async (id: string, values: BookingValues) => {
      const pin = requirePin();
      const res = await run(() => jamApi.update(id, values, { adminPin: pin }));
      applyResponse(res);
    },
    [applyResponse, requirePin, run],
  );

  const adminDelete = useCallback(
    async (id: string) => {
      const pin = requirePin();
      const res = await run(() => jamApi.remove(id, { adminPin: pin }));
      applyResponse(res);
    },
    [applyResponse, requirePin, run],
  );

  const adminReorder = useCallback(
    async (ids: string[]) => {
      const pin = requirePin();
      // aggiornamento ottimistico: la lista si muove subito, senza attese
      setSlots((current) => {
        const byId = new Map(current.map((slot) => [slot.id, slot]));
        const ordered = ids
          .map((id) => byId.get(id))
          .filter((slot): slot is Slot => Boolean(slot));
        const rest = current.filter((slot) => !ids.includes(slot.id));
        return [...ordered, ...rest];
      });

      const res = await run(() => jamApi.reorder(ids, pin));
      applyResponse(res);
    },
    [applyResponse, requirePin, run],
  );

  const adminReset = useCallback(async () => {
    const pin = requirePin();
    const res = await run(() => jamApi.reset(pin));
    applyResponse(res);

    // le prenotazioni salvate su questo dispositivo non esistono più
    writeOwners({});
    setOwners({});
  }, [applyResponse, requirePin, run]);

  return {
    /* dati */
    slots,
    onstage,
    waiting,
    played,
    mode,
    lastSync,
    refreshing,
    busy,
    hydrated,
    /* proprietà */
    owners,
    isOwner,
    mySlots,
    /* cooldown */
    cooldownLeft,
    cooldownSeconds,
    /* regia */
    adminPin,
    isAdmin: Boolean(adminPin),
    unlock,
    lock,
    /* azioni pubbliche */
    refresh,
    create,
    updateOwned,
    deleteOwned,
    /* azioni regia */
    adminSetStatus,
    adminUpdate,
    adminDelete,
    adminReorder,
    adminReset,
  };
}
