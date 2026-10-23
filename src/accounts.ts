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

import {
  DEFAULT_BINDINGS,
  MISSION_MODE_LABELS,
  WEATHER_LABELS,
  saveSettings,
  type MissionMode,
  type Settings,
  type WeatherMode,
} from "./settings";
import { isAircraftId } from "./sim/aircraft";
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

let sessionRaw: string | null = null;
let sessionOnly = false;
function readStoreRaw(): string | null {
  if (sessionOnly) return sessionRaw;
  try { const target = storage(); return target ? target.getItem(STORE_KEY) : sessionRaw; }
  catch { return sessionRaw; }
}
function writeStore(store: Store): void {
  try {
    sessionRaw = JSON.stringify(store);
    const target = storage();
    if (target) target.setItem(STORE_KEY, sessionRaw);
    else sessionOnly = true;
  } catch {
    sessionOnly = true;
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
  const raw = readStoreRaw();
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
  const store = parseStore(readStoreRaw());
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
    missionStyle: s.missionStyle ?? "operation",
    daylight: s.daylight,
    timeOfDay: s.timeOfDay,
    volume: s.volume,
    sensitivity: s.sensitivity,
    quality: s.quality,
    adaptiveResolution: s.adaptiveResolution,
    minimap: s.minimap,
    hasFlown: s.hasFlown === true,
    hudLadder: s.hudLadder,
    hudGunCross: s.hudGunCross,
    bindings: { ...s.bindings },
    launchKind: s.launchKind,
    launchCarrier: s.launchCarrier,
    strikeVariant: s.strikeVariant ?? "convoy",
    weather: s.weather ?? "clear",
  };
}

/**
 * Merge a fetched cloud profile into the local settings, without clobbering
 * the callsign or room code (identity and the world you were joining are not
 * gameplay settings).
 */
export function applyGamestate(current: Settings, profile: GamestateProfile): Settings {
  const next: Settings = { ...current, bindings: { ...current.bindings } };
  if (isAircraftId(profile.aircraft)) {
    next.aircraft = profile.aircraft;
  }
  // Validated against the label records rather than a hand-kept list, so a mode
  // or weather added to the picker cannot be quietly dropped here — the
  // campaign used to be missing from this list, and a fetched profile reset the
  // pilot to the first mission on the board instead of restoring their war.
  if (isMissionMode(profile.missionMode)) next.missionMode = profile.missionMode;
  if (isWeatherMode(profile.weather)) next.weather = profile.weather;
  if (profile.strikeVariant === "convoy" || profile.strikeVariant === "bastion") {
    next.strikeVariant = profile.strikeVariant;
  }
  if (profile.missionStyle === "operation" || profile.missionStyle === "endless") next.missionStyle = profile.missionStyle;
  if (profile.daylight === "live" || profile.daylight === "fixed" || profile.daylight === "cycle") {
    next.daylight = profile.daylight;
  }
  if (typeof profile.timeOfDay === "number") next.timeOfDay = clampN(profile.timeOfDay, 0, 24);
  if (typeof profile.volume === "number") next.volume = clampN(profile.volume, 0, 1);
  if (typeof profile.sensitivity === "number") next.sensitivity = clampN(profile.sensitivity, 0.4, 3);
  if (profile.quality === "low" || profile.quality === "medium" || profile.quality === "high") {
    next.quality = profile.quality;
  }
  if (typeof profile.adaptiveResolution === "boolean") next.adaptiveResolution = profile.adaptiveResolution;
  if (typeof profile.minimap === "boolean") next.minimap = profile.minimap;
  // A profile written before the field existed is a pilot who has flown; do
  // not greet a returning pilot with the first-flight tutorial.
  next.hasFlown = typeof profile.hasFlown === "boolean" ? profile.hasFlown : true;
  if (typeof profile.hudLadder === "boolean") next.hudLadder = profile.hudLadder;
  if (typeof profile.hudGunCross === "boolean") next.hudGunCross = profile.hudGunCross;
  // The launch point comes home too: land on a boat, sign in elsewhere, lift off
  // from that deck. Older profiles have neither field and keep the local value.
  if (profile.launchKind === "carrier" || profile.launchKind === "airfield") {
    next.launchKind = profile.launchKind;
  }
  if (typeof profile.launchCarrier === "number" && Number.isFinite(profile.launchCarrier)) {
    next.launchCarrier = Math.max(0, Math.floor(profile.launchCarrier));
  }
  if (profile.bindings && typeof profile.bindings === "object") {
    const fetched = profile.bindings as Record<string, string>;
    for (const k of Object.keys(DEFAULT_BINDINGS) as Array<keyof typeof DEFAULT_BINDINGS>) {
      const v = fetched[k];
      if (typeof v === "string" && v) (next.bindings as Record<string, string>)[k] = v;
    }
  }
  saveSettings(next);
  return next;
}

/** A mode or weather the shipper understands — i.e. one the board offers. */
function isMissionMode(v: unknown): v is MissionMode {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(MISSION_MODE_LABELS, v);
}
function isWeatherMode(v: unknown): v is WeatherMode {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(WEATHER_LABELS, v);
}

/** Clamp anything a fetched profile hands us into the local range. */
function clampN(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

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
