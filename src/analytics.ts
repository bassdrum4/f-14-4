// Lightweight gameplay telemetry, kept entirely off the render loop.
// Uses isolated f14_flight_events via the F-14 Edge Function; shares Bored's browser opt-out.
import type { Sim, Phase } from "./sim/engine";
import type { Settings } from "./settings";
import { APP_VERSION } from "./version";

const API = "https://djdpttltfmwkofdrvkem.supabase.co/functions/v1/f14-backend";
const PREFERENCE = "bored.analytics.enabled";
const VISITOR = "bored.analytics.visitor";
const SESSION = "bored.session";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type FlightEvent = {
  id: string; session_id: string; visitor_id: string | null; user_id: string | null;
  game: "f-14"; kind: "start" | "interaction" | "checkpoint" | "end";
  active_ms: number; visible_ms: number; details: Record<string, string | number | boolean>;
};
type Run = {
  id: string; user: string | null; visitor: string | null; mode: string;
  aircraft: string; multiplayer: boolean; lastInput: number;
  active: number; visible: number; interacted: boolean;
};
function stored(key: string): unknown {
  try { const raw = localStorage.getItem(key); return raw == null ? null : JSON.parse(raw); }
  catch { return null; }
}

export function analyticsEnabled(): boolean { return stored(PREFERENCE) !== false; }
export function setAnalyticsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(PREFERENCE, JSON.stringify(enabled));
    if (!enabled) localStorage.removeItem(VISITOR);
  } catch { /* storage is optional */ }
  window.dispatchEvent(new Event("f14:analytics-preference"));
}
function visitorId(): string | null {
  const existing = stored(VISITOR);
  if (typeof existing === "string" && UUID.test(existing)) return existing;
  try {
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR, JSON.stringify(id));
    return id;
  } catch { return null; }
}
// Callsigns are NOT Bored login identities; only a real, unexpired Bored
// session on the same browser origin authorizes linking events to an account.
function boredAuth(): { id: string; token: string } | null {
  const value = stored(SESSION);
  if (!value || typeof value !== "object") return null;
  const s = value as { user?: { id?: string; is_anonymous?: boolean }; access_token?: string; expires_at?: number };
  if (s.user?.is_anonymous || !s.user?.id || !UUID.test(s.user.id)) return null;
  if (typeof s.access_token !== "string" || !s.access_token || !Number.isFinite(s.expires_at) ||
      (s.expires_at as number) * 1000 <= Date.now() + 45000) return null;
  return { id: s.user.id, token: s.access_token };
}
function outcome(sim: Sim): string {
  const h = sim.snapshot;
  if (h.operation?.state.status === "success") return "success";
  if (h.operation?.state.status === "failure") return "failure";
  if (h.resultKind === "crash") return "crash";
  if (h.resultKind === "wire" || h.resultKind === "landing") return "recovered";
  return "unfinished";
}

