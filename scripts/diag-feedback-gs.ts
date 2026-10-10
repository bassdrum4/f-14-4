// Client ↔ Gamestate.gs contract regression.
//
// diag-feedback.ts proves the client talks to *a* collector correctly. This
// proves it talks to *the* backend: it loads the real Gamestate.gs, stubs the
// Apps Script services (Sheets, Script properties, ContentService), routes the
// client's fetch straight into doPost(), and checks the rows that land.
//
// Both halves of the backend are asserted together, because they now share one
// deployment: the feedback form's rows have to arrive in the Feedback tab, and
// the pilot profiles have to keep working in the GameState tab. That is the
// seam where this feature broke before — the form posted its reports at the
// profile store and was told "callsign is required" — so routing is checked
// from the wire down to the cell.
//
// Usage: bun scripts/diag-feedback-gs.ts  (or: bun run test:feedback:gs)

import { readFileSync } from "node:fs";
import { createServer } from "node:http";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

// --- localStorage stand-in --------------------------------------------------

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
(globalThis as { localStorage?: unknown }).localStorage = new MemStorage();

// --- Apps Script services, stubbed -----------------------------------------

/** One row array per tab, keyed by the tab's name. */
const tabs = new Map<string, unknown[][]>();

/** The rows appended to a tab (created empty on first use). */
function rowsOf(name: string): unknown[][] {
  let r = tabs.get(name);
  if (!r) {
    r = [];
    tabs.set(name, r);
  }
  return r;
}

/** The Feedback tab's rows — the collector's output. */
function fbRows(): unknown[][] {
  return rowsOf("Feedback");
}

/** The GameState tab's rows — the profile store's output. */
function gsRows(): unknown[][] {
  return rowsOf("GameState");
}

/**
 * Chainable no-op for the styling calls sheet_() makes on the header range:
 *   head.setFontWeight('bold').setFontColor(...).setBackground(...)
 * (setFrozenRows / autoResizeColumns live on the Sheet, not the Range, so
 * they are stubbed on the sheet itself.)
 */
function chain(): Record<string, () => unknown> {
  const o: Record<string, () => unknown> = {};
  for (const m of ["setFontWeight", "setFontColor", "setBackground"]) {
    o[m] = () => o;
  }
  return o;
}

interface StubSheet {
  getName(): string;
  getParent(): { getId(): string };
  getLastRow(): number;
  appendRow(r: unknown[]): void;
  getRange(r: number, c: number, nr: number, nc: number): Record<string, unknown>;
  insertSheet(name: string): StubSheet;
  setFrozenRows(n: number): void;
  autoResizeColumns(c: number, n: number): void;
}

/**
 * A tab bound to its own row array. The backend keeps one tab per job
 * (GameState and Feedback), so a stub that answers every name with the same
 * sheet would hide a routing bug — and the whole point of this check is that
 * reports land in the right tab.
 */
function makeSheet(name: string): StubSheet {
  const rows = rowsOf(name);
  const sheet: StubSheet = {
    getName: () => name,
    getParent: () => ({ getId: () => "fake-sheet-id" }),
    getLastRow: () => rows.length,
    appendRow: (r) => {
      rows.push(r);
    },
    getRange: (r, c, nr, nc) => ({
      ...chain(),
      // The profile store updates a row in place (Updated / Gamestate cells).
      setValue: (v: unknown) => {
        const row = rows[r - 1];
        if (row) row[c - 1] = v;
      },
      getValue: () => rows[r - 1]?.[c - 1],
      getValues: () => {
        const out: unknown[][] = [];
        for (let i = r - 1; i < r - 1 + nr && i < rows.length; i++) {
          const row = rows[i];
          const vals: unknown[] = [];
          for (let j = c - 1; j < c - 1 + nc; j++) vals.push(row[j]);
          out.push(vals);
        }
        return out;
      },
    }),
    insertSheet: (n) => makeSheet(n),
    setFrozenRows: () => {},
    autoResizeColumns: () => {},
  };
  return sheet;
}

/** The tabs that exist so far, by name. */
const book = {
  getId: () => "fake-sheet-id",
  getSheetByName: (name: string): StubSheet | null => (tabs.has(name) ? makeSheet(name) : null),
  insertSheet: (name: string): StubSheet => {
    rowsOf(name);
    return makeSheet(name);
  },
};

