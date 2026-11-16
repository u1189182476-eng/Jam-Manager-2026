import { isAdminRequest, jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/admin/verify — controlla il PIN della regia (header x-admin-pin). */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return jsonError("PIN non valido.", 401);
  }
  return jsonOk({ ok: true });
}
