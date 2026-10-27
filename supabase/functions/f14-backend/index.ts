// Isolated F-14 API on Bored's Supabase project.
// Keep this function unauthenticated at the gateway because file:// and embedded
// pilots do not have Supabase accounts. Every route validates its own inputs.
// No service key is sent to a browser; all F-14 tables have RLS enabled and
// no anon/authenticated table privileges.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
const LEGACY_PROFILE_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwsrT3N6toVVVaQ4oxHFs6iWwzD3NrWbrhUe0pcqipuIm2x8gs31i-LSOWZKpVIlLnb/exec";
type Body = Record<string, unknown>;
function object(v: unknown): v is Body {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function response(body: Body, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
function invalid(message: string): Response { return response({ ok: false, error: message }, 400); }
function text(v: unknown, cap: number): string {
  return typeof v === "string" ? v.trim().slice(0, cap) : "";
}
function canonicalCallsign(v: unknown): { key: string; name: string } | null {
  const name = text(v, 50);
  return /^[A-Za-z0-9_.-]{2,12}$/.test(name) ? { name, key: name.toLowerCase() } : null;
}
function credentials(): { key: string; legacy: boolean } {
  const keyList = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keyList) {
    try {
      const key = JSON.parse(keyList).default;
      if (typeof key === "string" && key) return { key, legacy: false };
    } catch { /* older projects expose only a JWT service role key */ }
  }
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("Missing Supabase backend credentials");
  return { key, legacy: true };
}
const base = () => Deno.env.get("SUPABASE_URL")!;
async function database(table: string, method: "GET" | "POST", query = "", payload?: unknown,
                        preference?: string): Promise<unknown> {
  const { key, legacy } = credentials();
  const res = await fetch(base() + "/rest/v1/" + table + query, {
    method,
    headers: {
      apikey: key,
      ...(legacy ? { Authorization: "Bearer " + key } : {}),
      ...(payload !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(preference ? { Prefer: preference } : {}),
    },
    ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    console.error("f14 database request failed", table, method, res.status, (await res.text()).slice(0, 300));
    throw new Error("F-14 storage is temporarily unavailable");
  }
  if (res.status === 204 || method === "POST") return null;
  return await res.json();
}
async function saveProfile(callsign: { key: string; name: string }, state: Body): Promise<void> {
  await database("f14_profiles", "POST", "?on_conflict=callsign_key", {
    callsign_key: callsign.key, callsign: callsign.name, gamestate: state,
    updated_at: new Date().toISOString(),
  }, "resolution=merge-duplicates,return=minimal");
}
async function recoverOldProfile(callsign: { key: string; name: string }): Promise<Body | null> {
  // Read-once migration only: future saves/reads use Supabase. The old Google
  // Sheet is inaccessible to the connected account, so existing profiles
  // migrate lazily when a returning pilot fetches the same callsign.
  try {
    const res = await fetch(LEGACY_PROFILE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ action: "get", callsign: callsign.name }),
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body?.ok || !object(body.gamestate)) return null;
    if (JSON.stringify(body.gamestate).length > 8000) return null;
    await saveProfile(callsign, body.gamestate);
    return body.gamestate;
  } catch { return null; }
}
async function profile(body: Body): Promise<Response> {
  const callsign = canonicalCallsign(body.callsign);
  if (!callsign) return invalid("callsign must be 2-12 letters, digits, '.', '_' or '-'");
  if (body.action === "get") {
    const rows = await database("f14_profiles", "GET",
      "?select=gamestate&callsign_key=eq." + encodeURIComponent(callsign.key) + "&limit=1") as Array<{ gamestate?: unknown }>;
    const state = object(rows?.[0]?.gamestate) ? rows[0].gamestate : await recoverOldProfile(callsign);
    return response({ ok: true, found: !!state, gamestate: state ?? null });
  }
  if (!object(body.gamestate)) return invalid("gamestate must be an object");
  if (JSON.stringify(body.gamestate).length > 8000) return invalid("gamestate too large");
  await saveProfile(callsign, body.gamestate);
  return response({ ok: true, saved: true, callsign: callsign.name });
}
async function feedback(body: Body): Promise<Response> {
  const id = text(body.id, 81);
  const message = text(body.message, 4001);
  const kind = body.kind;
  if (!/^[a-zA-Z0-9_-]{4,80}$/.test(id)) return invalid("invalid feedback id");
  if (!message || message.length > 4000) return invalid("message must be 1-4000 characters");
  if (kind !== "bug" && kind !== "idea" && kind !== "other") return invalid("invalid feedback kind");
  const parsedTime = typeof body.at === "string" ? Date.parse(body.at) : NaN;
  if (Number.isFinite(parsedTime) && parsedTime > Date.now() + 60_000)
    return invalid("implausible timestamp");
  const details = object(body.context) && JSON.stringify(body.context).length <= 7000 ? body.context : null;
  await database("f14_feedback", "POST", "?on_conflict=id", {
    id, kind, message,
    callsign: text(body.callsign, 500) || null,
    email: text(body.email, 500) || null,
    context: details,
    user_agent: text(body.ua, 500) || null,
    client_version: Number.isInteger(body.version) ? body.version : null,
    sent_at: Number.isFinite(parsedTime) ? new Date(parsedTime).toISOString() : null,
  }, "resolution=ignore-duplicates,return=minimal");
  return response({ ok: true, id });
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function verifiedBoredAccount(req: Request, expected: string): Promise<boolean> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  const { key } = credentials();
  try {
    const res = await fetch(base() + "/auth/v1/user", {
      headers: { apikey: key, Authorization: "Bearer " + token },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const user = await res.json();
    return user.id === expected && user.is_anonymous !== true;
  } catch { return false; }
}
async function flight(req: Request, body: Body): Promise<Response> {
  const event = body.event;
  if (!object(event) || event.game !== "f-14" || !UUID.test(String(event.id)) ||
    !UUID.test(String(event.session_id)) ||
    (event.visitor_id !== null && event.visitor_id !== undefined && !UUID.test(String(event.visitor_id))) ||
    (event.user_id !== null && event.user_id !== undefined && !UUID.test(String(event.user_id))))
    return invalid("invalid flight event identity");
  if (!["start", "interaction", "checkpoint", "end"].includes(String(event.kind)))
    return invalid("invalid flight event kind");
  for (const num of [event.active_ms, event.visible_ms]) {
    if (!Number.isInteger(num) || (num as number) < 0 || (num as number) > 65000)
      return invalid("invalid flight duration");
  }
  if (!object(event.details) || JSON.stringify(event.details).length > 4000)
    return invalid("invalid flight event details");
  if (event.user_id && !await verifiedBoredAccount(req, String(event.user_id)))
    return response({ ok: false, error: "Bored session is invalid or expired" }, 401);
  await database("f14_flight_events", "POST", "?on_conflict=id", {
    id: event.id, session_id: event.session_id,
    visitor_id: event.visitor_id ?? null, user_id: event.user_id ?? null,
    kind: event.kind, active_ms: event.active_ms, visible_ms: event.visible_ms,
    details: event.details,
  }, "resolution=ignore-duplicates,return=minimal");
  return response({ ok: true, id: event.id });
}
export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return response({ ok: false, error: "POST required" }, 405);
  try {
    // Limit bot spam and runaway settings blobs before JSON parsing.
    const length = Number(req.headers.get("content-length") ?? 0);
    if (length > 32768) return invalid("request too large");
    const raw = await req.text();
    if (raw.length > 32768) return invalid("request too large");
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return invalid("invalid JSON"); }
    if (!object(body)) return invalid("request body must be an object");
    if (body.type === "health") {
      // Read-only live storage probe for deployment/CI checks; never writes test data.
      await Promise.all([
        database("f14_profiles", "GET", "?select=callsign_key&limit=0"),
        database("f14_feedback", "GET", "?select=id&limit=0"),
        database("f14_flight_events", "GET", "?select=id&limit=0"),
      ]);
      return response({ ok: true, service: "f14-backend" });
    }
    if (body.action === "get" || body.action === "save") return await profile(body);
    if (body.type === "feedback" && body.app === "f14sim") return await feedback(body);
    if (body.type === "event") return await flight(req, body);
    return invalid("unknown F-14 request");
  } catch (err) {
    console.error("F-14 backend error", err);
    return response({ ok: false, error: "F-14 backend unavailable" }, 503);
  }
}
if (import.meta.main) Deno.serve(handleRequest);