const props = new Map<string, string>();
// Simulate a hardened deployment: the script knows the shared secret, so every
// feedback request must prove it. Without this, Gamestate.gs correctly skips
// the auth check and the assertions below would prove nothing.
props.set("FEEDBACK_KEY", "shared-secret-xyz");
(globalThis as { PropertiesService?: unknown }).PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (k: string) => props.get(k) ?? null,
    setProperty: (k: string, v: string) => {
      props.set(k, v);
    },
    deleteProperty: (k: string) => {
      props.delete(k);
    },
  }),
};

(globalThis as { SpreadsheetApp?: unknown }).SpreadsheetApp = {
  create: () => book,
  openById: () => book,
};

(globalThis as { ContentService?: unknown }).ContentService = {
  MimeType: { JSON: "application/json" },
  createTextOutput: (s: string) => {
    const out = { text: s, setMimeType: () => out };
    return out;
  },
};

// --- load Gamestate.gs exactly as Apps Script would -------------------------

const gsSource = readFileSync(new URL("../Gamestate.gs", import.meta.url), "utf8");
type GsGlobals = {
  __doPost: (e: {
    postData?: { contents?: string; type?: string };
    headers?: Record<string, string>;
  }) => { text: string };
  __HEADER: string[];
  __FEEDBACK_HEADER: string[];
};
// Indirect eval so Gamestate.gs' top-level function declarations land on
// globalThis.
(0, eval)(
  `${gsSource}\n;globalThis.__doPost = doPost;globalThis.__HEADER = HEADER;` +
    `globalThis.__FEEDBACK_HEADER = FEEDBACK_HEADER;`,
);
const { __doPost: doPost, __HEADER: HEADER, __FEEDBACK_HEADER: FEEDBACK_HEADER } =
  globalThis as unknown as GsGlobals;

check("Gamestate.gs exposes doPost", typeof doPost === "function");
check("the profile tab has its 3-column header", HEADER.length === 3, String(HEADER.length));
check("the feedback tab has its 19-column header", FEEDBACK_HEADER.length === 19,
  String(FEEDBACK_HEADER.length));

// --- route the client's fetch into doPost ----------------------------------

// A real HTTP stand-in for the Apps Script web app. Apps Script answers a
// web-app POST with a 302 to script.googleusercontent.com, and the fetch spec
// re-issues that follow-up as a GET — a stubbed fetch would hide both, so this
// stands up an actual server: /exec runs the real doPost() and redirects,
// /served answers exactly as the content host does.
const seenHeaders: Record<string, string> = {};
let lastOutput = "{}";
let servedHits = 0;

const standIn = createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on("data", (c: Buffer) => chunks.push(c));
  req.on("end", () => {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;

    if (path === "/exec" && req.method === "POST") {
      const body = Buffer.concat(chunks).toString("utf8");
      seenHeaders["content-type"] = String(req.headers["content-type"] ?? "");
      seenHeaders["api-key"] = String(req.headers["api-key"] ?? "");
      lastOutput = doPost({
        postData: { contents: body, type: String(req.headers["content-type"] ?? "") },
        headers: req.headers as Record<string, string>,
      }).text;
      res.writeHead(302, { Location: "/served" });
      res.end();
      return;
    }

    // The follow-up after the redirect. The method is now GET — that is what
    // the fetch spec does with a 302 issued to a POST.
    if (path === "/served") {
      servedHits++;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(lastOutput);
      return;
    }

    res.writeHead(404);
    res.end();
  });
});

await new Promise<void>((resolve) => standIn.listen(0, "127.0.0.1", resolve));
const port = (standIn.address() as { port: number }).port;

// --- drive the real client over real HTTP ----------------------------------

const env = import.meta.env as Record<string, string | undefined>;
const ENDPOINT = `http://127.0.0.1:${port}/exec`;
env.VITE_FEEDBACK_ENDPOINT = ENDPOINT;
env.VITE_FEEDBACK_KEY = "shared-secret-xyz";

const { submitFeedback, flushFeedback, pendingCount } = await import("../src/feedback/feedback");

const res = await submitFeedback(
  {
    kind: "bug",
    message: "=SUM(A1) Landing gear will not retract",
    email: " rio@example.com ",
    includeContext: true,
  },
  {
    aircraft: "tomcat",
    world: "seed 4242",
    missionMode: "cruise",
    quality: "high",
    speedKt: 210,
    altFt: 8500,
    mach: 0.82,
    multiplayer: true,
    room: "F14ABCD",
  },
  "Viper",
);

