/**
 * ============================================================================
 *  STORE — unico punto di accesso ai dati (solo server-side)
 * ============================================================================
 *  • Se sono configurate le variabili di Upstash Redis / Vercel KV
 *    (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, oppure
 *    KV_REST_API_URL + KV_REST_API_TOKEN) usa il database cloud.
 *  • Altrimenti usa una memoria di processo con dati di esempio,
 *    così l'app funziona immediatamente anche senza database.
 *
 *  Tutta la scaletta è salvata come un unico documento JSON:
 *  semplice, atomico e più che sufficiente per una jam session.
 * ============================================================================
 */

import { seedSlots } from "@/lib/seed";
import type { Slot, StoredSlot } from "@/lib/types";

const STORAGE_KEY = process.env.JAM_STORAGE_KEY || "jam-delle-lucertole:slots:v1";

/* -------------------------------------------------------------------------- */
/*                              Redis (Upstash REST)                          */
/* -------------------------------------------------------------------------- */

type RedisConfig = { url: string; token: string };

function redisConfig(): RedisConfig | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
  if (!url.trim() || !token.trim()) return null;
  return { url: url.trim().replace(/\/+$/, ""), token: token.trim() };
}

export function getStorageMode(): "redis" | "memory" {
  return redisConfig() ? "redis" : "memory";
}

async function redisCommand<T>(args: (string | number)[]): Promise<T> {
  const cfg = redisConfig();
  if (!cfg) throw new Error("Redis non configurato");

  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Redis error ${res.status}: ${await res.text()}`);
  }

  const payload = (await res.json()) as { result?: T; error?: string };
  if (payload.error) throw new Error(payload.error);
  return payload.result as T;
}

/* -------------------------------------------------------------------------- */
/*                             Memoria di processo                            */
/* -------------------------------------------------------------------------- */

type MemoryGlobal = typeof globalThis & {
  __jamMemory?: StoredSlot[] | null;
};

function memorySlots(): StoredSlot[] {
  const g = globalThis as MemoryGlobal;
  if (!g.__jamMemory) g.__jamMemory = seedSlots();
  return g.__jamMemory;
}

/* -------------------------------------------------------------------------- */
/*                          Lettura / scrittura base                          */
/* -------------------------------------------------------------------------- */

async function readSlots(): Promise<StoredSlot[]> {
  if (!redisConfig()) {
    return structuredClone(memorySlots());
  }

  const raw = await redisCommand<string | null>(["GET", STORAGE_KEY]);
  if (!raw) {
    // primo avvio su un database vuoto: carico i dati di esempio
    const seeded = seedSlots();
    await writeSlots(seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as StoredSlot[];
  } catch {
    // documento corrotto: non buttiamo via nulla, ripartiamo puliti
  }
  return [];
}

async function writeSlots(slots: StoredSlot[]): Promise<void> {
  if (!redisConfig()) {
    const g = globalThis as MemoryGlobal;
    g.__jamMemory = slots;
    return;
  }
  await redisCommand(["SET", STORAGE_KEY, JSON.stringify(slots)]);
}

/* -------------------------------------------------------------------------- */
/*                          Lock per read-modify-write                        */
/* -------------------------------------------------------------------------- */

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/* -------------------------------------------------------------------------- */
/*                                API pubblica                                */
/* -------------------------------------------------------------------------- */

/** Rimuove i campi privati (token del proprietario) prima di inviare al client. */
export function toPublicSlot(slot: StoredSlot): Slot {
  const { ownerToken: _ownerToken, ...rest } = slot;
  return rest;
}

export function toPublicSlots(slots: StoredSlot[]): Slot[] {
  return slots.map(toPublicSlot);
}

/** Legge tutta la scaletta (ordinata per `order`). */
export async function listSlots(): Promise<StoredSlot[]> {
  const slots = await readSlots();
  return [...slots].sort((a, b) => a.order - b.order);
}

/**
 * Esegue una modifica atomica sulla scaletta.
 * `fn` riceve l'array (può modificarlo o restituire un risultato);
 * se lancia un'eccezione la scrittura viene annullata.
 */
export async function mutateSlots<T>(
  fn: (slots: StoredSlot[]) => T,
): Promise<{ slots: StoredSlot[]; result: T }> {
  return withLock(async () => {
    const slots = await readSlots();
    const result = fn(slots);

    // riallineo l'indice d'ordine e salvo
    const normalized = slots.map((slot, index) => ({ ...slot, order: index }));
    await writeSlots(normalized);

    return { slots: normalized, result };
  });
}
