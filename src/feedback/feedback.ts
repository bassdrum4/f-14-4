// Feedback storage.
//
// The sim is a static site, so there is no server of its own to receive
// feedback. Submissions are posted to a Google Apps Script web app deployed
// from Code.gs — a free, no-backend collector that exposes a publicly
// callable URL and appends each report to a Google Sheet.
//
// Environment (Settings → Environment / .env.local):
//   VITE_FEEDBACK_ENDPOINT  — the Apps Script deployment URL of the form
//                             https://script.google.com/macros/s/<SCRIPT_ID>/exec
//                             (or /dev while you are still developing it).
//   VITE_FEEDBACK_KEY       — optional shared secret. Sent as an `api-key`
//                             header and as `access_key` in the body; set the
//                             same value in the script's Script Properties as
//                             FEEDBACK_KEY and Code.gs will reject anything
//                             that does not match.
//
// A usable VITE_FEEDBACK_ENDPOINT always wins, but the build carries a
// built-in copy of the collector URL as well: the production env store wraps
// values in an encrypted envelope before they reach `vite build`, and a
// wrapped value is not a URL. See BUILT_IN_ENDPOINT below.
//
// Submissions are never dropped: the report is written to the local queue
// first, then flushed to Apps Script, and a failed collector simply keeps
// the report queued for the next retry until the collector is back up.

export type FeedbackKind = "bug" | "idea" | "other";

export interface FeedbackInput {
  kind: FeedbackKind;
  message: string;
  email?: string;
  includeContext: boolean;
}

export interface FeedbackContext {
  [key: string]: string | number | boolean;
}

export interface FeedbackEntry {
  id: string;
  at: string;
  kind: FeedbackKind;
  message: string;
  email?: string;
  callsign?: string;
  context?: FeedbackContext;
  ua: string;
  version: number;
}

export interface FeedbackResult {
  /** The submission is safe (sent, or queued locally). */
  ok: boolean;
  storage: "endpoint" | "local";
  message: string;
}

const STORE_KEY = "f14sim.feedback.v1";
const MAX_QUEUE = 50;
const VERSION = 1;
const POST_TIMEOUT_MS = 10_000;

/**
 * The deployed Apps Script web app URL, or null when none is configured.
 *
 * The value is validated rather than trusted. A scheme-less entry — a pasted
 * token, a bare script id — would be resolved against the site's own origin by
 * fetch(), and the SPA answers *any* path with `200 text/html`. The client would
 * then report "delivered" while the report was stored nowhere at all. Only an
 * absolute http(s) URL is a collector.
 */
export function feedbackEndpoint(): string | null {
  const status = feedbackEndpointStatus();
  return status.ok ? status.url : null;
}

export type EndpointStatus =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/** Why a configured endpoint is unusable, or null when it is fine/absent. */
export function feedbackEndpointProblem(): string | null {
  const status = feedbackEndpointStatus();
  return status.ok ? null : status.reason;
}

/**
 * The collector baked into the build, used only when the configured value is
 * an unreadable envelope.
 *
 * The production env store wraps values in an encrypted blob
 * (`{"v":"v2",…}`, base64, ~1.3 KB) and hands that wrapper to `vite build`,
 * so the deployed bundle would otherwise see something that is not a URL and
 * go dark. The Apps Script deployment URL is public configuration — it ships
 * in the client bundle either way — so a built-in copy keeps delivery
 * working. A usable env value (preview, local, or a future platform fix)
 * still wins.
 */
const BUILT_IN_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyvrTV3PRKm4EX6E3VDnsQ6MjLkYWVgRhw3IML1g0LBijifmv-lQGsxVyaQHZWVcrF0xQ/exec";

/**
 * True for a platform-wrapped env value: a long base64 blob that no one
 * pasted as a URL. Short pasted tokens are deliberately not covered — those
 * must keep reporting "not a URL" instead of silently aiming elsewhere.
 */
function looksLikeWrappedValue(value: string): boolean {
  if (value.length < 200) return false;
  if (value.startsWith('{"v"')) return true; // envelope passed decoded
  return /^[A-Za-z0-9+/=_-]+$/.test(value); // envelope passed base64
}

/** Read and validate VITE_FEEDBACK_ENDPOINT in one pass. */
export function feedbackEndpointStatus(): EndpointStatus {
  const raw = (import.meta.env.VITE_FEEDBACK_ENDPOINT as string | undefined) ?? "";
  const value = raw.trim();
  if (!value) return { ok: false, reason: "" };
  return validateEndpoint(looksLikeWrappedValue(value) ? BUILT_IN_ENDPOINT : value);
}

function validateEndpoint(value: string): EndpointStatus {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return {
      ok: false,
      reason: "VITE_FEEDBACK_ENDPOINT is not a URL — paste the full Apps Script /exec address.",
    };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: `VITE_FEEDBACK_ENDPOINT must be an http(s) URL (got ${url.protocol}).` };
  }
  if (!url.hostname) {
    return { ok: false, reason: "VITE_FEEDBACK_ENDPOINT has no host." };
  }
  return { ok: true, url: value };
}

export function feedbackConfigured(): boolean {
  return feedbackEndpoint() !== null;
}

