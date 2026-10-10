// Feedback storage.
//
// The sim is a static site, so there is no server of its own to receive
// feedback. Submissions are posted to the same Google Apps Script web app that
// stores the pilot profiles (Gamestate.gs in the repo root, endpoint in
// gamestate.ts) — a free, no-backend collector that appends each report to a
// Feedback tab in the same spreadsheet.
//
// It used to post to a separate Code.gs collector, with its own URL to deploy
// and keep in step with the profile store. When the two got crossed the form
// posted profile-shaped JSON at the profile store and every report came back
// "callsign is required". One URL, one deployment.
//
// Environment (Settings → Environment / .env.local):
//   VITE_FEEDBACK_ENDPOINT  — optional. Only needed to send reports to a
//                             *different* Apps Script deployment (the URL of
//                             the form .../macros/s/<SCRIPT_ID>/exec). Blank
//                             or unusable falls back to the shared backend.
//   VITE_FEEDBACK_KEY       — optional shared secret. Sent as an `api-key`
//                             header and as `access_key` in the body; set the
//                             same value in the script's Script Properties as
//                             FEEDBACK_KEY and the backend will reject
//                             anything that does not match.
//
// Submissions are never dropped: the report is written to the local queue
// first, then flushed to Apps Script, and a failed collector simply keeps
// the report queued for the next retry until the collector is back up.

import { GAMESTATE_ENDPOINT } from "../gamestate";

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
 * The deployed Apps Script web app URL, or null when the resolved value is not
 * a usable one (see feedbackEndpointStatus).
 */
export function feedbackEndpoint(): string | null {
  const status = feedbackEndpointStatus();
  return status.ok ? status.url : null;
}

export type EndpointStatus =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/** Why the configured endpoint is unusable, or null when it is fine. */
export function feedbackEndpointProblem(): string | null {
  const status = feedbackEndpointStatus();
  return status.ok ? null : status.reason;
}

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

/**
 * The collector the reports go to.
 *
 * One URL for the whole backend, taken from the profile store (Gamestate.gs
 * answers both halves — see its header), so a report can never be posted at a
 * deployment that does not understand it. That crossed wire is exactly how the
 * form broke: it shipped its own collector URL in VITE_FEEDBACK_ENDPOINT, that
 * variable held the profile store's deployment, and every report came back
 * "callsign is required".
 *
 * A development build may still override it with VITE_FEEDBACK_ENDPOINT — that
 * is how the headless checks point the client at a local stand-in server, and
 * how a developer can run a separate collector while iterating. A production
 * build ignores the variable outright: a stale or mangled value in the host's
 * env store must not redirect live reports somewhere that cannot take them.
 */
function resolvedEndpoint(): string {
  const raw = (import.meta.env.VITE_FEEDBACK_ENDPOINT as string | undefined) ?? "";
  const value = raw.trim();
  // A development override, when it is a plausible URL. A wrapped platform
  // envelope is not one, and neither is anything the host mangled: those fall
  // through to the shared backend instead of going dark.
  if (!import.meta.env.PROD && value && !looksLikeWrappedValue(value)) return value;
  return GAMESTATE_ENDPOINT;
}

/**
 * The endpoint, validated. The value is validated rather than trusted: a
 * scheme-less entry — a pasted token, a bare script id — would be resolved
 * against the site's own origin by fetch(), and the SPA answers *any* path with
 * `200 text/html`, so the client would report "delivered" while the report was
 * stored nowhere at all. Only an absolute http(s) URL is a collector.
 */
export function feedbackEndpointStatus(): EndpointStatus {
  return validateEndpoint(resolvedEndpoint());
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
  // check on every POST. Sending no key is the honest option: the backend only
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
 * preflight that Apps Script web apps handle inconsistently. The backend reads
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
