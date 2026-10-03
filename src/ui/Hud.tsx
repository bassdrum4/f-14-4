// HUD overlay: canvas-based pitch ladder + gauges + text readouts.
// Reads the Game's HudSnapshot via useSyncExternalStore — no per-frame React
// state.

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Game, HudSnapshot } from "../game/game";
import type { DaylightMode } from "../settings";

export function useHud(game: Game | null): HudSnapshot {
  const subscribe = (cb: () => void) => {
    if (!game) return () => {};
    return game.subscribeHud(() => cb());
  };
  return useSyncExternalStore(
    subscribe,
    () => (game ? game.snapshot : null),
    () => null,
  ) ?? EMPTY;
}

const EMPTY: HudSnapshot = {
  speedKt: 0, altFt: 0, mach: 0, headingDeg: 0, aoaDeg: 0, vsFpm: 0, gLoad: 1,
  throttlePct: 0, rpmPct: 0, ab: 0, gear: true, flaps: false, speedbrake: false,
  trim: 0.5, sweepDeg: 20, stalled: false, onGround: true, catPhase: "ready",
  catProgress: 0, pitchDeg: 0, rollDeg: 0, cameraMode: "chase", flightTime: 0,
  distCarrierKm: 0, bearingCarrierDeg: 0, carrierName: "—", distFieldKm: 0,
  bearingFieldDeg: 0, worldLabel: "Procedural islands", worldAttribution: null,
  radarAltFt: 0,
  playerX: 0, playerZ: 0, playerHeadingDeg: 0, carrierMarkers: [],
  fieldX: 0, fieldZ: 0, worldExtent: 12000,
  localHour: 12, dayPhase: "day",
};

export function Hud({ game, daylight, minimap }: {
  game: Game | null;
  daylight: DaylightMode;
  minimap: boolean;
}) {
  const hud = useHud(game);
  return (
    <div className="hud-root">
      <PitchLadder hud={hud} />
      {minimap && <Minimap hud={hud} />}
      <div className="hud-left">
        <Gauge label="AIRSPEED" value={Math.round(hud.speedKt)} unit="KT" big />
        <Gauge label="MACH" value={hud.mach.toFixed(2)} />
        <Gauge label="AOA" value={hud.aoaDeg.toFixed(1)} unit="°" warn={Math.abs(hud.aoaDeg) > 13} />
        <Gauge label="G" value={hud.gLoad.toFixed(1)} warn={hud.gLoad > 7.5 || hud.gLoad < -1} />
      </div>
      <div className="hud-right">
        <Gauge label="ALT" value={Math.round(hud.altFt).toLocaleString()} unit="FT" big />
        <Gauge
          label="RALT"
          value={Math.round(hud.radarAltFt).toLocaleString()}
          unit="FT"
          warn={hud.radarAltFt < 500}
        />
        <Gauge label="V/S" value={(hud.vsFpm > 0 ? "+" : "") + Math.round(hud.vsFpm)} unit="FPM" />
        <Gauge label="HDG" value={String(Math.round(hud.headingDeg)).padStart(3, "0")} unit="°" />
        <Gauge label="W-SWEEP" value={String(hud.sweepDeg)} unit="°" />
      </div>
      <div className="hud-bottom">
        <div className="hud-eng">
          <ThrottleBar pct={hud.throttlePct} ab={hud.ab} />
          <span className="hud-rpm">RPM {hud.rpmPct}%</span>
        </div>
        <div className="hud-toggles">
          <Tag on={hud.gear} text="GEAR" warn={!hud.gear && !hud.onGround} />
          <Tag on={hud.flaps} text="FLAPS" />
          <Tag on={hud.speedbrake} text="S-BRAKE" />
          <Tag on={hud.trim > 0.52 || hud.trim < 0.48} text="TRIM" />
        </div>
        <div className="hud-nav">
          <div>CARRIER {hud.carrierName} · {hud.distCarrierKm.toFixed(1)} KM · {Math.round(hud.bearingCarrierDeg)}°</div>
          <div>FIELD {hud.distFieldKm.toFixed(1)} KM · {Math.round(hud.bearingFieldDeg)}°</div>
          <div className="hud-cam">
            {hud.cameraMode.toUpperCase()} CAM · C to cycle · {formatClock(hud.localHour)} {daylight === "live" ? "HST" : "LOCAL"}
          </div>
        </div>
      </div>
      {hud.stalled && <div className="hud-stall">STALL</div>}
      {hud.catPhase === "ready" && (
        <div className="hud-cat ready">HOLD [SPACE] — CATAPULT LAUNCH</div>
      )}
      {hud.catPhase === "charging" && (
        <div className="hud-cat charging">CAT TENSION {Math.round(hud.catProgress * 100)}%</div>
      )}
      {hud.ab > 0.05 && <div className="hud-ab">AB</div>}
      {hud.banner && <div className="hud-banner">{hud.banner}</div>}
      {hud.worldAttribution && <div className="hud-credit">{hud.worldAttribution}</div>}
    </div>
  );
}