check("the client reports delivery", res.ok && res.storage === "endpoint", JSON.stringify(res));
check("the report leaves the queue", pendingCount() === 0, String(pendingCount()));

// The wire contract.
check(
  "Content-Type is text/plain, so the browser skips the CORS preflight",
  seenHeaders["content-type"] === "text/plain;charset=utf-8",
  String(seenHeaders["content-type"]),
);
check(
  "the api-key header carries the shared secret",
  seenHeaders["api-key"] === "shared-secret-xyz",
  String(seenHeaders["api-key"]),
);
check("the 302 redirect was followed to the content host", servedHits === 1, String(servedHits));

// The sheet contract.
check("the feedback header row was written",
  fbRows().length >= 1 && fbRows()[0].length === FEEDBACK_HEADER.length,
  `${fbRows().length} rows`);
check("exactly one report row was appended", fbRows().length === 2, String(fbRows().length));

const row = fbRows()[fbRows().length - 1];
check("the row matches the header width", row.length === FEEDBACK_HEADER.length,
  `${row.length} vs ${FEEDBACK_HEADER.length}`);
check("kind lands in column 3", row[2] === "bug", String(row[2]));
check("message lands in column 4", String(row[3]).includes("Landing gear will not retract"), String(row[3]));
check("a formula-leading message is defused", String(row[3]).startsWith("'="), String(row[3]).slice(0, 12));
check("callsign lands in column 5", row[4] === "Viper", String(row[4]));
check("email is trimmed", row[5] === "rio@example.com", String(row[5]));
check("aircraft lands in column 7", row[6] === "tomcat", String(row[6]));
check("speed is stored as a number", row[10] === 210, String(row[10]));
check("multiplayer is recorded", row[13] === "yes", String(row[13]));
check("the full context survives in the JSON column", String(row[15]).includes("seed 4242"), String(row[15]));
check("the spreadsheet is the hard-coded one, not a per-request new one",
  props.get("SHEET_ID") === undefined, String(props.get("SHEET_ID")));

// The same deployment is the profile store: a report must land in Feedback,
// and a profile must land in GameState, without either half seeing the other's
// rows. This is the routing the crossed-wire bug got wrong.
{
  const save = JSON.parse(
    doPost({
      postData: {
        contents: JSON.stringify({
          action: "save",
          callsign: " maverick ",
          gamestate: { version: 1, aircraft: "crusader" },
        }),
      },
    }).text,
  ) as { ok?: boolean; saved?: boolean };
  check("a profile save still works on the shared deployment", save.ok === true, JSON.stringify(save));
  check("it lands in the profile tab, not the feedback tab", gsRows().length === 2, String(gsRows().length));
  check("and no report row was added by it", fbRows().length === 2, String(fbRows().length));
  check("the callsign is normalized for storage", gsRows()[1][0] === "MAVERICK", String(gsRows()[1][0]));

  const again = JSON.parse(
    doPost({
      postData: {
        contents: JSON.stringify({ action: "save", callsign: "MAVERICK", gamestate: { version: 2 } }),
      },
    }).text,
  ) as { ok?: boolean };
  check("a case-insensitive resave updates the one row", again.ok === true && gsRows().length === 2,
    `${gsRows().length} rows`);

  const get = JSON.parse(
    doPost({ postData: { contents: JSON.stringify({ action: "get", callsign: "MaVeRiCk" }) } }).text,
  ) as { ok?: boolean; found?: boolean; gamestate?: { version?: number } };
  check("a profile fetch returns the stored state",
    get.ok === true && get.found === true && get.gamestate?.version === 2, JSON.stringify(get));

  const missing = JSON.parse(
    doPost({ postData: { contents: JSON.stringify({ action: "get", callsign: "nobody" }) } }).text,
  ) as { ok?: boolean; found?: boolean };
  check("an unknown callsign is an empty profile, not an error",
    missing.ok === true && missing.found === false, JSON.stringify(missing));

  const noCallsign = JSON.parse(
    doPost({ postData: { contents: JSON.stringify({ action: "get" }) } }).text,
  ) as { ok?: boolean; error?: string };
  check("a profile request without a callsign is refused",
    noCallsign.ok === false, JSON.stringify(noCallsign));
  check("but a report without one is fine (the form does not need a pilot)",
    doPost({
      postData: {
        contents: JSON.stringify({ type: "feedback", id: "nocallsign", message: "no callsign needed", access_key: "shared-secret-xyz" }),
      },
    }).text.includes('"ok":true'));
  fbRows().splice(fbRows().length - 1, 1); // keep the later row counts exact
  check("so it was routed to the feedback tab", fbRows().length === 2, String(fbRows().length));

  const unknown = JSON.parse(
    doPost({ postData: { contents: JSON.stringify({ action: "nonsense" }) } }).text,
  ) as { ok?: boolean; error?: string };
  check("an unknown action names both shapes it does understand",
    unknown.ok === false && String(unknown.error).includes("feedback"), JSON.stringify(unknown));
}

