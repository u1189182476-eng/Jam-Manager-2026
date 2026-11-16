# 🦎 La Jam delle Lucertole

Web app per gestire **scaletta e prenotazioni di una jam session dal vivo**.
Zero login per i musicisti: si apre il link, si prenota il brano e la scaletta si aggiorna
in tempo reale per tutti. La regia ha un pannello protetto da PIN per riordinare, cambiare
stato dei brani e svuotare la serata.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Lucide React**.

---

## 1. Avvio rapido (30 secondi)

```bash
npm install
npm run dev
```

Apri <http://localhost:3000>.

Funziona **subito, senza database**: se non ci sono variabili d'ambiente l'app parte in
*modalità memoria* con una scaletta di esempio già pronta. In footer (e nella card del
form) vedrai il badge **“Demo: dati in memoria”**.

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | sviluppo su http://localhost:3000 |
| `npm run build` | build di produzione |
| `npm start` | avvia la build di produzione |
| `npm run typecheck` | controllo dei tipi TypeScript |

---

## 2. Personalizzazione: un solo file

Tutto quello che serve per cambiare l'identità della serata sta in **`config/site.ts`**:

```ts
export const siteConfig = {
  eventName: "La Jam delle Lucertole",   // titolo
  subtitle: "Jam session dal vivo: …",   // sottotitolo
  kicker: "Open jam · Live club · Ogni giovedì",
  venue: "Circolo La Lucertola",
  city: "Catania",
  scheduleLabel: "Giovedì · ore 21:30 · ingresso libero",
  rules: ["Un brano a testa…", "Niente playback…", /* … */],
  adminPin: "1234",                      // PIN della regia (default)
  bookingCooldownSeconds: 30,            // attesa anti-spam sul dispositivo
  serverCooldownSeconds: 10,             // attesa anti-spam per IP (server)
  instruments: [                         // voci del menu "Strumento"
    { id: "voce", label: "Voce", emoji: "🎤", accent: "amber" },
    // …
    { id: "altro", label: "Altro", emoji: "✨", accent: "zinc", requiresDetail: true },
  ],
  ui: { /* testi delle sezioni: "Sul Palco Ora", "Prossimi in Scaletta", … */ },
};
```

> ⚠️ Cambia `adminPin` prima di usarla dal vivo, oppure (meglio) imposta la variabile
> d'ambiente `ADMIN_PIN`: se presente ha la precedenza sul valore nel file di config.

---

## 3. Struttura del progetto

