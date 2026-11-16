import { isAdminRequest, jsonError, jsonOk, readJson } from "@/lib/http";
import { getStorageMode, mutateSlots, toPublicSlots } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/bookings/reorder — body: { ids: string[] }
 * Riordina la scaletta secondo l'array di id ricevuto (solo regia).
 */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return jsonError("PIN regia non valido o assente.", 401);
  }

  const body = await readJson(req);
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((id): id is string => typeof id === "string")
    : [];

  if (ids.length === 0) {
    return jsonError("Nessun ordine ricevuto.", 400);
  }

  const { slots } = await mutateSlots((list) => {
    const byId = new Map(list.map((slot) => [slot.id, slot]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((slot): slot is NonNullable<typeof slot> => Boolean(slot));

    // eventuali elementi non presenti nella lista inviata restano in coda
    const leftovers = list.filter((slot) => !ids.includes(slot.id));

    list.splice(0, list.length, ...ordered, ...leftovers);
    return list.length;
  });

  return jsonOk({
    slots: toPublicSlots(slots),
    mode: getStorageMode(),
    updatedAt: Date.now(),
  });
}
