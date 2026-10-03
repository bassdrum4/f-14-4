// Verify settings persistence, including the new daylight/minimap fields and
// resilience against old or corrupt stored data.
// Usage: bun scripts/diag-settings.ts

// minimal localStorage shim
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

const { defaultSettings, loadSettings, saveSettings, DAYLIGHT_LABELS, DEFAULT_BINDINGS } = await import(
  "../src/settings"
);

let fails = 0;
function check(name: string, cond: boolean, extra = "") {
  if (cond) console.log(`  ok  ${name}`);
  else { fails++; console.error(`FAIL  ${name} ${extra}`); }
}

const KEY = "f14sim.settings.v1";

// defaults
store.clear();
const d = loadSettings();
check("defaults include daylight mode", d.daylight === "live", d.daylight);
check("defaults include a time of day", typeof d.timeOfDay === "number" && d.timeOfDay >= 0 && d.timeOfDay <= 24, String(d.timeOfDay));
check("defaults show the minimap", d.minimap === true, String(d.minimap));
check("every daylight mode is labelled", Object.keys(DAYLIGHT_LABELS).length === 3);

// round trip
const s = defaultSettings();
s.daylight = "cycle";
s.timeOfDay = 5.75;
s.minimap = false;
saveSettings(s);
const back = loadSettings();
check("daylight round-trips", back.daylight === "cycle", back.daylight);
check("time of day round-trips", Math.abs(back.timeOfDay - 5.75) < 1e-9, String(back.timeOfDay));
check("minimap flag round-trips", back.minimap === false, String(back.minimap));
check("bindings still round-trip", JSON.stringify(back.bindings) === JSON.stringify(DEFAULT_BINDINGS));

// old stored data without the new fields must not break
store.set(KEY, JSON.stringify({ volume: 0.5, quality: "high", bindings: { pitchUp: "KeyI" } }));
const old = loadSettings();
check("old settings load with daylight defaults", old.daylight === "live", old.daylight);
check("old settings keep their own values", old.quality === "high" && old.volume === 0.5);
check("old settings keep custom bindings", old.bindings.pitchUp === "KeyI", old.bindings.pitchUp);
check("old settings fill in missing bindings", old.bindings.rollLeft === DEFAULT_BINDINGS.rollLeft);

// corrupt values get clamped
store.set(KEY, JSON.stringify({ daylight: "nonsense", timeOfDay: 99, minimap: "yes", volume: 5 }));
const bad = loadSettings();
check("invalid daylight falls back", bad.daylight === "live", bad.daylight);
check("out-of-range time clamps into 0..24", bad.timeOfDay >= 0 && bad.timeOfDay <= 24, String(bad.timeOfDay));
check("non-boolean minimap falls back", bad.minimap === true, String(bad.minimap));
check("out-of-range volume clamps", bad.volume >= 0 && bad.volume <= 1, String(bad.volume));

// garbage
store.set(KEY, "{not json");
const junk = loadSettings();
check("corrupt storage falls back to defaults", junk.daylight === "live" && junk.minimap === true);

console.log(fails === 0 ? "\nALL SETTINGS CHECKS PASSED" : `\n${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);