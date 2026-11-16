import { siteConfig } from "@/config/site";
import type { BookingValues, Slot } from "@/lib/types";

export type FormMember = { name: string; instrument: string };

export type FormValues = {
  name: string;
  instrument: string;
  instrumentDetail: string;
  song: string;
  artist: string;
  songKey: string;
  members: FormMember[];
};

export function emptyForm(): FormValues {
  return {
    name: "",
    instrument: "",
    instrumentDetail: "",
    song: "",
    artist: "",
    songKey: "",
    members: [],
  };
}

export function formFromSlot(slot: Slot): FormValues {
  return {
    name: slot.name,
    instrument: slot.instrument,
    instrumentDetail: slot.instrumentDetail ?? "",
    song: slot.song,
    artist: slot.artist,
    songKey: slot.songKey ?? "",
    members: slot.members.map((member) => ({
      name: member.name,
      instrument: member.instrument === "Strumento non indicato" ? "" : member.instrument,
    })),
  };
}

export function instrumentNeedsDetail(instrument: string): boolean {
  return Boolean(
    siteConfig.instruments.find((option) => option.id === instrument)?.requiresDetail,
  );
}

/** Form → payload per l'API (stringhe pulite, righe vuote rimosse). */
export function toBookingValues(values: FormValues): BookingValues {
  const members = values.members
    .map((member) => ({
      name: member.name.trim(),
      instrument: member.instrument.trim(),
    }))
    .filter((member) => member.name.length > 0)
    .slice(0, siteConfig.maxMembersPerSlot)
    .map((member) => ({
      name: member.name,
      instrument: member.instrument || "Strumento non indicato",
    }));

  return {
    name: values.name.trim(),
    instrument: values.instrument,
    instrumentDetail: instrumentNeedsDetail(values.instrument)
      ? values.instrumentDetail.trim()
      : undefined,
    song: values.song.trim(),
    artist: values.artist.trim(),
    songKey: values.songKey.trim() || undefined,
    members,
  };
}

/** Controlli immediati lato client (il server rivalida comunque). */
export function validateForm(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (values.name.trim().length < 2) {
    errors.name = "Scrivi nome e cognome (almeno 2 caratteri).";
  }
  if (!values.instrument) {
    errors.instrument = "Scegli il tuo strumento.";
  }
  if (instrumentNeedsDetail(values.instrument) && values.instrumentDetail.trim().length < 2) {
    errors.instrumentDetail = "Specifica quale strumento suoni.";
  }
  if (values.song.trim().length < 1) {
    errors.song = "Indica il titolo del brano.";
  }
  if (values.artist.trim().length < 1) {
    errors.artist = "Indica l'artista o la band.";
  }

  return errors;
}
