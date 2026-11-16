import { JamApp } from "@/components/jam-app";
import { SiteHeader } from "@/components/site-header";
import { getStorageMode, listSlots, toPublicSlots } from "@/lib/store";
import type { JamMode, Slot } from "@/lib/types";

// La scaletta cambia in continuazione: mai metterla in cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let slots: Slot[] = [];
  let mode: JamMode = "memory";

  try {
    slots = toPublicSlots(await listSlots());
    mode = getStorageMode();
  } catch (error) {
    // se il database non risponde, la pagina resta comunque viva
    console.error("[jam] impossibile leggere la scaletta:", error);
  }

  return (
    <div id="top">
      <SiteHeader />
      <JamApp initialSlots={slots} initialMode={mode} />
    </div>
  );
}
