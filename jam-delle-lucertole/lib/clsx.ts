export type ClassValue = string | number | null | undefined | false | ClassValue[];

/** Piccolo helper per comporre classi condizionali senza dipendenze esterne. */
export function clsx(inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const item of inputs) {
    if (!item) continue;
    if (Array.isArray(item)) {
      const nested = clsx(item);
      if (nested) out.push(nested);
    } else {
      out.push(String(item));
    }
  }
  return out.join(" ");
}