/** The script id embedded in an Apps Script deployment URL, for display. */
export function scriptIdFromEndpoint(url: string): string | null {
  const m = /\/macros\/s\/([A-Za-z0-9_-]+)/.exec(url.trim());
  return m ? m[1] : null;
}

function feedbackKey(): string | null {
  const key = (import.meta.env.VITE_FEEDBACK_KEY as string | undefined) ?? "";
  const trimmed = key.trim();
  if (!trimmed) return null;
  // A platform-wrapped value would be sent verbatim and fail the script's
  // check on every POST. Sending no key is the honest option: Code.gs only
  // demands one when FEEDBACK_KEY is set in its Script Properties.
  if (looksLikeWrappedValue(trimmed)) return null;
  return trimmed;
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function readQueue(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { queue?: FeedbackEntry[] } | FeedbackEntry[];
    const queue = Array.isArray(parsed) ? parsed : parsed.queue;
    return Array.isArray(queue) ? queue : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: FeedbackEntry[]): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ queue: queue.slice(-MAX_QUEUE) }));
  } catch {
    /* storage unavailable — the submission is still queued for the next try */
  }
}

export function pendingCount(): number {
  return readQueue().length;
}

export function listPending(): FeedbackEntry[] {
  return readQueue();
}

export function clearPending(): void {
  writeQueue([]);
}

export function exportPending(): string {
  return JSON.stringify(readQueue(), null, 2);
}

export function buildEntry(input: FeedbackInput, context: FeedbackContext | null, callsign?: string): FeedbackEntry {
  const entry: FeedbackEntry = {
    id: newId(),
    at: new Date().toISOString(),
    kind: input.kind,
    message: input.message.trim(),
    ua: typeof navigator === "undefined" ? "unknown" : navigator.userAgent,
    version: VERSION,
  };
  if (input.email?.trim()) entry.email = input.email.trim();
  if (callsign?.trim()) entry.callsign = callsign.trim();
  if (input.includeContext && context) entry.context = context;
  return entry;
}

/**
 * One POST to the deployed Apps Script web app.
 *
 * The body is JSON, but the Content-Type is deliberately `text/plain`: that
 * makes the request a CORS *simple request*, so the browser skips the OPTIONS
 * preflight that Apps Script web apps handle inconsistently. Code.gs reads
 * `e.postData.contents`, which is content-type agnostic, so the payload is
 * unchanged.
 *
 * Apps Script answers a web-app POST with a 302 to script.googleusercontent.com;
 * fetch follows it, and the final 200 carries the ContentService output.
 * Throws on network or HTTP failure so the caller can keep the report queued.
 */
async function postEntry(entry: FeedbackEntry): Promise<void> {
  const url = feedbackEndpoint();
  if (!url) throw new Error("no Apps Script endpoint configured");
  const key = feedbackKey();

  const headers: Record<string, string> = { "Content-Type": "text/plain;charset=utf-8" };
  if (key) headers["api-key"] = key;

  const body = {
    app: "f14sim",
    type: "feedback",
    ...(key ? { access_key: key } : {}),
    ...entry,
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), POST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // ContentService cannot set status codes: Apps Script answers 200 whether
    // the report was appended or turned away, and the outcome travels in the
    // body. Trusting the status alone would report "delivered" for a rejection
    // (wrong key, bad payload) while nothing was stored.
    let reply: { ok?: unknown; error?: unknown } | null = null;
    try {
      reply = JSON.parse(await res.text()) as { ok?: unknown; error?: unknown };
    } catch {
      reply = null;
    }
    if (!reply || typeof reply.ok !== "boolean") {
      throw new Error("collector did not answer JSON");
    }
    if (!reply.ok) {
      const why = typeof reply.error === "string" && reply.error ? reply.error : "rejected the report";
      throw new Error(`collector: ${why}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Submit one feedback item. The entry is always appended to the local queue
 * first, then flushed to Apps Script — so a slow or failing collector can
 * never lose a submission.
 */
export async function submitFeedback(
  input: FeedbackInput,
  context: FeedbackContext | null,
  callsign?: string,
): Promise<FeedbackResult> {
  const entry = buildEntry(input, context, callsign);
  const queue = readQueue();
  queue.push(entry);
  writeQueue(queue);

  if (!feedbackConfigured()) {
    return {
      ok: true,
      storage: "local",
      message: `Saved locally — ${pendingCount()} queued.`,
    };
  }

  try {
    await postEntry(entry);
    const rest = readQueue().filter((e) => e.id !== entry.id);
    writeQueue(rest);
    return { ok: true, storage: "endpoint", message: "Feedback delivered. Thank you, pilot." };
  } catch (err) {
    const why = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      storage: "local",
      message: `Couldn't send it (${why}) — saved locally, it will retry.`,
    };
  }
}

/** Retry every queued submission (called on load and from the panel). */
export async function flushFeedback(): Promise<number> {
  if (!feedbackConfigured()) return 0;
  const queue = readQueue();
  if (!queue.length) return 0;
  const failed: FeedbackEntry[] = [];
  let sent = 0;
  for (const entry of queue) {
    try {
      await postEntry(entry);
      sent++;
    } catch {
      failed.push(entry);
    }
  }
  writeQueue(failed);
  return sent;
}