export function createFlightAnalytics(sim: Sim, getSettings: () => Settings): { dispose: () => void } {
  let enabled = analyticsEnabled();
  let run: Run | null = null;
  let lastSample = performance.now();
  let lastFlush = lastSample;
  let busy = false;
  let closed = false;
  const pending: FlightEvent[] = [];

  function sample(): void {
    const now = performance.now();
    const dt = Math.max(0, Math.min(now - lastSample, 2000));
    lastSample = now;
    if (!run || sim.phase !== "flying" || document.hidden) return;
    run.visible += dt;
    if (document.hasFocus() && now - run.lastInput < 60000) run.active += dt;
  }
  function emit(kind: FlightEvent["kind"], reason?: string): void {
    if (!enabled || !run) return;
    sample();
    const h = sim.snapshot;
    const details: FlightEvent["details"] = {
      source: "f14", version: APP_VERSION,
      device: matchMedia("(pointer: coarse)").matches ? "touch" : "desktop",
      embedded: window.parent !== window,
      mode: run.mode, aircraft: run.aircraft, multiplayer: run.multiplayer,
      kills: Math.max(0, Math.floor(h.dfKills || 0)),
      wave: Math.max(0, Math.floor(h.dfWave || 0)),
      outcome: outcome(sim),
    };
    if (reason) details.reason = reason;
    pending.push({
      id: crypto.randomUUID(), session_id: run.id, visitor_id: run.visitor,
      user_id: run.user, game: "f-14", kind,
      active_ms: Math.min(65000, Math.floor(run.active)),
      visible_ms: Math.min(65000, Math.floor(run.visible)), details,
    });
    run.active = 0; run.visible = 0;
    // Memory-only retries: don't leave player history on a shared computer.
    if (pending.length > 40) pending.splice(0, pending.length - 40);
  }
  async function flush(keepalive = false): Promise<void> {
    if (!enabled || busy || !pending.length) return;
    busy = true;
    let delivered = false;
    try {
      while (pending.length && enabled) {
        const event = pending[0], auth = boredAuth();
        // Never post a departed account's activity as someone else's.
        if (event.user_id && auth?.id !== event.user_id) {
          // The original account signed out or its session expired. Discard
          // stale account events instead of blocking later guest/new-user
          // events behind an unsendable queue entry.
          pending.shift();
          continue;
        }
        const response = await fetch(API, {
          method: "POST",
          headers: {
            ...(event.user_id ? { Authorization: "Bearer " + auth!.token } : {}),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "event", event }), keepalive,
        });
        if (!response.ok) {
          const code = await response.json().then(x => x?.code).catch(() => null);
          if (code !== "23505") break; // an idempotent retry
        }
        pending.shift(); delivered = true;
      }
    } catch { /* analytics must never interrupt flight */ }
    finally {
      busy = false;
      if (delivered && pending.length && !closed) queueMicrotask(() => { void flush(); });
    }
  }
  function start(): void {
    if (!enabled) return;
    lastSample = performance.now(); lastFlush = lastSample;
    const settings = getSettings(), auth = boredAuth();
    run = {
      id: crypto.randomUUID(), user: auth?.id ?? null, visitor: visitorId(),
      mode: settings.missionMode, aircraft: settings.aircraft,
      multiplayer: sim.netSnapshot.status === "online",
      lastInput: -Infinity, active: 0, visible: 0, interacted: false,
    };
    emit("start"); void flush();
  }
  function end(reason: string): void {
    if (!run) return;
    emit("end", reason); run = null;
    void flush(reason === "page_exit" || reason === "unmount");
  }
  let previousPhase: Phase = sim.phase;
  const unsubscribe = sim.subscribePhase(phase => {
    if (phase === "flying") {
      if (run && previousPhase === "flying") end("restart");
      if (!run) start();
    } else if (phase === "result") end("result");
    else if (phase === "menu") end("menu");
    else if (phase === "paused" && run) { emit("checkpoint", "paused"); void flush(); }
    previousPhase = phase;
  });
  const input = () => {
    if (!enabled || !run || sim.phase !== "flying") return;
    run.lastInput = performance.now();
    if (!run.interacted) { run.interacted = true; emit("interaction"); void flush(); }
  };
  const tick = window.setInterval(() => {
    if (!enabled) return;
    sample();
    if (run && run.user !== (boredAuth()?.id ?? null)) {
      end("account_change");
      if (sim.phase === "flying") start();
    }
    if (performance.now() - lastFlush >= 30000) {
      if (run) emit("checkpoint");
      lastFlush = performance.now(); void flush();
    }
  }, 1000);
  const visibility = () => {
    sample();
    if (document.hidden && run) { emit("checkpoint", "hidden"); void flush(true); }
  };
  const pageExit = () => { end("page_exit"); void flush(true); };
  const preference = () => {
    const next = analyticsEnabled();
    if (next === enabled) return;
    enabled = next;
    if (!next) { run = null; pending.length = 0; }
    else if (sim.phase === "flying") start();
  };
  function onOnline() { void flush(); }
  window.addEventListener("keydown", input, { passive: true });
  window.addEventListener("pointerdown", input, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("pagehide", pageExit);
  window.addEventListener("online", onOnline);
  window.addEventListener("storage", preference);
  window.addEventListener("f14:analytics-preference", preference);
  return { dispose() {
    if (closed) return;
    end("unmount"); closed = true;
    unsubscribe(); window.clearInterval(tick);
    window.removeEventListener("keydown", input);
    window.removeEventListener("pointerdown", input);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("pagehide", pageExit);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("storage", preference);
    window.removeEventListener("f14:analytics-preference", preference);
  } };
}
