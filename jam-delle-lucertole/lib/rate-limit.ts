/**
 * Anti-spam leggero lato server: cooldown per IP + tetto orario.
 * Vive in memoria: sufficiente per una jam session (Vercel serverless può
 * avere più istanze, quindi è una protezione "soft", non una garanzia).
 */

import { siteConfig } from "@/config/site";

type Bucket = { last: number; hits: number[] };

type Store = typeof globalThis & { __jamLimits?: Map<string, Bucket> };

const HOUR = 60 * 60 * 1000;
const MAX_PER_HOUR = 24;

function buckets(): Map<string, Bucket> {
  const g = globalThis as Store;
  if (!g.__jamLimits) g.__jamLimits = new Map();
  return g.__jamLimits;
}

export type CooldownResult =
  | { ok: true }
  | { ok: false; retryAfter: number; reason: "cooldown" | "too-many" };

export function checkBookingRate(ip: string): CooldownResult {
  const cooldownMs = Math.max(3, siteConfig.serverCooldownSeconds) * 1000;
  const now = Date.now();
  const map = buckets();
  const bucket = map.get(ip) ?? { last: 0, hits: [] };

  bucket.hits = bucket.hits.filter((ts) => now - ts < HOUR);

  if (bucket.hits.length >= MAX_PER_HOUR) {
    map.set(ip, bucket);
    return { ok: false, retryAfter: 600, reason: "too-many" };
  }

  const elapsed = now - bucket.last;
  if (bucket.last && elapsed < cooldownMs) {
    map.set(ip, bucket);
    return {
      ok: false,
      retryAfter: Math.ceil((cooldownMs - elapsed) / 1000),
      reason: "cooldown",
    };
  }

  bucket.last = now;
  bucket.hits.push(now);
  map.set(ip, bucket);
  return { ok: true };
}
