// The pilot: a callsign, a local profile, and an optional cloud gamestate.
//
// Accounts used to be username+password pairs hashed into localStorage. None
// of that survived contact with a single-file build running from file:// (no
// WebCrypto on an insecure origin, nothing to sign in *to*), so the account is
// now just a callsign — which is what the roster, the feedback form and the
// lobby always actually used.
//
// The profile (settings + keybinds) lives in localStorage. A free Apps Script
// store (Gamestate.gs, endpoint in gamestate.ts) lets a pilot type their
// callsign on a new machine and pull their gamestate back down: gamemode,
// time of day, sensitivity, keybinds and aircraft all come home. It is
// informal by design — no passwords, no security boundary.

import { saveSettings, type Settings } from "./settings";
import { fetchGamestate, saveGamestate, type GamestateProfile } from "./gamestate";

/** Who this pilot is: just the callsign. The cloud profiles are keyed on it. */
export interface Account {
  username: string;
  /** Epoch ms the callsign was first set. */
  createdAt: number;
}

export type AccountResult = { ok: true; account: Account } | { ok: false; error: string };

const STORE_KEY = "f14sim.accounts.v1";
const VERSION = 1;

/** Callsigns must fit the multiplayer roster, which shows at most 12 chars. */
export const USERNAME_MAX = 12;

interface Store {
  version: number;
  /** The current callsign (null on a fresh install until it is minted). */
  session: string | null;
  /** Epoch ms the session callsign was created. */
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null; // storage blocked (private mode, embedded frame)
  }
}

function emptyStore(): Store {
  return { version: VERSION, session: null, createdAt: 0 };
}

function parseStore(raw: string | null): Store {
  if (!raw) return emptyStore();
  try {
    const parsed = JSON.parse(raw) as Partial<Store>;
    const session = typeof parsed.session === "string" ? parsed.session : null;
    const createdAt = typeof parsed.createdAt === "number" ? parsed.createdAt : 0;
    return { version: VERSION, session, createdAt };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store): void {
  try {
    storage()?.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — the account lasts for this session only */
  }
  notify();
}

// ---------------------------------------------------------------------------
// The live answer (stable object identity, so React can subscribe to it)
// ---------------------------------------------------------------------------

let cachedRaw: string | null = null;
let cachedAccount: Account | null = null;
let cacheReady = false;

/**
 * The pilot, or null. Reads straight from storage and only rebuilds the
 * returned object when the stored value actually changed, so it is safe as a
 * `useSyncExternalStore` snapshot.
 */
export function currentAccount(): Account | null {
  const raw = storage()?.getItem(STORE_KEY) ?? null;
  if (!cacheReady || raw !== cachedRaw) {
    cachedRaw = raw;
    cachedAccount = accountFromRaw(raw);
    cacheReady = true;
  }
  return cachedAccount;
}

function accountFromRaw(raw: string | null): Account | null {
  const store = parseStore(raw);
  if (!store.session) return null;
  return { username: store.session, createdAt: store.createdAt };
}

// ---------------------------------------------------------------------------
// Subscribe
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();

export function subscribeAccounts(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify(): void {
  cacheReady = false; // force the next read to rebuild the snapshot
  for (const fn of listeners) fn();
}

// ---------------------------------------------------------------------------
// Setting the callsign (there is no password to check any more)
// ---------------------------------------------------------------------------

/** Trim, collapse to the roster's character set, cap the length. */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/[^\w.-]/g, "").slice(0, USERNAME_MAX);
}

/**
 * Become this callsign. Creates or renames the local pilot; cloud profiles
 * (when the endpoint is configured) are keyed on it.
 */
export function setCallsign(raw: string): AccountResult {
  const username = normalizeUsername(raw);
  if (username.length < 2) return { ok: false, error: "Callsigns need at least 2 characters." };
  const store = parseStore(storage()?.getItem(STORE_KEY) ?? null);
  store.session = username;
  if (!store.createdAt) store.createdAt = Date.now();
  writeStore(store);
  return { ok: true, account: { username, createdAt: store.createdAt } };
}

// ---------------------------------------------------------------------------
// Cloud gamestate
// ---------------------------------------------------------------------------

