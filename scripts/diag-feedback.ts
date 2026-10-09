// Feedback pipeline regression.
//
// The form is the one part of the sim that talks to the outside world, and it
// has to be trustworthy in two directions: a submission must never be lost
// when the collector is missing or down, and it must arrive in the shape the
// collector expects when it is up. This stands up a real local collector and
// drives the module through both.
//
// Usage: bun scripts/diag-feedback.ts  (or: bun run test:feedback)

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

// --- a localStorage stand-in, so the queue has somewhere to live -----------

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
const store = new MemStorage();
(globalThis as { localStorage?: unknown }).localStorage = store;

// --- a collector we control ----------------------------------------------

// The feedback module ships a JSON payload to the configured Apps Script URL.
// Code.gs reads the message fields and the optional api-key header off the POST.
interface Hit {
  path: string;
  body: Record<string, unknown>;
  apiKey: string | null;
}

const hits: Hit[] = [];
let collectorDown = false;
let collectorRejects = false;
let collectorGarbage = false;

const server = createServer((req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  if (collectorDown) {
    res.writeHead(500);
    res.end("collector down");
    return;
  }
  // Apps Script cannot set status codes: a rejection still arrives as 200
  // with `{ok:false}` in the body (or, if mis-deployed, as an HTML page).
  if (collectorRejects) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "unauthorised" }));
    return;
  }
  if (collectorGarbage) {
    res.writeHead(200, { "content-type": "text/html" });
    res.end("<html><body>not the collector</body></html>");
    return;
  }
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end("method not allowed");
    return;
  }
  const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
      } catch {
        /* a malformed body would be a bug in the sender, recorded as {} */
      }
      const key = req.headers["api-key"];
      hits.push({ path, body, apiKey: typeof key === "string" ? key : null });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
});

await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

const env = import.meta.env as Record<string, string | undefined>;
delete env.VITE_FEEDBACK_ENDPOINT;
delete env.VITE_FEEDBACK_KEY;

const {
  buildEntry,
  clearPending,
  exportPending,
  feedbackConfigured,
  feedbackEndpoint,
  feedbackEndpointProblem,
  flushFeedback,
  listPending,
  pendingCount,
  submitFeedback,
} = await import("../src/feedback/feedback");

// --- 1. unconfigured: nothing is sent, nothing is lost --------------------
{
  check("with no endpoint the module reports itself unconfigured", !feedbackConfigured());
  check("a fresh queue is empty", pendingCount() === 0, String(pendingCount()));

  const res = await submitFeedback(
    { kind: "bug", message: "Gear will not retract above 300 kt", includeContext: true },
    { aircraft: "tomcat", speedKt: 320 },
    "Viper",
  );
  check("an unconfigured submission still succeeds", res.ok, JSON.stringify(res));
  check("it is reported as stored locally", res.storage === "local", res.storage);
  check("the queue now holds it", pendingCount() === 1, String(pendingCount()));
  check("nothing was posted without an endpoint", hits.length === 0, `${hits.length} hits`);

  const queued = listPending()[0];
  check("the queued entry keeps the message", queued.message.includes("Gear will not retract"), queued.message);
  check("the queued entry keeps the kind", queued.kind === "bug", queued.kind);
  check("the queued entry keeps the callsign", queued.callsign === "Viper", String(queued.callsign));
  check("the queued entry keeps the context", queued.context?.aircraft === "tomcat", JSON.stringify(queued.context));
  check("the queued entry records the version", queued.version === 1, String(queued.version));
  check("the queued entry records a user agent string",
    typeof queued.ua === "string" && queued.ua.length > 0, String(queued.ua));
  check("the queued entry records an ISO timestamp",
    !Number.isNaN(Date.parse(queued.at)), queued.at);
  check("the queued entry has a unique id", typeof queued.id === "string" && queued.id.length > 0, String(queued.id));

  const flushed = await flushFeedback();
  check("flushing with no endpoint sends nothing", flushed === 0, String(flushed));
  check("the unconfigured submission is still queued", pendingCount() === 1, String(pendingCount()));
}

