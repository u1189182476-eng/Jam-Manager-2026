import type {
  BookingValues,
  Slot,
  SlotStatus,
  SlotsResponse,
} from "@/lib/types";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status = 0, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new ApiError(
      "Connessione assente: controlla la rete e riprova.",
      0,
    );
  }

  const raw = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new ApiError(
      typeof data.error === "string" ? data.error : `Errore ${res.status}`,
      res.status,
      (data.fields as Record<string, string> | undefined) ?? undefined,
    );
  }

  return data as T;
}

type MutationResponse = SlotsResponse;

export const jamApi = {
  list: () => request<SlotsResponse>("/api/bookings", { method: "GET" }),

  create: (values: BookingValues & { website?: string; elapsedMs?: number }) =>
    request<MutationResponse & { ownerToken: string; created: Slot }>(
      "/api/bookings",
      { method: "POST", body: JSON.stringify(values) },
    ),

  update: (
    id: string,
    payload: Partial<BookingValues> & { status?: SlotStatus },
    opts: { ownerToken?: string; adminPin?: string } = {},
  ) =>
    request<MutationResponse>(`/api/bookings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        ...(opts.ownerToken ? { "x-owner-token": opts.ownerToken } : {}),
        ...(opts.adminPin ? { "x-admin-pin": opts.adminPin } : {}),
      },
      body: JSON.stringify(payload),
    }),

  remove: (
    id: string,
    opts: { ownerToken?: string; adminPin?: string } = {},
  ) =>
    request<MutationResponse>(`/api/bookings/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        ...(opts.ownerToken ? { "x-owner-token": opts.ownerToken } : {}),
        ...(opts.adminPin ? { "x-admin-pin": opts.adminPin } : {}),
      },
    }),

  reorder: (ids: string[], adminPin: string) =>
    request<MutationResponse>("/api/bookings/reorder", {
      method: "POST",
      headers: { "x-admin-pin": adminPin },
      body: JSON.stringify({ ids }),
    }),

  reset: (adminPin: string) =>
    request<MutationResponse>("/api/bookings/reset", {
      method: "POST",
      headers: { "x-admin-pin": adminPin },
      body: JSON.stringify({ confirm: true }),
    }),

  verifyPin: (adminPin: string) =>
    request<{ ok: boolean }>("/api/admin/verify", {
      method: "POST",
      headers: { "x-admin-pin": adminPin },
    }),
};
