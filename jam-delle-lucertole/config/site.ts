/**
 * ============================================================================
 *  ⚙️  CONFIGURAZIONE CENTRALE — "La Jam delle Lucertole"
 * ============================================================================
 *  Modifica SOLO questo file per cambiare titolo, sottotitolo, regole,
 *  contatti, PIN della regia e voci del menu "Strumento".
 *
 *  Nota sul PIN: in produzione è consigliato impostare la variabile
 *  d'ambiente ADMIN_PIN (vedi .env.example). Se presente, ha la precedenza
 *  sul valore scritto qui sotto.
 * ============================================================================
 */

export type Accent =
  | "amber"
  | "emerald"
  | "sky"
  | "rose"
  | "violet"
  | "orange"
  | "lime"
  | "zinc";

export type InstrumentOption = {
  /** identificatore salvato nel database (non cambiarlo a serata iniziata) */
  id: string;
  /** testo mostrato nel menu a tendina e nei badge */
  label: string;
  emoji: string;
  /** colore del badge */
  accent: Accent;
  /** se true, compare un campo libero per specificare lo strumento */
  requiresDetail?: boolean;
};

export const siteConfig = {
  /* ---------------------------------------------------------------- identità */
  eventName: "La Jam delle Lucertole",
  /** Sottotitolo breve, mostrato sotto al titolo */
  subtitle:
    "Jam session dal vivo: prenota il tuo brano, sali sul palco, suona con chi c'è.",
  /** Riga "occhiello" sopra al titolo nell'hero */
  kicker: "Open jam · Live club · Ogni giovedì",
  /** Descrizione lunga (hero + meta description SEO) */
  description:
    "La Jam delle Lucertole è la serata in cui il palco è di tutti: iscriviti in scaletta dal telefono, scegli il tuo pezzo e suona dal vivo. La scaletta si aggiorna in tempo reale.",
  /** Nome del locale / luogo */
  venue: "Circolo Delle Lucertole",
  city: "Barcellona Pozzo di Gotto",
  /** Quando si suona */
  scheduleLabel: "Sabato · ore 21:00",

  /* ------------------------------------------------------------------ regole */
  rulesTitle: "Le regole della serata",
  rules: [
    "Al massimo 5 pezzi per formazione, con precedenza agli inediti .",
    "Prenota dal telefono: la scaletta è live, così la regia sa sempre chi c'è.",
    "Batteria, microfonie amplificatori sono sul palco: portare i propri strumenti personali, le bacchette ed i piatti della batteria.",
    "La regia chiama il nome prima del tuo: resta vicino al palco e fatti trovare.",
  ],
  rulesFootnote:
    "Non ti senti pronto? Vieni ad ascoltare: la prossima settimana il palco è ancora tuo.",

  /* ---------------------------------------------------------------- contatti */
  contacts: {
    instagram: "@lajamdellelucertole",
    email: "ciao@lajamdellelucertole.it",
  },
  /** Testo del footer */
  footerNote: "Tanta voglia di suonare.",

  /* ------------------------------------------------------------ regia / admin */
  /** PIN numerico della regia (default). In produzione usa la env ADMIN_PIN. */
  adminPin: "6666",
  adminLabel: "Regia / Admin",

  /* --------------------------------------------------------------- prenotazioni */
  /** Secondi di attesa tra due invii dallo stesso dispositivo (anti-spam) */
  bookingCooldownSeconds: 30,
  /** Secondi di cooldown lato server per IP (protezione anti-spam) */
  serverCooldownSeconds: 10,
  /** Numero massimo di musicisti aggiuntivi per prenotazione */
  maxMembersPerSlot: 6,
  /** Lunghezze massime (usate anche dalla validazione server) */
  limits: {
    name: 60,
    song: 90,
    artist: 90,
    songKey: 40,
    memberName: 60,
    memberInstrument: 40,
    instrumentDetail: 40,
  },

  /* ---------------------------------------------------------------- strumenti */
  instruments: [
    { id: "voce", label: "Voce", emoji: "🎤", accent: "amber" },
    { id: "chitarra-elettrica", label: "Chitarra Elettrica", emoji: "🎸", accent: "orange" },
    { id: "chitarra-acustica", label: "Chitarra Acustica", emoji: "🪕", accent: "lime" },
    { id: "basso", label: "Basso", emoji: "🎵", accent: "sky" },
    { id: "batteria", label: "Batteria", emoji: "🥁", accent: "rose" },
    { id: "tastiere", label: "Tastiere / Piano", emoji: "🎹", accent: "violet" },
    { id: "fiati", label: "Fiati (sax, tromba, …)", emoji: "🎷", accent: "emerald" },
    {
      id: "altro",
      label: "Altro",
      emoji: "✨",
      accent: "zinc",
      requiresDetail: true,
    },
  ] as InstrumentOption[],

  /* ------------------------------------------------------------------- testi UI */
  ui: {
    bookCta: "Prenota il tuo brano",
    bookCtaShort: "Prenota",
    onStageTitle: "Sul Palco Ora",
    onStageEmpty: "Il palco è libero: apri le danze tu!",
    nextTitle: "Prossimi in Scaletta",
    nextEmpty: "Nessuno in coda… per ora. Il prossimo in scaletta puoi essere tu.",
    playedTitle: "Già Suonati",
    bookedTitle: "Prenotato!",
    bookedBody: "Puoi modificarla o cancellarla da qui, senza login: resta legata a questo dispositivo.",
    formTitle: "Prenotati in scaletta",
    formSubtitle: "Niente registrazioni: compila, invia e sali sul palco.",
  },
};

export type SiteConfigType = typeof siteConfig;

/** Helper: trova un'opzione strumento per id (fallback: "Altro"). */
export function findInstrument(id: string | undefined | null): InstrumentOption {
  const list = siteConfig.instruments;
  return list.find((i) => i.id === id) ?? list[list.length - 1];
}