// --- 2. configured: the submission is delivered and dequeued --------------
{
  env.VITE_FEEDBACK_ENDPOINT = `${base}/collect`;
  check("an endpoint makes the module configured", feedbackConfigured());

  const res = await submitFeedback(
    { kind: "idea", message: "Add a carrier landing grading board", email: " rio@example.com ", includeContext: false },
    { aircraft: "tomcat" },
    "Iceman",
  );
  check("a configured submission succeeds", res.ok, JSON.stringify(res));
  check("it is reported as delivered to the endpoint", res.storage === "endpoint", res.storage);
  check("exactly one POST arrived", hits.length === 1, `${hits.length} hits`);
  check("the delivered entry left the queue", pendingCount() === 1, String(pendingCount()));

  const body = hits[0].body;
  check("the body carries the message", body.message === "Add a carrier landing grading board", String(body.message));
  check("the body carries the kind", body.kind === "idea", String(body.kind));
  check("the body carries the callsign", body.callsign === "Iceman", String(body.callsign));
  check("the email is trimmed", body.email === "rio@example.com", String(body.email));
  check("with context off, no context rides along", body.context === undefined, JSON.stringify(body.context));
  // The envelope Code.gs pattern-matches on before appending the row.
  check("the payload is tagged for this app", body.app === "f14sim", String(body.app));
  check("the payload is tagged as feedback", body.type === "feedback", String(body.type));
}

// --- 3. a down collector: the submission survives, then retries -----------
{
  collectorDown = true;
  const res = await submitFeedback(
    { kind: "other", message: "Radio check", includeContext: false },
    null,
    "Viper",
  );
  check("a failed delivery is reported as not ok", !res.ok, JSON.stringify(res));
  check("a failed delivery says it was saved locally", res.storage === "local", res.storage);
  check("a failed delivery stays in the queue", pendingCount() === 2, String(pendingCount()));
  check("no body was recorded while the collector was down", hits.length === 1, `${hits.length} hits`);

  collectorDown = false;
  const sent = await flushFeedback();
  check("the retry sends both queued items", sent === 2, String(sent));
  check("the queue is empty after a successful retry", pendingCount() === 0, String(pendingCount()));
  check("the collector received the retried items", hits.length === 3, `${hits.length} hits`);
  check("the first queued item was sent on retry",
    hits.some((h) => String(h.body.message).includes("Gear will not retract")));
}

// --- 4. the API key rides along when one is set ---------------------------
{
  env.VITE_FEEDBACK_KEY = "test-key-123";
  await submitFeedback({ kind: "other", message: "key check", includeContext: false }, null, "Viper");
  const last = hits[hits.length - 1];
  check("the api key is sent as an api-key header", last.apiKey === "test-key-123", String(last.apiKey));
  check("the api key also rides in the body for Web3Forms-style collectors",
    last.body.access_key === "test-key-123", String(last.body.access_key));
  delete env.VITE_FEEDBACK_KEY;
}

// --- 5. the payload always matches what Code.gs appends to the sheet -------
{
  env.VITE_FEEDBACK_ENDPOINT = `${base}/macros/s/ABC123def-/_exec`;
  hits.length = 0;
  await submitFeedback(
    { kind: "bug", message: "sheet shape", email: "a@b.c", includeContext: true },
    { aircraft: "tomcat", speedKt: 210 },
    "Viper",
  );
  const body = hits[0].body;
  check("the Apps Script URL is used verbatim", hits[0].path.endsWith("/_exec"), hits[0].path);
  check("the payload carries a unique id", typeof body.id === "string" && body.id.length > 0, String(body.id));
  check("the payload carries an ISO timestamp",
    typeof body.at === "string" && !Number.isNaN(Date.parse(body.at)), String(body.at));
  check("the payload carries the kind", body.kind === "bug", String(body.kind));
  check("the payload carries the message", body.message === "sheet shape", String(body.message));
  check("the payload carries the callsign", body.callsign === "Viper", String(body.callsign));
  check("the payload carries the email", body.email === "a@b.c", String(body.email));
  check("the payload carries the context", (body.context as Record<string, unknown>)?.aircraft === "tomcat",
    JSON.stringify(body.context));
  check("the payload carries the schema version", body.version === 1, String(body.version));
  check("the payload carries the user agent",
    typeof body.ua === "string" && body.ua.length > 0, String(body.ua));
}

