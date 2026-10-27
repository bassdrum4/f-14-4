// Cloud gamestate in the isolated f14_profiles table on Bored's Supabase project.
// The same f14-backend function accepts F-14 feedback and flight events.
// It imports missing legacy Apps Script profiles on demand, then reads/writes Supabase.
// Callsigns are informal identities: anyone who knows one can overwrite its profile.
export const GAMESTATE_ENDPOINT = "https://djdpttltfmwkofdrvkem.supabase.co/functions/v1/f14-backend";
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
  adaptiveResolution?: boolean;
  minimap: boolean;
  /** Whether this pilot has flown before. Optional: profiles saved before it
   *  existed belong to pilots who have already flown. */
  hasFlown?: boolean;
  /** HUD overlay preferences. Optional: profiles saved before they existed. */
  hudLadder?: boolean;
  hudGunCross?: boolean;
  bindings: Record<string, string>;
  /** Where the last sortie began (the boat you landed on, or the runway).
   *  Optional: profiles saved before it existed simply have no opinion. */
  missionStyle?: "operation" | "endless";
  launchKind?: "carrier" | "airfield";
  launchCarrier?: number;
  /** The picked mission profile: Iron Bastion or the convoy, and the weather
   *  the theatre was flying. Optional: older profiles simply have no opinion. */
  strikeVariant?: "convoy" | "bastion";
  weather?: string;
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
 * The request stays text/plain to work in a standalone file or embedded game;
 * the Supabase function also supports CORS preflight when needed.
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
