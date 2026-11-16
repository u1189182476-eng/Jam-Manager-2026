import { randomUUID } from "node:crypto";
import { siteConfig } from "@/config/site";
import {
  getClientIp,
  jsonError,
  jsonOk,
  readJson,
} from "@/lib/http";
import { checkBookingRate } from "@/lib/rate-limit";
import {
  getStorageMode,
  listSlots,
  mutateSlots,
  toPublicSlot,
  toPublicSlots,
} from "@/lib/store";
import type { StoredSlot } from "@/lib/types";
import { cleanText, validateBooking } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/bookings — scaletta completa (senza token privati) */
export async function GET() {
  const slots = await listSlots();
  return jsonOk({
    slots: toPublicSlots(slots),
    mode: getStorageMode(),
    updatedAt: Date.now(),
  });
}

/** POST /api/bookings — nuova prenotazione (nessun login) */
export async function POST(req: Request) {
  const body = await readJson(req);

  // 1) honeypot: se il campo nascosto è compilato, è quasi certamente un bot
  if (cleanText(body.website, 120).length > 0) {
    return jsonError("Richiesta non valida.", 400);
  }

  // 2) validazione (prima del cooldown: un errore non deve "bruciare" l'attesa)
  const parsed = validateBooking(body);
  if (!parsed.ok) {
    return jsonError("Controlla i campi evidenziati.", 422, parsed.errors);
  }

  // 3) cooldown per IP (anti-spam leggero)
  const rate = checkBookingRate(getClientIp(req));
  if (!rate.ok) {
    const message =
      rate.reason === "too-many"
        ? "Hai fatto troppe prenotazioni da questo dispositivo. Riprova più tardi o chiedi in regia."
        : `Aspetta ${rate.retryAfter} second${rate.retryAfter === 1 ? "o" : "i"} prima di inviare un'altra prenotazione.`;
    return jsonError(message, 429);
  }

  const ownerToken = randomUUID();
  const now = Date.now();

  const { slots, result } = await mutateSlots((list) => {
    const slot: StoredSlot = {
      id: randomUUID(),
      ...parsed.values,
      status: "waiting",
      order: list.length,
      createdAt: now,
      updatedAt: now,
      ownerToken,
    };
    list.push(slot);
    return slot;
  });

  return jsonOk(
    {
      slots: toPublicSlots(slots),
      mode: getStorageMode(),
      updatedAt: now,
      ownerToken,
      created: toPublicSlot(result),
      cooldownSeconds: siteConfig.bookingCooldownSeconds,
    },
    201,
  );
}
