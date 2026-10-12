// Entry-screen regression.
//
// What the home board promises, and what it must not do:
//
//   * a pilot with no callsign yet still gets a board with launch rows and a
//     pilot strip to walk into — nothing is locked behind the name,
//   * the callsign card is asked for when the pilot actually leaves the menu to
//     fly, so it must never be mounted alongside the board (it used to render
//     underneath it, where the dispatch panel's semi-transparent gradient let
//     it ghost through behind the launch buttons),
//   * answering the card — by entering a name or flying as a guest — is
//     remembered, so it stays a one-time ask.
//
// The same idea covers the Controls screen, where the same key means a
// different thing on a helicopter than on a jet.
//
// The real components are rendered through react-dom/server against a
// localStorage stand-in: no DOM and no browser, but the shipped screens rather
// than a copy of their markup.
//
// Usage: bun scripts/diag-menu.ts  (or: bun run test:menu)

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

// --- a localStorage stand-in, so identity has somewhere to live -------------

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

(globalThis as unknown as { localStorage: MemStorage }).localStorage = new MemStorage();

const { createElement } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const { UiRoot, ControlsPanel } = await import("../src/ui/menus");
const { defaultSettings } = await import("../src/settings");
const { currentAccount, dismissOnboarding, onboardingSeen, setCallsign } = await import(
  "../src/accounts"
);
type AircraftId = import("../src/sim/aircraft").AircraftId;

/** The home board exactly as a browser first paints it. */
function homeBoard(): string {
  return renderToStaticMarkup(
    createElement(UiRoot, {
      sim: null,
      settings: defaultSettings(),
      onSettings: () => {},
    }),
  );
}

// --- 1. a fresh device: nothing picked yet ----------------------------------

check("a fresh device has not answered the callsign card", !onboardingSeen());

const fresh = homeBoard();
check("the home board still renders", fresh.includes("FLY SOLO") && fresh.includes("READY ON THE DECK"));
check("the other launch rows are there too", fresh.includes("FLY TOGETHER") && fresh.includes("HEAD-TO-HEAD"));
check("a pilot with no callsign still has the pilot strip", fresh.includes("GUEST PILOT"));
check("the key legend is still on the board", fresh.includes("Esc — pause"));
check("the callsign card is NOT mounted over the board", !fresh.includes("intro-bg"));
check("and its text is nowhere in the board", !fresh.includes("YOUR CALLSIGN") && !fresh.includes("Pick a callsign"));
check(
  "the board is not doubled up behind itself",
  (fresh.match(/READY ON THE DECK/g) ?? []).length === 1,
);

// --- 2. answering it is remembered ------------------------------------------

dismissOnboarding();
check("flying as a guest settles the card", onboardingSeen());
check("and the board is unchanged by that", homeBoard().includes("FLY SOLO") && !homeBoard().includes("intro-bg"));

// --- 3. a chosen callsign ---------------------------------------------------

check("a callsign is accepted", setCallsign("MAVERICK").ok);
check("and counts as answered", onboardingSeen() && currentAccount()?.username === "MAVERICK");
check("with the board still free of the card", !homeBoard().includes("intro-bg"));

// --- 4. the Controls screen follows the aircraft ----------------------------
{
  const controls = (aircraft: AircraftId) =>
    renderToStaticMarkup(
      createElement(ControlsPanel, {
        settings: { ...defaultSettings(), aircraft },
        onSettings: () => {},
        onBack: () => {},
      }),
    );
  const jet = controls("tomcat");
  const heli = controls("seahawk");
  check("a jet's Controls screen still talks in pitch and throttle",
    jet.includes("Pitch up (nose up)") && jet.includes("Throttle up"));
  check("a helicopter's reads as cyclic and collective instead",
    heli.includes("Disc forward") && heli.includes("Collective up"));
  check("and it does not advertise pitch or throttle at the controls screen",
    !heli.includes("Pitch up (nose up)") && !heli.includes("Throttle up"));
  check("the helicopter rows that do nothing are left out",
    !heli.includes("Landing gear") && !heli.includes("Catapult (hold)"));
  check("while the jet still has them", jet.includes("Landing gear") && jet.includes("Catapult (hold)"));
  check("and the helicopter note explains which way the arrow pair goes",
    heli.includes("up flies the machine forward") && jet.includes("up flies the machine forward") === false);
}

// --- 5. the board is compacted for short screens ----------------------------

// The layout itself needs a browser to measure; this pins the rules that do the
// work, so a Chromebook-sized viewport cannot quietly lose them again.
const { readFile } = await import("node:fs/promises");
const css = await readFile(new URL("../src/index.css", import.meta.url), "utf8");
for (const height of [860, 700, 560]) {
  const block = css.split(`@media (max-height: ${height}px)`)[1] ?? "";
  const body = block.split("\n}")[0] ?? "";
  check(
    `the ${height}px-tall viewport rules shrink the home board`,
    /\.dispatch-(panel|mark|heading|action|nav)/.test(body),
  );
}

console.log(failures === 0 ? "\nALL MENU CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