function Gauge({
  label, value, unit, big, warn,
}: { label: string; value: string | number; unit?: string; big?: boolean; warn?: boolean }) {
  return (
    <div className={"hud-gauge" + (big ? " big" : "") + (warn ? " warn" : "")}>
      <span className="hud-gauge-label">{label}</span>
      <span className="hud-gauge-value">
        {value}
        {unit ? <em>{unit}</em> : null}
      </span>
    </div>
  );
}

function ThrottleBar({ pct, ab }: { pct: number; ab: number }) {
  return (
    <div className="hud-throttle">
      <div className="hud-throttle-fill" style={{ width: `${pct}%` }} />
      {ab > 0.05 && <div className="hud-throttle-ab" style={{ width: `${Math.min(100, pct * 0.6)}%` }} />}
      <span>THR {pct}%{ab > 0.05 ? " AB" : ""}</span>
    </div>
  );
}

function Tag({ on, text, warn }: { on: boolean; text: string; warn?: boolean }) {
  return <span className={"hud-tag" + (on ? " on" : "") + (warn ? " warn" : "")}>{text}</span>;
}

function formatClock(hours: number): string {
  const h = Math.floor(((hours % 24) + 24) % 24);
  const m = Math.floor((hours - Math.floor(hours)) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Minimap
// ---------------------------------------------------------------------------

/**
 * North-up tactical map: carriers, the airfield and the jet, drawn on a 2D
 * canvas. Positions come straight from the world definition, so the map always
 * agrees with the sim. Range is picked automatically from the spread of the
 * points of interest, which keeps every carrier on screen in the archipelago
 * while zooming in tightly around Kauai.
 */
function Minimap({ hud }: { hud: HudSnapshot }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const size = 176;
    const dpr = Math.min(window.devicePixelRatio, 2);
    cv.width = size * dpr;
    cv.height = size * dpr;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // --- range: cover the furthest point of interest, with a little margin ---
    let maxR = 4000;
    for (const m of hud.carrierMarkers) {
      maxR = Math.max(maxR, Math.hypot(m.x - hud.playerX, m.z - hud.playerZ));
    }
    maxR = Math.max(maxR, Math.hypot(hud.fieldX - hud.playerX, hud.fieldZ - hud.playerZ));
    const range = maxR * 1.15;
    const scale = (size / 2 - 10) / range;

    // world XZ -> canvas. North (-Z) is up, east (+X) is right.
    const px = (x: number) => size / 2 + (x - hud.playerX) * scale;
    const py = (z: number) => size / 2 + (z - hud.playerZ) * scale;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // sea
    ctx.fillStyle = "rgba(6, 22, 34, 0.72)";
    ctx.fillRect(0, 0, size, size);

    // graticule
    ctx.strokeStyle = "rgba(120, 200, 255, 0.10)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const p = (size / 4) * i;
      ctx.beginPath();
      ctx.moveTo(p, 0); ctx.lineTo(p, size);
      ctx.moveTo(0, p); ctx.lineTo(size, p);
      ctx.stroke();
    }

    // range rings at 1/3 and 2/3 of the covered range
    ctx.strokeStyle = "rgba(120, 255, 140, 0.16)";
    for (const f of [1 / 3, 2 / 3]) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, (size / 2 - 10) * f, 0, Math.PI * 2);
      ctx.stroke();
    }

    // --- world extent box (the terrain mesh edge) ---
    const e = hud.worldExtent;
    ctx.strokeStyle = "rgba(160, 200, 230, 0.22)";
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(px(-e), py(-e), e * 2 * scale, e * 2 * scale);
    ctx.setLineDash([]);

    // --- airfield: a short bar showing the runway orientation (east/west) ---
    ctx.strokeStyle = "rgba(255, 210, 80, 0.95)";
    ctx.lineWidth = 2;
    const fx = px(hud.fieldX);
    const fy = py(hud.fieldZ);
    const rw = 1100 * scale;
    ctx.beginPath();
    ctx.moveTo(fx - rw, fy);
    ctx.lineTo(fx + rw, fy);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 210, 80, 0.95)";
    ctx.font = "9px ui-monospace, monospace";
    ctx.fillText("FIELD", fx + rw + 4, fy + 3);

    // --- carriers ---
    ctx.font = "9px ui-monospace, monospace";
    for (const m of hud.carrierMarkers) {
      const x = px(m.x);
      const y = py(m.z);
      if (x < -20 || x > size + 20 || y < -20 || y > size + 20) continue;
      ctx.fillStyle = m.near ? "rgba(120, 255, 140, 1)" : "rgba(150, 200, 230, 0.8)";
      ctx.beginPath();
      ctx.arc(x, y, m.near ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(m.name, x + 6, y + 3);
    }

    // --- player: heading-up triangle at the centre ---
    const hdg = (hud.playerHeadingDeg * Math.PI) / 180;
    ctx.save();
    ctx.translate(size / 2, size / 2);
    // heading 0 = north = up, so rotate by the heading
    ctx.rotate(hdg);
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 2.5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // --- frame + compass tick ---
    ctx.strokeStyle = "rgba(120, 255, 140, 0.45)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
    ctx.fillStyle = "rgba(120, 255, 140, 0.8)";
    ctx.font = "9px ui-monospace, monospace";
    ctx.fillText("N", size / 2 - 3, 11);
    ctx.fillText(`${(range / 1000).toFixed(0)}km`, 6, size - 6);
  }, [hud]);

  return (
    <div className="hud-map">
      <canvas ref={ref} className="hud-map-canvas" />
      <span className="hud-map-label">
        {hud.dayPhase === "night" ? "NIGHT" : hud.dayPhase === "twilight" ? "TWILIGHT" : hud.dayPhase === "golden" ? "GOLDEN" : "DAY"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------

function PitchLadder({ hud }: { hud: HudSnapshot }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const cv = ref.current;
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w * dpr || cv.height !== h * dpr) {
        cv.width = w * dpr;
        cv.height = h * dpr;
      }
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;
      const pxPerDeg = Math.min(7, h / 90);
      const roll = (hud.rollDeg * Math.PI) / 180;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-roll);

      ctx.strokeStyle = "rgba(120,255,140,0.9)";
      ctx.fillStyle = "rgba(120,255,140,0.9)";
      ctx.lineWidth = 1.5;
      ctx.font = "11px monospace";

      // horizon line
      const hy = hud.pitchDeg * pxPerDeg;
      ctx.beginPath();
      ctx.moveTo(-w * 0.32, hy);
      ctx.lineTo(-40, hy);
      ctx.moveTo(40, hy);
      ctx.lineTo(w * 0.32, hy);
      ctx.stroke();
      // hash marks below horizon
      for (let i = 1; i <= 3; i++) {
        const yy = hy + i * 10 * pxPerDeg;
        const half = 28 + i * 6;
        ctx.beginPath();
        ctx.moveTo(-half, yy);
        ctx.lineTo(half, yy);
        ctx.stroke();
      }
      // ladder lines above/below in 10 deg steps
      for (let d = -90; d <= 90; d += 10) {
        if (d === 0) continue;
        const yy = hy - d * pxPerDeg;
        if (Math.abs(yy) > h * 0.48) continue;
        const half = 34;
        ctx.beginPath();
        ctx.moveTo(-half, yy);
        ctx.lineTo(-8, yy);
        ctx.moveTo(8, yy);
        ctx.lineTo(half, yy);
        ctx.stroke();
        ctx.fillText(String(d), half + 6, yy + 4);
        ctx.fillText(String(d), -half - 22, yy + 4);
      }
      ctx.restore();

      // fixed waterline symbol
      ctx.strokeStyle = "rgba(255,220,80,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy);
      ctx.lineTo(cx - 8, cy);
      ctx.lineTo(cx - 4, cy + 6);
      ctx.lineTo(cx + 4, cy + 6);
      ctx.lineTo(cx + 8, cy);
      ctx.lineTo(cx + 26, cy);
      ctx.stroke();
      // flight path marker (velocity vector, simplified)
      const fpa = Math.atan2(hud.vsFpm / 196.85, Math.max(hud.speedKt / 1.94384, 8)) * (180 / Math.PI);
      const fpy = cy - (hud.pitchDeg - fpa) * pxPerDeg;
      ctx.strokeStyle = "rgba(120,255,140,0.95)";
      ctx.beginPath();
      ctx.arc(cx, fpy, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 12, fpy); ctx.lineTo(cx - 5, fpy);
      ctx.moveTo(cx + 5, fpy); ctx.lineTo(cx + 12, fpy);
      ctx.moveTo(cx, fpy - 8); ctx.lineTo(cx, fpy - 5);
      ctx.stroke();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [hud]);
  return <canvas ref={ref} className="hud-ladder" />;
}
