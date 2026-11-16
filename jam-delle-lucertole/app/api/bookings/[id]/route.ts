import {
  HttpError,
  isAdminRequest,
  jsonError,
  jsonOk,
  readJson,
} from "@/lib/http";
import {
  getStorageMode,
  mutateSlots,
  toPublicSlot,
  toPublicSlots,
} from "@/lib/store";
import type { BookingValues, SlotStatus } from "@/lib/types";
import { isStatus, validateBooking } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: { id: string } };

const CONTENT_KEYS: (keyof BookingValues)[] = [
  "name",
  "instrument",
  "instrumentDetail",
  "song",
  "artist",
  "songKey",
  "members",
];

/** PATCH /api/bookings/:id — modifica (proprietario con token, oppure regia) */
export async function PATCH(req: Request, { params }: Params) {
  const id = params.id;
  const body = await readJson(req);

  const admin = isAdminRequest(req);
  const ownerToken = (req.headers.get("x-owner-token") || "").trim();

  const wantsContent = CONTENT_KEYS.some((key) => key in body);
  const wantsStatus = "status" in body;

  if (!wantsContent && !wantsStatus) {
    return jsonError("Nessuna modifica da salvare.", 400);
  }
  if (wantsStatus && !admin) {
    return jsonError("Solo la regia può cambiare lo stato di un brano.", 403);
  }

  let values: BookingValues | undefined;
  if (wantsContent) {
    const parsed = validateBooking(body);
    if (!parsed.ok) {
      return jsonError("Controlla i campi evidenziati.", 422, parsed.errors);
    }
    values = parsed.values;
  }

  let status: SlotStatus | undefined;
  if (wantsStatus) {
    if (!isStatus(body.status)) return jsonError("Stato non valido.", 400);
    status = body.status;
  }

  try {
    const { slots, result } = await mutateSlots((list) => {
      const index = list.findIndex((slot) => slot.id === id);
      if (index === -1) throw new HttpError(404, "Prenotazione non trovata.");

      const current = list[index]!;
      if (!admin && (!ownerToken || current.ownerToken !== ownerToken)) {
        throw new HttpError(
          403,
          "Puoi modificare solo la prenotazione salvata su questo dispositivo.",
        );
      }

      const updated = {
        ...current,
        ...(values ?? {}),
        ...(status ? { status } : {}),
        updatedAt: Date.now(),
      };
      list[index] = updated;
      return updated;
    });

    return jsonOk({
      slots: toPublicSlots(slots),
      mode: getStorageMode(),
      updatedAt: Date.now(),
      updated: toPublicSlot(result),
    });
  } catch (error) {
    if (error instanceof HttpError) return jsonError(error.message, error.status);
    throw error;
  }
}

/** DELETE /api/bookings/:id — cancella (proprietario con token, oppure regia) */
export async function DELETE(req: Request, { params }: Params) {
  const id = params.id;
  const admin = isAdminRequest(req);
  const ownerToken = (req.headers.get("x-owner-token") || "").trim();

  try {
    const { slots } = await mutateSlots((list) => {
      const index = list.findIndex((slot) => slot.id === id);
      if (index === -1) throw new HttpError(404, "Prenotazione non trovata.");

      const current = list[index]!;
      if (!admin && (!ownerToken || current.ownerToken !== ownerToken)) {
        throw new HttpError(
          403,
          "Puoi cancellare solo la prenotazione salvata su questo dispositivo.",
        );
      }

      list.splice(index, 1);
      return current;
    });

    return jsonOk({
      slots: toPublicSlots(slots),
      mode: getStorageMode(),
      updatedAt: Date.now(),
    });
  } catch (error) {
    if (error instanceof HttpError) return jsonError(error.message, error.status);
    throw error;
  }
}
