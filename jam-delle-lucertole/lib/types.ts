export type SlotStatus = "waiting" | "onstage" | "played";

export type Member = {
  name: string;
  instrument: string;
};

/** Prenotazione così com'è mostrata al pubblico (senza token di proprietà). */
export type Slot = {
  id: string;
  name: string;
  instrument: string;
  /** specifica libera quando lo strumento è "Altro" */
  instrumentDetail?: string;
  song: string;
  artist: string;
  /** tonalità, es. "La minore" / "Standard" */
  songKey?: string;
  members: Member[];
  status: SlotStatus;
  order: number;
  createdAt: number;
  updatedAt: number;
};

/** Prenotazione salvata nello store: contiene anche il token del proprietario. */
export type StoredSlot = Slot & {
  ownerToken: string;
};

export type StoredSlotPublic = Slot;

export type BookingValues = {
  name: string;
  instrument: string;
  instrumentDetail?: string;
  song: string;
  artist: string;
  songKey?: string;
  members: Member[];
};

export type JamMode = "redis" | "memory";

export type SlotsResponse = {
  slots: Slot[];
  mode: JamMode;
  updatedAt: number;
};

export type ApiError = {
  error: string;
  fields?: Record<string, string>;
};