```
la-jam-delle-lucertole/
├── app/
│   ├── layout.tsx                  # metadata, viewport, favicon, dark mode
│   ├── globals.css                 # Tailwind + stili base (tema scuro, ambra/smeraldo)
│   ├── page.tsx                    # pagina pubblica (Server Component, dati iniziali)
│   └── api/
│       ├── bookings/route.ts           # GET scaletta · POST nuova prenotazione
│       ├── bookings/[id]/route.ts      # PATCH modifica · DELETE cancella
│       ├── bookings/reorder/route.ts   # POST riordino (regia)
│       ├── bookings/reset/route.ts     # POST svuota scaletta (regia)
│       └── admin/verify/route.ts       # POST verifica PIN regia
├── components/
│   ├── jam-app.tsx                 # orchestratore client: stato, modali, toast
│   ├── site-header.tsx             # header sticky con CTA "Prenota"
│   ├── hero.tsx                    # hero + contatori in tempo reale
│   ├── on-stage-section.tsx        # "Sul Palco Ora" (card grande)
│   ├── setlist.tsx                 # "Prossimi in Scaletta" + "Già Suonati"
│   ├── booking-form.tsx            # form pubblico (zero login)
│   ├── booking-fields.tsx          # campi condivisi tra creazione e modifica
│   ├── edit-dialog.tsx             # modifica prenotazione (proprietario o regia)
│   ├── confirm-dialog.tsx          # conferme di cancellazione
│   ├── admin-pin-modal.tsx         # tastierino numerico per il PIN
│   ├── admin-panel.tsx             # pannello regia (drag & drop, stati, reset)
│   ├── rules-card.tsx              # regole della serata
│   ├── site-footer.tsx             # contatti + pulsante "Regia / Admin"
│   ├── instrument-badge.tsx        # badge colorati per strumento
│   ├── modal.tsx                   # guscio modale (ESC, scroll lock)
│   ├── equalizer.tsx, logo.tsx     # dettagli grafici
├── config/
│   └── site.ts                     # ⚙️ TUTTA LA CONFIGURAZIONE QUI
├── lib/
│   ├── types.ts                    # tipi condivisi (Slot, BookingValues, …)
│   ├── store.ts                    # store: Upstash Redis/KV oppure memoria
│   ├── seed.ts                     # dati di esempio
│   ├── api-client.ts               # chiamate HTTP dal browser
│   ├── use-jam.ts                  # hook: polling, localStorage, azioni regia
│   ├── validation.ts               # validazione condivisa (server autoritativo)
│   ├── booking-form.ts             # stato del form e mapping verso l'API
│   ├── rate-limit.ts               # cooldown per IP + tetto orario
│   ├── http.ts                     # helper risposte, PIN, IP client
│   ├── ui.ts                       # palette badge/stati
│   └── utils.ts, clsx.ts           # utility (cn, date, iniziali…)
├── public/hero-jam.jpg             # foto di sfondo dell'hero
├── .env.example                    # variabili per il database e il PIN
├── tailwind.config.ts
└── README.md
```

---

## 4. Come funziona (in breve)

### Prenotazione senza login
- Il form è la prima cosa utile della pagina: **nessuna registrazione**.
- Campi: nome e cognome, strumento (con campo libero su “Altro”), titolo + artista,
  tonalità (facoltativa), altri musicisti (righe *nome + strumento*, fino a 6).
- Anti-spam leggero e non invasivo:
  - campo esca invisibile (honeypot) contro i bot;
  - cooldown di **30 s sul dispositivo** (countdown sul pulsante) e **10 s per IP** sul server;
  - massimo 24 prenotazioni/ora per IP;
  - validazione doppia (client + server, il server è la fonte di verità).

### “Sono io, lascia che corregga”
- Alla creazione il server restituisce un **token privato** che il browser salva in
  `localStorage` (chiave `jam.owners.v1`, mappa `id → token`).
- Chi ha quel token vede i pulsanti **Modifica / Cancella** solo sulle proprie
  prenotazioni (badge “tua”). Nessun account, nessuna password: se cambi telefono, la
  regia può sempre sistemare tutto dal pannello.

### Scaletta in tempo reale
- Polling ogni 4 s (in pausa quando la scheda è nascosta) + refresh su focus/online.
- Tre blocchi: **Sul Palco Ora** (card grande con equalizzatore animato),
  **Prossimi in Scaletta** (lista numerata con badge strumento, tonalità e musicisti),
  **Già Suonati** (sezione comprimibile).

### Regia protetta da PIN
- Pulsante discreto nel footer → modale con tastierino numerico (funziona anche la
  tastiera fisica) → PIN verificato **sul server** (`POST /api/admin/verify`).
- Nel pannello: contatori, **drag & drop** (desktop) **o frecce su/giù** (mobile),
  cambio stato *In attesa / Sul palco / Suonato*, modifica ed eliminazione di qualsiasi
  prenotazione, **svuota scaletta** con doppia conferma.
- Il PIN resta valido per la sessione del browser (`sessionStorage`); “Esci” lo blocca.

---

## 5. Database su Vercel (opzionale ma consigliato)

L'app usa **Upstash Redis** (free tier, perfetto per Vercel) tramite API REST: nessuna
dipendenza npm extra. In alternativa funzionano anche le variabili di **Vercel KV**.

