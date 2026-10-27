// F-14 feedback goes to the same isolated Supabase Edge Function as gamestates.
// Always enqueue locally before sending; offline/rejected reports remain retryable.
// A development build may override VITE_FEEDBACK_ENDPOINT to test a collector.
// Production ignores that setting to prevent stale host environment values.

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
 * The deployed Supabase web app URL, or null when the resolved value is not
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
 * One URL for the whole backend, taken from the profile store (f14-backend
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
      reason: "VITE_FEEDBACK_ENDPOINT must be an absolute http(s) URL.",
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

/** Send a queued report to the F-14 Edge Function; only acknowledged JSON dequeues it. */
const deliveries = new Map<string, Promise<void>>();
function postEntry(entry: FeedbackEntry): Promise<void> {
  const existing = deliveries.get(entry.id);
  if (existing) return existing;
  const pending = sendEntry(entry).finally(() => deliveries.delete(entry.id));
  deliveries.set(entry.id, pending);
  return pending;
}

async function sendEntry(entry: FeedbackEntry): Promise<void> {
  const url = feedbackEndpoint();
  if (!url) throw new Error("no F-14 backend endpoint configured");
  const headers: Record<string, string> = { "Content-Type": "text/plain;charset=utf-8" };
  const body = { app: "f14sim", type: "feedback", ...entry };

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
    // Never trust HTTP 200 alone; require the backend's {ok:true} acknowledgment.
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
 * first, then flushed to Supabase — so a slow or failing collector can
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
let flushing: Promise<number> | null = null;
export function flushFeedback(): Promise<number> {
  return flushing ??= flushQueue().finally(() => { flushing = null; });
}
async function flushQueue(): Promise<number> {
  if (!feedbackConfigured()) return 0;
  const queue = readQueue();
  if (!queue.length) return 0;
  let sent = 0;
  for (const entry of queue) {
    try {
      await postEntry(entry);
      writeQueue(readQueue().filter(e => e.id !== entry.id));
      sent++;
    } catch {
      // Leave this report, and anything submitted during the retry, queued.
    }
  }
  return sent;
}
