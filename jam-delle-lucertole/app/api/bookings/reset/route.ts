import { isAdminRequest, jsonError, jsonOk, readJson } from "@/lib/http";
import { getStorageMode, mutateSlots, toPublicSlots } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/bookings/reset — body: { confirm: true }
 * Svuota tutta la scaletta (fine serata). Solo regia.
 */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return jsonError("PIN regia non valido o assente.", 401);
  }

  const body = await readJson(req);
  if (body.confirm !== true) {
    return jsonError("Conferma richiesta per svuotare la scaletta.", 400);
  }

  const { slots } = await mutateSlots((list) => {
    list.splice(0, list.length);
    return 0;
  });

  return jsonOk({
    slots: toPublicSlots(slots),
    mode: getStorageMode(),
    updatedAt: Date.now(),
  });
}
