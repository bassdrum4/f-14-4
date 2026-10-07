// Cloud gamestate: a pilot's settings follow their callsign.
//
// The backend is a free Apps Script web app (Gamestate.gs in the repo root):
// POST { action:"save", callsign, gamestate } writes the profile, and
// POST { action:"get", callsign } fetches it back. Same deal as the feedback
// collector — no server of our own, the profile lives in a Google Sheet.
//
// The endpoint is hardcoded on purpose (it is not a secret, and the sim is a
// single file that runs anywhere): paste the /exec URL from the Apps Script
// deployment over GAMESTATE_ENDPOINT below.

/**
 * The Apps Script /exec URL for Gamestate.gs. Deploy the script, then paste
 * its URL here. While it is blank, cloud fetch/saves are skipped quietly and
 * the sim behaves exactly as before (localStorage only).
 */
const GAMESTATE_ENDPOINT = "https://script.google.com/macros/s/AKfycbwsrT3N6toVVVaQ4oxHFs6iWwzD3NrWbrhUe0pcqipuIm2x8gs31i-LSOWZKpVIlLnb/exec";

const TIMEOUT_MS = 9000;

/** The parts of a pilot's settings that ride to the cloud and back. */
export interface GamestateProfile {
  version: number;
  aircraft: string;
  missionMode: string;
  daylight: string;
  timeOfDay: number;
  volume: number;
  sensitivity: number;
  quality: string;
  minimap: boolean;
  bindings: Record<string, string>;
}

/** Result of a cloud fetch. `found:false` simply means "no profile yet". */
export type FetchResult =
  | { ok: true; found: boolean; profile: GamestateProfile | null }
  | { ok: false; error: string };

/** Result of a cloud save. */
export type SaveResult = { ok: true } | { ok: false; error: string };

export function gamestateConfigured(): boolean {
  return GAMESTATE_ENDPOINT.startsWith("https://");
}

/**
 * Fetch a profile by callsign. Resolves with ok:false on any transport or
 * server rejection — the message is already human-readable, for the UI line.
 */
export async function fetchGamestate(callsign: string): Promise<FetchResult> {
  if (!gamestateConfigured()) return { ok: false, error: "No cloud endpoint configured." };
  try {
    const res: CloudReply = await post({ action: "get", callsign });
    if (!res) return { ok: false, error: "The cloud did not answer in time." };
    if (res.ok !== true) {
      return { ok: false, error: typeof res.error === "string" ? res.error : "The cloud refused the request." };
    }
    const profile = (res.gamestate ?? null) as GamestateProfile | null;
    return { ok: true, found: !!profile, profile };
  } catch {
    return { ok: false, error: "Could not reach the cloud (offline, or blocked)." };
  }
}

/** Save the profile under this callsign. */
export async function saveGamestate(callsign: string, profile: GamestateProfile): Promise<SaveResult> {
  if (!gamestateConfigured()) return { ok: false, error: "No cloud endpoint configured." };
  try {
    const res: CloudReply = await post({ action: "save", callsign, gamestate: profile });
    if (!res) return { ok: false, error: "The cloud did not answer in time." };
    if (res.ok !== true) {
      return { ok: false, error: typeof res.error === "string" ? res.error : "The cloud refused the save." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the cloud (offline, or blocked)." };
  }
}

/**
 * The POST is sent as text/plain so the browser treats it as a CORS simple
 * request and skips the preflight that Apps Script handles inconsistently
 * (see Code.gs for the same explanation from the other side).
 */
async function post(body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(GAMESTATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timer);
  }
}

/** A parsed cloud answer, or null. */
type CloudReply = { ok?: unknown; error?: unknown; gamestate?: unknown; found?: unknown } | null;