// Idempotency — the client retries whenever a response is lost, so a retry
// carries the same id and the same (correct) key.
const beforeReplay = fbRows().length;
const replay = JSON.parse(
  doPost({
    postData: {
      contents: JSON.stringify({
        app: "f14sim",
        type: "feedback",
        id: row[1],
        kind: "bug",
        message: "dup",
        version: 1,
        access_key: "shared-secret-xyz",
      }),
    },
    headers: { "api-key": "shared-secret-xyz" },
  }).text,
) as { ok?: boolean };
check("a replayed report is accepted", replay.ok === true, JSON.stringify(replay));
check("a replayed report appends no duplicate row", fbRows().length === beforeReplay, `${fbRows().length} vs ${beforeReplay}`);

const goodHeaders = { "api-key": "shared-secret-xyz" };
const goodKey = "shared-secret-xyz";

// Positive control: the key may travel in the body instead of the header.
// It runs first because it legitimately appends a row, so the "nothing was
// appended" assertion below only has to cover the rejections.
check("the key can arrive in the body instead of the header",
  JSON.parse(
    doPost({
      postData: {
        contents: JSON.stringify({ app: "f14sim", type: "feedback", id: "z2", message: "hi", access_key: goodKey }),
      },
    }).text,
  ).ok === true);

// Rejections never touch the sheet. Each carries a valid key, so it is the
// rule under test that fires — not the auth gate.
const beforeReject = fbRows().length;

const blank = JSON.parse(
  doPost({
    postData: {
      contents: JSON.stringify({ app: "f14sim", type: "feedback", id: "x", message: "   ", access_key: goodKey }),
    },
    headers: goodHeaders,
  }).text,
) as { ok?: boolean; error?: string };
check("a blank message is rejected", blank.ok === false, JSON.stringify(blank));
check("it is rejected as an empty message", blank.error === "message is required", JSON.stringify(blank));

const malformed = JSON.parse(
  doPost({ postData: { contents: "not json" }, headers: goodHeaders }).text,
) as { ok?: boolean };
check("malformed JSON is rejected", malformed.ok === false, JSON.stringify(malformed));

const unauth = JSON.parse(
  doPost({
    postData: {
      contents: JSON.stringify({ app: "f14sim", type: "feedback", id: "y", message: "hi", access_key: "wrong" }),
    },
    headers: { "api-key": "wrong" },
  }).text,
) as { ok?: boolean; error?: string };
check("a wrong shared secret is rejected", unauth.ok === false, JSON.stringify(unauth));
check("it is rejected as unauthorised", unauth.error === "unauthorised", JSON.stringify(unauth));

const noKey = JSON.parse(
  doPost({
    postData: { contents: JSON.stringify({ app: "f14sim", type: "feedback", id: "z", message: "hi" }) },
  }).text,
) as { ok?: boolean; error?: string };
check("a request with no key at all is rejected", noKey.ok === false, JSON.stringify(noKey));
check("nothing was appended on any rejection", fbRows().length === beforeReject, String(fbRows().length));

// A queued report still makes it through on retry: point the client at a port
// nothing is listening on, so the POST genuinely fails, then flush against the
// real stand-in.
const beforeFlush = fbRows().length;
env.VITE_FEEDBACK_ENDPOINT = "http://127.0.0.1:9/exec";
const down = await submitFeedback(
  { kind: "idea", message: "queued while the collector is down", includeContext: false },
  null,
  "Viper",
);
check("an undeliverable report is queued, not lost",
  !down.ok && down.storage === "local" && pendingCount() === 1, JSON.stringify(down));
env.VITE_FEEDBACK_ENDPOINT = ENDPOINT;
const sent = await flushFeedback();
check("the queued report flushes into the sheet", sent === 1, String(sent));
check("exactly one row arrived from the flush", fbRows().length === beforeFlush + 1, `${fbRows().length} vs ${beforeFlush + 1}`);

console.log(failures === 0 ? "\nCLIENT ↔ Gamestate.gs CONTRACT OK" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
