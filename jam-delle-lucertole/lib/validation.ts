import { siteConfig } from "@/config/site";
import type { BookingValues, Member, SlotStatus } from "@/lib/types";

export const STATUSES: SlotStatus[] = ["waiting", "onstage", "played"];

export function isStatus(value: unknown): value is SlotStatus {
  return typeof value === "string" && (STATUSES as string[]).includes(value);
}

/** Normalizza una stringa: trim, spazi multipli, caratteri di controllo, lunghezza. */
export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export type ValidationResult =
  | { ok: true; values: BookingValues }
  | { ok: false; errors: Record<string, string> };

const instrumentIds = siteConfig.instruments.map((i) => i.id);

/** Validazione condivisa fra API e client (il server è la fonte di verità). */
export function validateBooking(raw: unknown): ValidationResult {
  const errors: Record<string, string> = {};
  const input = (raw ?? {}) as Record<string, unknown>;
  const limits = siteConfig.limits;

  const name = cleanText(input.name, limits.name);
  if (name.length < 2) {
    errors.name = "Scrivi nome e cognome (almeno 2 caratteri).";
  }

  const instrument = cleanText(input.instrument, 40);
  if (!instrument) {
    errors.instrument = "Scegli il tuo strumento.";
  } else if (!instrumentIds.includes(instrument)) {
    errors.instrument = "Strumento non valido.";
  }

  const option = siteConfig.instruments.find((i) => i.id === instrument);
  const instrumentDetail = cleanText(input.instrumentDetail, limits.instrumentDetail);
  if (option?.requiresDetail && instrumentDetail.length < 2) {
    errors.instrumentDetail = "Specifica quale strumento suoni.";
  }

  const song = cleanText(input.song, limits.song);
  if (song.length < 1) {
    errors.song = "Indica il titolo del brano.";
  }

  const artist = cleanText(input.artist, limits.artist);
  if (artist.length < 1) {
    errors.artist = "Indica l'artista o la band.";
  }

  const songKey = cleanText(input.songKey, limits.songKey);

  // --- altri musicisti -------------------------------------------------------
  const rawMembers = Array.isArray(input.members) ? input.members : [];
  const members: Member[] = [];

  for (const row of rawMembers) {
    let memberName = "";
    let memberInstrument = "";

    if (typeof row === "string") {
      const [n, ...rest] = row.split(/\s*[-–|]\s*/);
      memberName = cleanText(n, limits.memberName);
      memberInstrument = cleanText(rest.join(" - "), limits.memberInstrument);
    } else if (row && typeof row === "object") {
      const obj = row as Record<string, unknown>;
      memberName = cleanText(obj.name, limits.memberName);
      memberInstrument = cleanText(obj.instrument, limits.memberInstrument);
    }

    if (!memberName) continue;
    members.push({
      name: memberName,
      instrument: memberInstrument || "Strumento non indicato",
    });
    if (members.length >= siteConfig.maxMembersPerSlot) break;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    values: {
      name,
      instrument,
      instrumentDetail: option?.requiresDetail ? instrumentDetail : undefined,
      song,
      artist,
      songKey: songKey || undefined,
      members,
    },
  };
}