### Passo passo con Upstash
1. Crea un database gratuito su <https://console.upstash.com>.
2. Nella tab **REST API** copia `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
3. In locale crea `.env.local` (parti da `.env.example`) e incolla i valori.
4. Su Vercel: **Project → Settings → Environment Variables**, aggiungi le stesse
   variabili (e `ADMIN_PIN`) per *Production/Preview/Development*, poi redeploy.

```bash
# .env.local
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxx..."
ADMIN_PIN="7391"
```

Quando le variabili sono presenti il badge in footer diventa
**“Dati sincronizzati sul cloud”** e i dati restano anche dopo i riavvii.

> Se il database è vuoto, al primo accesso viene caricata automaticamente la scaletta di
> esempio. Dopo un “Svuota scaletta” il database resta vuoto (nessun reseed indesiderato).

### Deploy su Vercel
1. Push del repository su GitHub.
2. **Add New Project** su Vercel → importa il repo (framework rilevato: Next.js).
3. Aggiungi le variabili d'ambiente e premi **Deploy**. Nessun'altra configurazione.

---

## 6. API (tutte JSON, `cache: no-store`)

| Metodo | Endpoint | Chi | Descrizione |
| --- | --- | --- | --- |
| `GET` | `/api/bookings` | tutti | scaletta completa + `mode` (`redis`/`memory`) |
| `POST` | `/api/bookings` | tutti | nuova prenotazione → restituisce `ownerToken` |
| `PATCH` | `/api/bookings/:id` | proprietario (`x-owner-token`) o regia (`x-admin-pin`) | modifica campi; lo **stato** solo regia |
| `DELETE` | `/api/bookings/:id` | proprietario o regia | elimina la prenotazione |
| `POST` | `/api/bookings/reorder` | regia | `{ ids: string[] }` riordina la scaletta |
| `POST` | `/api/bookings/reset` | regia | `{ confirm: true }` svuota tutto |
| `POST` | `/api/admin/verify` | regia | verifica il PIN |

Modello dati di una prenotazione:

```ts
type Slot = {
  id: string;
  name: string;               // nome e cognome
  instrument: string;         // id dello strumento (vedi config)
  instrumentDetail?: string;  // specifica se "Altro"
  song: string;
  artist: string;
  songKey?: string;           // tonalità
  members: { name: string; instrument: string }[];
  status: "waiting" | "onstage" | "played";
  order: number;
  createdAt: number;
  updatedAt: number;
};
// nei dati salvati esiste anche `ownerToken` (mai inviato agli altri client)
```

---

## 7. Note e limiti (onesti)

- **Modalità memoria**: i dati vivono nel processo Node. Su Vercel (serverless) possono
  azzerarsi o divergere tra istanze: usala solo per provare, non per la serata vera.
- **Riordino**: è un read-modify-write serializzato con un lock nel processo; per una
  jam (una sola regia) è più che sufficiente. Se un giorno servisse multi-regia su più
  istanze, si passa a transazioni Redis o a un DB relazionale (Supabase).
- **PIN**: la verifica avviene solo sul server, ma il valore di default scritto in
  `config/site.ts` finisce nel bundle client (essendo un file condiviso). Per la serata
  vera usa la variabile `ADMIN_PIN`. Non è un sistema di autenticazione: è una tendina
  anti-curiosi, perfetta per un locale.
- **Proprietà della prenotazione**: legata al browser (`localStorage`). Svuotare i dati
  del sito fa perdere i pulsanti di modifica; la regia può comunque intervenire.
- **Immagini**: l'hero usa una foto locale (`public/hero-jam.jpg`), nessun servizio
  esterno: la pagina funziona anche offline.
- **Accessibilità e mobile**: target dei pulsanti ≥ 40 px, contrasti alti per l'uso al
  buio, `prefers-reduced-motion` rispettato, modali chiudibili con ESC.

Buona jam 🦎🎸