// --- 6. entry construction and the local queue housekeeping ---------------
{
  const withCtx = buildEntry({ kind: "bug", message: "  padded  ", email: "  ", includeContext: true }, { a: 1 }, "Viper");
  check("buildEntry trims the message", withCtx.message === "padded", withCtx.message);
  check("buildEntry drops a blank email", withCtx.email === undefined, String(withCtx.email));
  check("buildEntry keeps numeric context", withCtx.context?.a === 1, JSON.stringify(withCtx.context));

  const noCtx = buildEntry({ kind: "bug", message: "x", includeContext: false }, { a: 1 }, undefined);
  check("buildEntry omits context when the pilot says no", noCtx.context === undefined);
  check("buildEntry omits a missing callsign", noCtx.callsign === undefined);

  env.VITE_FEEDBACK_ENDPOINT = `${base}/collect`;
  for (let i = 0; i < 60; i++) {
    await submitFeedback({ kind: "other", message: `flood ${i}`, includeContext: false }, null, "Viper");
  }
  check("the queue is capped, so local storage cannot grow without bound",
    pendingCount() === 0, `${pendingCount()} left`);

  // The queue only grows while the collector is unreachable; prove the cap holds there.
  collectorDown = true;
  for (let i = 0; i < 60; i++) {
    await submitFeedback({ kind: "other", message: `flood ${i}`, includeContext: false }, null, "Viper");
  }
  const capped = pendingCount();
  check("an unreachable collector cannot overflow local storage", capped <= 50, `${capped} queued`);

  const dump = exportPending();
  const parsed = JSON.parse(dump) as unknown[];
  check("the export is valid JSON", Array.isArray(parsed));
  check("the export contains the queue", parsed.length === capped, `${parsed.length} vs ${capped}`);

  clearPending();
  check("clearing empties the queue", pendingCount() === 0, String(pendingCount()));
  collectorDown = false;
}

// --- 7. the newest submission is kept when the cap is hit -----------------
{
  collectorDown = true;
  for (let i = 0; i < 55; i++) {
    await submitFeedback({ kind: "other", message: `last-${i}`, includeContext: false }, null, "Viper");
  }
  const queued = listPending();
  check("the cap keeps the 50 most recent submissions", queued.length === 50, String(queued.length));
  check("the newest submission survived the cap",
    queued[queued.length - 1].message === "last-54", queued[queued.length - 1].message);
  check("the oldest submissions were dropped",
    !queued.some((e) => e.message === "last-0"), queued[0].message);
  clearPending();
  collectorDown = false;
}

