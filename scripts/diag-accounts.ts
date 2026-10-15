// Pilot identity regression.
//
// The sim is a single-file static site, so identity is a callsign stored in
// localStorage — the roster, lobby and feedback form all carry it. This drives
// the real module against a localStorage stand-in to pin down what it promises:
//
//   * a callsign is remembered, so you never retype it,
//   * names survive the roster's sanitiser, so wingmen see what you picked,
//   * the cloud gamestate merges back into settings without clobbering
//     identity (callsign and room stay local).
//
// Usage: bun scripts/diag-accounts.ts  (or: bun run test:accounts)

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

// --- a localStorage stand-in, so the store has somewhere to live ------------

class MemStorage {
  private map = new Map<string, string>();
  getItem(k: string): string | null {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string): void {
    this.map.set(k, String(v));
  }
  removeItem(k: string): void {
    this.map.delete(k);
  }
  clear(): void {
    this.map.clear();
  }
  key(i: number): string | null {
    return [...this.map.keys()][i] ?? null;
  }
  get length(): number {
    return this.map.size;
  }
}

const mem = new MemStorage();
(globalThis as unknown as { localStorage: MemStorage }).localStorage = mem;

const {
  USERNAME_MAX,
  currentAccount,
  onboardingSeen,
  dismissOnboarding,
  setCallsign,
  applyGamestate,
  profileOf,
} = await import("../src/accounts");
const { sanitizeName } = await import("../src/net/multiplayer");
const { defaultSettings, loadSettings, saveSettings } = await import("../src/settings");
type Settings = import("../src/settings").Settings;

/** The raw accounts blob, whatever key the store chose. */
function rawAccounts(): string {
  for (let i = 0; i < mem.length; i++) {
    const k = mem.key(i);
    if (k && k.includes("accounts")) return mem.getItem(k) ?? "";
  }
  return "";
}

// --- 1. a fresh device ------------------------------------------------------

check("a fresh device has no account", currentAccount() === null, String(currentAccount()));
check("and has not seen the first-run card", !onboardingSeen());

// --- 2. picking a callsign --------------------------------------------------

const created = setCallsign("Maverick");
check("setting a callsign creates the pilot", created.ok && created.account.username === "Maverick",
  JSON.stringify(created));
check("and the pilot is remembered", currentAccount()?.username === "Maverick", String(currentAccount()));
check("so onboarding is done", onboardingSeen());

// --- 3. the callsign survives the roster's sanitiser -------------------------

const rosterName = sanitizeName("Maverick");
check("the roster shows the same name", rosterName === "Maverick", rosterName);

const renamed = setCallsign("Ice-Man_88");
check("long or odd callsigns are capped to the roster's width",
  renamed.ok && renamed.account.username.length <= USERNAME_MAX, JSON.stringify(renamed));

// --- 4. no passwords anywhere ------------------------------------------------

const raw = rawAccounts();
check("the store holds no password field", !raw.includes("password") && !raw.includes("hash"), raw.slice(0, 120));

// --- 5. a cloud gamestate merges without clobbering identity ------------------

{
  const settings = loadSettings();
  const merged = applyGamestate(settings, {
    version: 1,
    aircraft: "hornet",
    missionMode: "dogfight",
    daylight: "fixed",
    timeOfDay: 17.5,
    volume: 0.4,
    sensitivity: 1.8,
    quality: "high",
    minimap: false,
    bindings: { fire: "KeyZ", missile: "KeyX", flares: "KeyH", map: "KeyN", settings: "KeyP", unknown: "KeyJ" },
  });
  check("gamemode, daylight and time come home",
    merged.missionMode === "dogfight" && merged.daylight === "fixed" && merged.timeOfDay === 17.5);
  check("sensitivity and quality come home", merged.sensitivity === 1.8 && merged.quality === "high");
  check("keybinds come home", merged.bindings.fire === "KeyZ" && merged.bindings.missile === "KeyX");
  check("flare, map and settings keybinds come home", merged.bindings.flares === "KeyH" && merged.bindings.map === "KeyN" && merged.bindings.settings === "KeyP");
  check("unknown action is ignored", !("unknown" in merged.bindings));
  check("unknown keybinds are ignored", merged.bindings.gear === settings.bindings.gear);
  check("the callsign is not clobbered", merged.callsign === settings.callsign);
  check("the room code is not clobbered", merged.room === settings.room);
  // and the merge persists
  saveSettings(merged);
  check("the merge persists to storage", JSON.parse(mem.getItem("f14sim.settings.v1") ?? "{}").aircraft === "hornet");
}

// --- 6. every mission profile the board offers survives the trip --------------

// A profile that comes home must not quietly drop the mission the pilot picked:
// the campaign and the two strikers used to be rejected by this merge, so a
// fetched gamestate reset the board to its first mission.
{
  for (const mode of ["cruise", "dogfight", "strike", "versus", "campaign"] as const) {
    const shipped = profileOf({ ...defaultSettings(), missionMode: mode });
    const back = applyGamestate(defaultSettings(), shipped);
    check(`the ${mode} mission survives a cloud round-trip`, back.missionMode === mode, back.missionMode);
  }
  const bastion: Settings = { ...defaultSettings(), missionMode: "strike", strikeVariant: "bastion", weather: "storm" };
  const restored = applyGamestate(defaultSettings(), profileOf(bastion));
  check("the picked strike variant comes home", restored.strikeVariant === "bastion", String(restored.strikeVariant));
  check("the picked weather comes home", restored.weather === "storm", String(restored.weather));
  // and an unknown mode in a stored profile is still refused
  const junk = applyGamestate({ ...defaultSettings(), missionMode: "campaign" }, { ...profileOf(bastion), missionMode: "nonsense" as never });
  check("an unknown mission in a profile is ignored", junk.missionMode === "campaign", junk.missionMode);
  check("an unknown weather in a profile is ignored",
    applyGamestate(defaultSettings(), { ...profileOf(bastion), weather: "hail" }).weather === defaultSettings().weather);
}

// --- 7. onboarding can be dismissed -------------------------------------------

dismissOnboarding();
check("dismissing the first-run card is remembered", onboardingSeen());

console.log(failures === 0 ? "\nALL ACCOUNT CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