/** The cloud-relevant slice of the settings, ready to ship. */
export function profileOf(s: Settings): GamestateProfile {
  return {
    version: 1,
    aircraft: s.aircraft,
    missionMode: s.missionMode,
    daylight: s.daylight,
    timeOfDay: s.timeOfDay,
    volume: s.volume,
    sensitivity: s.sensitivity,
    quality: s.quality,
    minimap: s.minimap,
    bindings: { ...s.bindings },
  };
}

/**
 * Merge a fetched cloud profile into the local settings, without clobbering
 * the callsign or room code (identity and the world you were joining are not
 * gameplay settings).
 */
export function applyGamestate(current: Settings, profile: GamestateProfile): Settings {
  const next: Settings = { ...current, bindings: { ...current.bindings } };
  if (profile.aircraft === "tomcat" || profile.aircraft === "hornet" || profile.aircraft === "intruder") {
    next.aircraft = profile.aircraft;
  }
  if (profile.missionMode === "dogfight" || profile.missionMode === "cruise" || profile.missionMode === "strike") {
    next.missionMode = profile.missionMode;
  }
  if (profile.daylight === "live" || profile.daylight === "fixed" || profile.daylight === "cycle") {
    next.daylight = profile.daylight;
  }
  if (typeof profile.timeOfDay === "number") next.timeOfDay = clampN(profile.timeOfDay, 0, 24);
  if (typeof profile.volume === "number") next.volume = clampN(profile.volume, 0, 1);
  if (typeof profile.sensitivity === "number") next.sensitivity = clampN(profile.sensitivity, 0.4, 3);
  if (profile.quality === "low" || profile.quality === "medium" || profile.quality === "high") {
    next.quality = profile.quality;
  }
  if (typeof profile.minimap === "boolean") next.minimap = profile.minimap;
  if (profile.bindings && typeof profile.bindings === "object") {
    const fetched = profile.bindings as Record<string, string>;
    for (const k of Object.keys(DEFAULT_KEYS) as Array<keyof typeof DEFAULT_KEYS>) {
      const v = fetched[k];
      if (typeof v === "string" && v) (next.bindings as Record<string, string>)[k] = v;
    }
  }
  saveSettings(next);
  return next;
}

/** Clamp anything a fetched profile hands us into the local range. */
function clampN(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Default bindings, used to sanity-check fetched profiles before merging. */
const DEFAULT_KEYS: Record<string, string> = {
  pitchUp: "ArrowUp", pitchDown: "ArrowDown", rollLeft: "ArrowLeft", rollRight: "ArrowRight",
  yawLeft: "KeyA", yawRight: "KeyD", throttleUp: "KeyW", throttleDown: "KeyS", brake: "KeyB",
  gear: "KeyG", flaps: "KeyF", speedbrake: "KeyX", ab: "ShiftLeft", cat: "Space",
  camera: "KeyC", pause: "Escape", trimUp: "KeyT", trimDown: "KeyV", fire: "KeyQ",
  bomb: "KeyR", missile: "KeyE",
};

/** Push the current profile to the cloud under the given callsign. */
export async function pushGamestate(callsign: string, s: Settings): Promise<{ ok: boolean; error?: string }> {
  const res = await saveGamestate(callsign, profileOf(s));
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

/** Pull the cloud profile for a callsign into the local settings. */
export async function pullGamestate(
  callsign: string,
  current: Settings,
): Promise<{ ok: boolean; found?: boolean; settings?: Settings; error?: string }> {
  const res = await fetchGamestate(callsign);
  if (!res.ok) return { ok: false, error: res.error };
  if (!res.found || !res.profile) return { ok: false, error: `No saved gamestate for "${callsign}".` };
  return { ok: true, found: true, settings: applyGamestate(current, res.profile) };
}

// ---------------------------------------------------------------------------
// First-run nudge
// ---------------------------------------------------------------------------

const ONBOARDED_KEY = "f14sim.onboarded.v1";

/** True once the pilot has seen the callsign card (or has a callsign). */
export function onboardingSeen(): boolean {
  try {
    const store = storage();
    // Nowhere to remember the answer means there is no point asking: the card
    // would come back on every launch.
    if (!store) return true;
    return store.getItem(ONBOARDED_KEY) === "1" || currentAccount() !== null;
  } catch {
    return true;
  }
}

export function dismissOnboarding(): void {
  try {
    storage()?.setItem(ONBOARDED_KEY, "1");
  } catch {
    /* nothing to remember */
  }
  notify();
}
