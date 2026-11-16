import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

/* ------------------------------------------------------------------ risposte */

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export function jsonError(
  error: string,
  status = 400,
  fields?: Record<string, string>,
) {
  return NextResponse.json(
    { error, ...(fields ? { fields } : {}) },
    { status, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

/* -------------------------------------------------------------------- admin */

export function configuredAdminPin(): string {
  const fromEnv = (process.env.ADMIN_PIN || "").trim();
  return fromEnv || String(siteConfig.adminPin).trim();
}

/** Confronto a tempo costante (evita timing attack sul PIN). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isAdminRequest(req: Request): boolean {
  const given = (req.headers.get("x-admin-pin") || "").trim();
  const expected = configuredAdminPin();
  if (!given || !expected) return false;
  return safeEqual(given, expected);
}

/* ---------------------------------------------------------------- richiesta */

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === "object") return body as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}

export function getClientIp(req: Request): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") || headers.get("cf-connecting-ip") || "locale";
}

/* ------------------------------------------------------------------ errori */

/** Errore "di dominio" con status HTTP, gestito nelle route handler. */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