// --- 8. a malformed endpoint must never count as configured ---------------
//
// A scheme-less value (a pasted token, a bare script id) gets resolved against
// the site's own origin by fetch(), and the SPA answers any path with
// `200 text/html`. The client would then report "delivered" while the report
// was stored nowhere. It has to fall back to the local queue instead.
{
  const hitsBefore = hits.length;
  clearPending();

  env.VITE_FEEDBACK_ENDPOINT = "eyJ2IjoidjIiLCJjIjoiYmFyZXRva2Vu";
  check("a pasted token is not a usable endpoint", !feedbackConfigured());
  check("the reason is explained", feedbackEndpointProblem() !== null, String(feedbackEndpointProblem()));
  const tokenRes = await submitFeedback(
    { kind: "other", message: "must queue", includeContext: false }, null, "Viper",
  );
  check("it falls back to the local queue", tokenRes.ok && tokenRes.storage === "local", JSON.stringify(tokenRes));
  check("nothing was posted to the origin", hits.length === hitsBefore, `${hits.length} vs ${hitsBefore}`);
  check("the report is waiting locally", pendingCount() === 1, String(pendingCount()));

  env.VITE_FEEDBACK_ENDPOINT = "/macros/s/abc/exec";
  check("a relative path is not a usable endpoint", !feedbackConfigured());

  env.VITE_FEEDBACK_ENDPOINT = "ftp://script.google.com/x";
  check("only http(s) counts as an endpoint", !feedbackConfigured());

  clearPending();
  env.VITE_FEEDBACK_ENDPOINT = `${base}/collect`;
  check("a real http URL is still accepted", feedbackConfigured());
  delete env.VITE_FEEDBACK_ENDPOINT;
  check("removing it leaves the module unconfigured", !feedbackConfigured());
}

// --- 9. a platform-wrapped value must not silence the collector -----------
//
// The production env store hands `vite build` an encrypted envelope instead
// of the plaintext URL. That blob is not a URL, but going dark would strand
// every report in localStorage — the built-in collector copy has to take over.
{
  const wrapped = "eyJ2IjoidjIiLCJjIjoi" + "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWY".repeat(20) + "==";
  env.VITE_FEEDBACK_ENDPOINT = wrapped;
  check("a wrapped value still yields a configured collector", feedbackConfigured());
  check("it falls back to the built-in Apps Script URL",
    feedbackEndpoint() ===
      "https://script.google.com/macros/s/AKfycbyvrTV3PRKm4EX6E3VDnsQ6MjLkYWVgRhw3IML1g0LBijifmv-lQGsxVyaQHZWVcrF0xQ/exec",
    String(feedbackEndpoint()));
  check("a wrapped value reports no configuration problem",
    feedbackEndpointProblem() === null, String(feedbackEndpointProblem()));

  // A short pasted token must keep failing closed — no silent redirect.
  env.VITE_FEEDBACK_ENDPOINT = "eyJ2IjoidjIiLCJjIjoiYmFyZXRva2Vu";
  check("a short pasted token is still refused", !feedbackConfigured());
  delete env.VITE_FEEDBACK_ENDPOINT;
}

// --- 10. 200 is transport, not proof: the body decides --------------------
//
// ContentService always answers 200. If the client trusted the status alone,
// a rejected report would be reported as delivered while stored nowhere.
{
  clearPending();
  env.VITE_FEEDBACK_ENDPOINT = `${base}/collect`;

  collectorRejects = true;
  const rejected = await submitFeedback(
    { kind: "bug", message: "must survive a rejection", includeContext: false }, null, "Viper",
  );
  check("a 200 rejection is not reported as delivered",
    !rejected.ok && rejected.storage === "local", JSON.stringify(rejected));
  check("the rejected report stays queued", pendingCount() === 1, String(pendingCount()));

  collectorGarbage = true;
  collectorRejects = false;
  const garbage = await submitFeedback(
    { kind: "bug", message: "must survive a non-JSON answer", includeContext: false }, null, "Viper",
  );
  check("a 200 HTML page is not reported as delivered",
    !garbage.ok && garbage.storage === "local", JSON.stringify(garbage));
  check("the unanswered report stays queued", pendingCount() === 2, String(pendingCount()));

  collectorGarbage = false;
  const sent = await flushFeedback();
  check("both reports go out once the collector answers properly",
    sent === 2 && pendingCount() === 0, `sent ${sent}, ${pendingCount()} left`);

  clearPending();
  delete env.VITE_FEEDBACK_ENDPOINT;
}

server.close();
console.log(failures === 0 ? "\nALL FEEDBACK CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
