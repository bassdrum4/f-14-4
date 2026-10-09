// HUD overlay: canvas-based pitch ladder + gauges + text readouts.
// Reads the Sim's HudSnapshot via useSyncExternalStore — no per-frame React
// state.

import { useEffect, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import type { Sim, HudSnapshot } from "../sim/engine";
import { DEFAULT_SEED } from "../sim/world";
import type { DaylightMode } from "../settings";

export function useHud(sim: Sim | null): HudSnapshot {
  const subscribe = (cb: () => void) => {
    if (!sim) return () => {};
    return sim.subscribeHud(() => cb());
  };
  return useSyncExternalStore(
    subscribe,
    () => (sim ? sim.snapshot : null),
    () => null,
  ) ?? EMPTY;
}

const EMPTY: HudSnapshot = {
  speedKt: 0, altFt: 0, mach: 0, headingDeg: 0, aoaDeg: 0, vsFpm: 0, gLoad: 1,
  throttlePct: 0, rpmPct: 0, ab: 0, abOn: false, gear: true, flaps: false, speedbrake: false,
  trim: 0.5, sweepDeg: 20, sweepable: false, stalled: false, onGround: true, catPhase: "ready",
  catProgress: 0, pitchDeg: 0, rollDeg: 0, cameraMode: "chase", flightTime: 0,
  distCarrierKm: 0, bearingCarrierDeg: 0, carrierName: "—", distFieldKm: 0,
  bearingFieldDeg: 0, worldLabel: "Procedural islands", worldSeed: DEFAULT_SEED,
  radarAltFt: 0,
  playerX: 0, playerZ: 0, playerHeadingDeg: 0, carrierMarkers: [],
  fieldX: 0, fieldZ: 0, worldExtent: 12000,
  localHour: 12, dayPhase: "day",
  dfActive: false, dfStrike: false, dfHull: 100, dfKills: 0, dfWave: 1, dfBandits: 0,
  dfNearestKm: 0, dfNearestBrgDeg: 0, enemyMarkers: [],
  dfThreat: false, gunFiring: false, dfHitT: 0, dfDamageT: 0, dfSpots: [],
  aircraftName: "F-14A TOMCAT",
  dfBombs: 0, dfBombsMax: 6, dfBombsAway: 0, dfCarrier: null,
  dfMissiles: 0, dfMissilesMax: 0,
  glide: null,
  dfBombsTracking: 0, dfBombTracks: [], dfDesignated: null,
  dfReleased: null, dfLanded: null, pod: false,
  remotes: [], netStatus: "idle", netRoom: "", netHost: false, netPilots: 0,
};

export function Hud({ sim, daylight, minimap }: {
  sim: Sim | null;
  daylight: DaylightMode;
  minimap: boolean;
}) {
  const hud = useHud(sim);
  return (
    <div className="hud-root">
      {hud.battle && <div className="battle-board">
        <strong>HEAD-TO-HEAD <span>ROOM {hud.netRoom}</span></strong>
        <div className="battle-columns"><span>PILOT</span><span>K / D</span><span>HULL</span></div>
        {[...hud.battle.pilots].sort((a,b) => b.kills - a.kills).map(p => <div key={p.id} className={"battle-row" + (p.id === hud.battleSelf ? " self" : "")}><span>{p.name.toUpperCase()}{p.shield ? " ◇" : ""}</span><span>{p.kills} / {p.deaths}</span><span>{p.ready ? p.hp > 0 ? `${p.hp}%` : `${Math.ceil(p.respawnIn)}s` : "LOBBY"}</span></div>)}
        {hud.battle.pilots.find(p => p.id === hud.battleSelf)?.shield && <small>SPAWN SHIELD — weapons unlock after 5 seconds</small>}
        {hud.battle.pilots.find(p => p.id === hud.battleSelf)?.hp === 0 && <small>DOWN — automatic airborne respawn</small>}
      </div>}
      {!hud.pod && <PitchLadder hud={hud} />}
      {!hud.pod && <TargetBoxes sim={sim} />}
      {hud.pod && <TargetPod sim={sim} />}
      {minimap && !hud.pod && <Minimap hud={hud} />}
      <div className="hud-left">
        <Gauge label="AIRSPEED" value={Math.round(hud.speedKt)} unit="KT" big />
        <Gauge label="MACH" value={hud.mach.toFixed(2)} />
        <Gauge label="AOA" value={hud.aoaDeg.toFixed(1)} unit="°" warn={Math.abs(hud.aoaDeg) > 13} />
        <Gauge label="G" value={hud.gLoad.toFixed(1)} warn={hud.gLoad > 7.5 || hud.gLoad < -1} />
        {hud.dfActive && (
          <Gauge label="HULL" value={hud.dfHull} unit="%" warn={hud.dfHull <= 30} />
        )}
        {hud.dfCarrier && hud.dfCarrier.status !== "sunk" && (
          <Gauge
            label={`CV ${hud.dfCarrier.name}`}
            value={hud.dfCarrier.hp}
            unit="%"
            warn={hud.dfCarrier.hp <= 34}
          />
        )}
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
        {/* Only the variable-geometry Tomcat sweeps; for the others it is a
            constant number that would just be cockpit furniture. */}
        {hud.sweepable && <Gauge label="W-SWEEP" value={String(hud.sweepDeg)} unit="°" />}
      </div>
      <div className="hud-bottom">
        <div className="hud-eng">
          {/* One throttle readout: the bar carries the percentage and the AB
              flag, so a separate RPM line would just repeat it. */}
          <ThrottleBar pct={hud.throttlePct} ab={hud.ab} />
        </div>
        <div className="hud-toggles">
          <Tag on={hud.gear} text="GEAR" warn={!hud.gear && !hud.onGround} />
          <Tag on={hud.flaps} text="FLAPS" />
          <Tag on={hud.speedbrake} text="S-BRAKE" />
          <Tag on={hud.trim > 0.52 || hud.trim < 0.48} text="TRIM" />
          {/* Armed but not lit reads amber: the switch is up, the throttle
              is not yet at max, so there is no burner yet. */}
          {(hud.abOn || hud.ab > 0.05) && (
            <Tag on={hud.ab > 0.05} warn={hud.abOn && hud.ab <= 0.05} text="AB" />
          )}
        </div>
        <div className="hud-nav">
          <div>CARRIER {hud.carrierName} · {hud.distCarrierKm.toFixed(1)} KM · {Math.round(hud.bearingCarrierDeg)}°</div>
          <div>FIELD {hud.distFieldKm.toFixed(1)} KM · {Math.round(hud.bearingFieldDeg)}°</div>
          {hud.dfActive && !hud.battle && (
            <div>
              {hud.dfStrike ? "TARGETS" : "BANDITS"} {hud.dfBandits} · {hud.dfStrike ? "CLEARED" : "TAGGED"} {hud.dfKills} · WAVE {hud.dfWave} · NEAR {hud.dfNearestKm.toFixed(1)} KM {Math.round(hud.dfNearestBrgDeg)}°
            </div>
          )}
          {hud.dfCarrier && (
            <div className="hud-cv">
              OPFOR CV {hud.dfCarrier.name} · {hud.dfCarrier.status.toUpperCase()} · {hud.dfCarrier.distKm.toFixed(1)} KM {Math.round(hud.dfCarrier.brgDeg)}°
              {hud.dfCarrier.inbound > 0 ? ` · ${hud.dfCarrier.inbound} TO LAUNCH` : ""}
            </div>
          )}
          {hud.netStatus === "online" && (
            <div className="hud-net">
              {hud.remotes.length === 0
                ? `ROOM ${hud.netRoom} · WAITING FOR WINGMEN`
                : hud.remotes
                    .slice(0, 3)
                    .map((r) => `WING ${r.name.toUpperCase()} ${r.km.toFixed(1)} KM ${Math.round(r.brgDeg)}°`)
                    .join(" · ")}
            </div>
          )}
          <div>
            {hud.dfBombs > 0
              ? `LGB ${hud.dfBombs}/${hud.dfBombsMax}${hud.dfBombsAway > 0 ? ` · ${hud.dfBombsAway} AWAY` : ""}${hud.dfBombsTracking > 0 ? ` · ${hud.dfBombsTracking} TRACKING` : ""} · [R] POD`
              : "STORES EMPTY"}
          </div>
          {hud.dfMissilesMax > 0 && (
            <div className={hud.dfMissiles > 0 ? "hud-laser" : undefined}>
              MSL {hud.dfMissiles}/{hud.dfMissilesMax} · [E] FIRE · SEEKS NEAREST
            </div>
          )}
          {hud.dfDesignated && (
            <div className="hud-laser">
              LASER {hud.dfDesignated.km.toFixed(1)} KM · RELEASE AGAIN TO RE-ENGAGE
            </div>
          )}
          <div className="hud-cam">
            {hud.aircraftName} · {hud.cameraMode.toUpperCase()} · [C] CAM · {formatClock(hud.localHour)} {daylight === "live" ? "HST" : "LOCAL"}
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
      {hud.banner && <div className="hud-banner">{hud.banner}</div>}
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
 * points of interest, which keeps the whole fleet on screen while zooming in
 * tightly on the jet.
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
    if (hud.dfCarrier) {
      maxR = Math.max(maxR, Math.hypot(hud.dfCarrier.x - hud.playerX, hud.dfCarrier.z - hud.playerZ));
    }
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

    // --- wingmen (multiplayer): cyan chevrons with callsigns ---
    for (const m of hud.remotes) {
      const x = px(m.x);
      const y = py(m.z);
      if (x < -20 || x > size + 20 || y < -20 || y > size + 20) continue;
      ctx.fillStyle = hud.battle ? "rgba(255, 130, 100, 0.95)" : "rgba(79, 210, 255, 0.95)";
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x + 3.6, y + 3);
      ctx.lineTo(x, y + 1.4);
      ctx.lineTo(x - 3.6, y + 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = hud.battle ? "rgba(255, 130, 100, 0.95)" : "rgba(150, 226, 255, 0.95)";
      ctx.font = "9px ui-monospace, monospace";
      ctx.fillText(m.name.toUpperCase(), x + 6, y + 3);
    }

    // --- bandits (dogfight mode): red dots ---
    ctx.fillStyle = "rgba(255, 91, 77, 0.95)";
    for (const m of hud.enemyMarkers) {
      const x = px(m.x);
      const y = py(m.z);
      if (x < -10 || x > size + 10 || y < -10 || y > size + 10) continue;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- hostile carrier: a red hull bar, grey once it is going down ---
    if (hud.dfCarrier) {
      const hx = px(hud.dfCarrier.x);
      const hy = py(hud.dfCarrier.z);
      const dead = hud.dfCarrier.status === "sunk" || hud.dfCarrier.status === "sinking";
      ctx.strokeStyle = dead ? "rgba(150, 165, 175, 0.6)" : "rgba(255, 91, 77, 0.95)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hx - 140 * scale, hy);
      ctx.lineTo(hx + 140 * scale, hy);
      ctx.stroke();
      ctx.fillStyle = dead ? "rgba(150, 165, 175, 0.75)" : "rgba(255, 130, 110, 0.95)";
      ctx.font = "9px ui-monospace, monospace";        ctx.fillText("OPFOR CV", hx + 6, hy - 4);
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
      {/* The world seed, visible in flight: two wingmen can confirm at a glance
          that they are looking at the same islands. */}
      <div className="hud-map-label">SEED {hud.worldSeed}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------

/**
 * Screen-space target designators, drawn from the sim's live snapshot at
 * frame rate (not tied to React renders): a bracket per bandit with range, a
 * diamond where the guns should lead, a hit marker when rounds connect, a red
 * pulse when we take hits, and a break warning when rounds are in the air.
 */
function TargetBoxes({ sim }: { sim: Sim | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const out = { x: 0, y: 0 };
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const cv = ref.current;
      if (!cv || !sim) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const hud = sim.snapshot;
      // The gun crosshair and the ordnance marks work in every mode (guns and
      // bombs are live on a cruise leg too), so they are drawn before the
      // dogfight-only symbology returns.
      drawGunCrosshair(ctx, w, h, sim, hud);
      drawOrdnance(ctx, w, h, sim, hud);
      drawApproach(ctx, w, h, hud);
      if (!hud.dfActive) return;

      // taking hits: a soft red wash over the view
      if (hud.dfDamageT > 0) {
        ctx.fillStyle = `rgba(255, 44, 24, ${(hud.dfDamageT * 0.3).toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }

      // rounds are in the air, from someone who has us in his cone
      if (hud.dfThreat) {
        ctx.fillStyle = "rgba(255, 91, 77, 0.95)";
        ctx.font = "600 13px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(hud.battle ? "MISSILE INBOUND — BREAK" : "GUNS - BREAK", w / 2, h * 0.33);
        ctx.textAlign = "left";
      }

      // the enemy boat: a bracket on the hull so it can be found and bombed
      const boat = hud.dfCarrier;
      if (boat && boat.status !== "sunk" && sim.projectPoint(boat.x, boat.y + 30, boat.z, out)) {
        const bx = out.x, by = out.y;
        if (bx > -80 && bx < w + 80 && by > -80 && by < h + 80) {
          const r = 18;
          ctx.strokeStyle = "rgba(255, 91, 77, 0.9)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx - r, by - r * 0.55); ctx.lineTo(bx - r, by - r); ctx.lineTo(bx - r * 0.55, by - r);
          ctx.moveTo(bx + r * 0.55, by - r); ctx.lineTo(bx + r, by - r); ctx.lineTo(bx + r, by - r * 0.55);
          ctx.moveTo(bx + r, by + r * 0.55); ctx.lineTo(bx + r, by + r); ctx.lineTo(bx + r * 0.55, by + r);
          ctx.moveTo(bx - r * 0.55, by + r); ctx.lineTo(bx - r, by + r); ctx.lineTo(bx - r, by + r * 0.55);
          ctx.stroke();
          ctx.fillStyle = "rgba(255, 150, 130, 0.95)";
          ctx.font = "10px ui-monospace, monospace";
          ctx.fillText(`${boat.name} ${boat.distKm.toFixed(1)}`, bx + r + 4, by + 3);
        }
      }

      for (const s of hud.dfSpots) {
        if (!sim.projectPoint(s.x, s.y, s.z, out)) continue;
        const tx = out.x, ty = out.y;
        if (tx < -60 || tx > w + 60 || ty < -60 || ty > h + 60) continue;
        const d = Math.max(s.km * 1000, 1);
        const r = Math.min(30, Math.max(9, 65000 / d + 8));
        const c = r * 0.45;
        ctx.strokeStyle = "rgba(255, 91, 77, 0.95)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx - r, ty - r + c); ctx.lineTo(tx - r, ty - r); ctx.lineTo(tx - r + c, ty - r);
        ctx.moveTo(tx + r - c, ty - r); ctx.lineTo(tx + r, ty - r); ctx.lineTo(tx + r, ty - r + c);
        ctx.moveTo(tx + r, ty + r - c); ctx.lineTo(tx + r, ty + r); ctx.lineTo(tx + r - c, ty + r);
        ctx.moveTo(tx - r + c, ty + r); ctx.lineTo(tx - r, ty + r); ctx.lineTo(tx - r, ty + r - c);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 150, 130, 0.9)";
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText(`${s.km.toFixed(1)}`, tx + r + 4, ty + 3);
      }

      // our rounds connected
      if (hud.dfHitT > 0) {
        const cx = w / 2, cy = h / 2;
        ctx.strokeStyle = `rgba(255, 240, 200, ${Math.min(1, hud.dfHitT).toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (const [sx, sy] of HIT_TICKS) {
          ctx.moveTo(cx + sx * 6, cy + sy * 6);
          ctx.lineTo(cx + sx * 13, cy + sy * 13);
        }
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [sim]);
  return <canvas ref={ref} className="hud-targets" />;
}

const HIT_TICKS = [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const;

/** Scratch for the HUD projections (one HUD canvas draws at a time). */
const CUE_P = { x: 0, y: 0 };
const ORD_P = { x: 0, y: 0 };

/**
 * Ordnance symbology for the chase/cockpit view: a diamond on every store still
 * in the air, a ring where the last one came off the rack, and a marked cross
 * where the last one went off. Without these a release is a shrug — the store is
 * small, dark and immediately behind the jet, and the fireball is out of frame.
 */
function drawOrdnance(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sim: Sim,
  hud: HudSnapshot,
): void {
  // --- stores still falling ---
  let labelled = false;
  for (const b of hud.dfBombTracks) {
    if (!sim.projectPoint(b.x, b.y, b.z, ORD_P)) continue;
    const x = ORD_P.x;
    const y = ORD_P.y;
    if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue;
    const r = 6;
    ctx.strokeStyle = "rgba(255,210,80,0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.stroke();
    if (!labelled) {
      labelled = true;
      ctx.fillStyle = "rgba(255,210,80,0.9)";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText(`ORD ${b.km.toFixed(1)} KM`, x + r + 4, y + 3);
    }
  }

  // --- the rack the last store left: an expanding ring that fades ---
  const rel = hud.dfReleased;
  if (rel && rel.age < 3 && sim.projectPoint(rel.x, rel.y, rel.z, ORD_P)) {
    const f = 1 - rel.age / 3;
    ctx.strokeStyle = `rgba(255,235,170,${(f * 0.9).toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ORD_P.x, ORD_P.y, 8 + rel.age * 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  // --- and where the last weapon went off ---
  const land = hud.dfLanded;
  if (land && land.age < 9 && sim.projectPoint(land.x, land.y + 8, land.z, ORD_P)) {
    const f = Math.max(0, 1 - land.age / 9);
    const x = ORD_P.x;
    const y = ORD_P.y;
    if (x > -60 && x < w + 60 && y > -60 && y < h + 60) {
      const water = land.kind === "water";
      const col = water ? "150,220,255" : "255,150,80";
      const g = 9;
      ctx.strokeStyle = `rgba(${col},${(f * 0.95).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - g, y - g);
      ctx.lineTo(x + g, y + g);
      ctx.moveTo(x + g, y - g);
      ctx.lineTo(x - g, y + g);
      ctx.stroke();
      ctx.strokeRect(x - g - 3, y - g - 3, (g + 3) * 2, (g + 3) * 2);
      ctx.fillStyle = `rgba(${col},${(f * 0.9).toFixed(3)})`;
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText(water ? "SPLASH" : "IMPACT", x + g + 7, y + 3);
    }
  }
}

/**
 * Carrier approach guidance: the boat's simulated IFLOLS, drawn as a HUD
 * glideslope ladder. Green (or amber/red) says where the 4° path is relative
 * to the jet — fly the nose onto the ladder and you arrive over the wires at
 * a trappable height. Lineup ticks sit on the horizon line.
 */
function drawApproach(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hud: HudSnapshot,
): void {
  const g = hud.glide;
  if (!g || hud.pod) return;
  const rangeKm = g.rangeM / 1000;
  // The ladder grows with range, like the real optical glideslope: readable at
  // 3 km, still legible inside 500 m.
  const scale = Math.max(0.55, Math.min(2.1, 0.85 + rangeKm * 0.45));
  const cx = w / 2;
  const cy = h * 0.46; // just above centre: the ladder hangs below the nose
  const dev = g.deviationM; // + = we are above the path
  const unit = 34 * scale; // px per degree of deviation
  const pxPerM = unit / 125; // ~125 m of height error per degree at 3 km

  // --- the "meatball": the path itself, drawn as a stack of rungs ---
  // Rungs every ~30 m of path height from +3° to -3°, centred on where the
  // 4° line passes through the jet's position.
  const onSlope = Math.abs(dev) < 17;
  const slopeColor = onSlope
    ? "120,255,140"
    : dev > 0
      ? "255,210,80" // above the ball: expect a bolter, come down
      : "255,91,77"; // below the ball: ramp strike, get up
  ctx.strokeStyle = `rgba(${slopeColor},0.95)`;
  ctx.lineWidth = 3;
  const halfRun = 44 * scale;
  const runCount = 4;
  for (let i = -runCount; i <= runCount; i++) {
    if (i === 0) continue;
    const y = cy + i * unit * 0.55;
    if (y < h * 0.12 || y > h * 0.82) continue;
    ctx.beginPath();
    ctx.moveTo(cx - halfRun, y);
    ctx.lineTo(cx + halfRun, y);
    ctx.stroke();
  }
  // the datum bar — level with the horizon when exactly on the 4° path
  ctx.lineWidth = 4;
  ctx.strokeStyle = `rgba(${slopeColor},1)`;
  ctx.beginPath();
  ctx.moveTo(cx - halfRun * 1.25, cy - dev * pxPerM);
  ctx.lineTo(cx + halfRun * 1.25, cy - dev * pxPerM);
  ctx.stroke();

  // --- lineup: lateral ticks flanking centre, at the datum height ---
  const lineupY = cy - dev * pxPerM;
  const lx = THREE.MathUtils.clamp(g.lineupM * 1.6 * scale, -110 * scale, 110 * scale);
  const onLineup = Math.abs(g.lineupM) < 12;
  ctx.lineWidth = 3;
  ctx.strokeStyle = onLineup ? "rgba(120,255,140,0.95)" : "rgba(255,210,80,0.9)";
  ctx.beginPath();
  ctx.moveTo(cx + lx - 10, lineupY - 12 * scale);
  ctx.lineTo(cx + lx, lineupY);
  ctx.lineTo(cx + lx - 10, lineupY + 12 * scale);
  ctx.stroke();

  // --- the ball call ---
  ctx.fillStyle = `rgba(${slopeColor},0.95)`;
  ctx.font = "600 12px ui-monospace, monospace";
  ctx.textAlign = "center";
  const call =
    Math.abs(dev) < 10
      ? "BALL"
      : dev > 0
        ? `HIGH ${Math.round(dev)} M`
        : `LOW ${Math.round(-dev)} M`;
  ctx.fillText(call, cx, cy + unit * runCount * 0.55 + 26);
  // The speed call: the approach is flown on AoA, so the call is the AoA error
  // against the on-speed indexer (with the knots beside it, since that is the
  // number a pilot actually flies).
  const aoaErr = hud.aoaDeg - g.onSpeedAoaDeg;
  const speedErr = hud.speedKt - g.onSpeedKt;
  const speedCall =
    Math.abs(aoaErr) < 1.2
      ? `ON SPEED ${Math.round(g.onSpeedKt)} KT`
      : `${speedErr > 0 ? "FAST" : "SLOW"} ${Math.abs(Math.round(speedErr))} KT`;
  ctx.fillText(
    `CV ${g.lineupM >= 0 ? "R" : "L"} ${Math.abs(Math.round(g.lineupM))} M · ${rangeKm.toFixed(2)} KM · ${speedCall}`,
    cx,
    cy + unit * runCount * 0.55 + 42,
  );
  ctx.textAlign = "left";
}

/**
 * The gun crosshair: a pipper placed where our own rounds will actually be,
 * computed from the live ballistics rather than assumed to fly straight down
 * the bore (they drop and slow, so an un-led pipper misses low and long).
 *
 * The colour is the whole point: red when the burst would land on a bandit, a
 * strike target or the enemy carrier, amber when it would hit the ground or
 * the sea short of anything, green when the line of fire is clear.
 */
function drawGunCrosshair(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sim: Sim,
  hud: HudSnapshot,
): void {
  // Nothing to shoot from the deck, and the pod draws its own gate.
  if (hud.onGround || hud.pod) return;
  const cue = sim.gunCue();
  if (!sim.projectPoint(cue.x, cue.y, cue.z, CUE_P)) return;
  const x = CUE_P.x;
  const y = CUE_P.y;
  if (x < -60 || x > w + 60 || y < -60 || y > h + 60) return;

  const locked = cue.hit === "bandit" || cue.hit === "ship" || cue.hit === "target";
  const color = locked ? "255,64,54" : cue.hit === "ground" ? "255,182,72" : "130,255,150";
  const alpha = cue.live ? 0.95 : 0.45;

  // --- the bullet ladder ---
  // Dots along where the rounds will actually fly, muzzle to solution point:
  // the trajectory is drawn before the trigger is squeezed. Faint at rest,
  // bright while firing — the answer to "where are my bullets going to go".
  const path = sim.gunPath();
  const hot = hud.gunFiring ? 1 : 0.45;
  for (let i = 1; i < path.n; i++) {
    const p = path.points[i];
    if (!sim.projectPoint(p.x, p.y, p.z, CUE_P)) continue;
    const px = CUE_P.x;
    const py = CUE_P.y;
    if (px < -40 || px > w + 40 || py < -40 || py > h + 40) continue;
    const f = i / path.n; // 0 near the muzzle -> 1 at the solution point
    const a = Math.max(0.08, alpha * hot * (0.6 - 0.42 * f));
    ctx.fillStyle = `rgba(${color},${a.toFixed(3)})`;
    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
  }

  const r = locked ? 15 : 12;
  ctx.save();
  ctx.strokeStyle = `rgba(${color},${alpha})`;
  ctx.lineWidth = locked ? 2.4 : 1.6;
  // corner ticks, then the cross arms with a centre gap
  for (const [dx, dy] of HIT_TICKS) {
    ctx.beginPath();
    ctx.moveTo(x + dx * (r - 5), y + dy * (r - 5));
    ctx.lineTo(x + dx * r, y + dy * r);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x - r * 1.6, y); ctx.lineTo(x - r * 0.55, y);
  ctx.moveTo(x + r * 0.55, y); ctx.lineTo(x + r * 1.6, y);
  ctx.moveTo(x, y - r * 1.6); ctx.lineTo(x, y - r * 0.55);
  ctx.moveTo(x, y + r * 0.55); ctx.lineTo(x, y + r * 1.6);
  ctx.stroke();
  ctx.fillStyle = `rgba(${color},${alpha})`;
  ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
  if (locked) {
    // in the cone: a ring makes the "shoot now" state unmistakable
    ctx.beginPath();
    ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.font = "10px ui-monospace, monospace";
  ctx.fillStyle = `rgba(${color},${cue.live ? 0.9 : 0.55})`;
  ctx.fillText(`${(cue.range / 1000).toFixed(1)} KM`, x + r * 2 + 5, y + 3);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Target pod
// ---------------------------------------------------------------------------

/**
 * Target-pod view overlay: the wide sensor frame, a cursor-following
 * designation gate, and a marker on whatever the laser is currently painting.
 * Drawn from the live snapshot at frame rate, like the target designators.
 */
function TargetPod({ sim }: { sim: Sim | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -1, y: -1 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let raf = 0;
    const out = { x: 0, y: 0 };
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const cv = ref.current;
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = cv.getBoundingClientRect();
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // read the live snapshot: the pod overlay redraws every frame and does
      // not want a React re-render per designation change
      const hud = sim?.snapshot;
      if (!hud) return;

      // sensor frame: corner brackets, as a targeting pod presents its field
      ctx.strokeStyle = "rgba(120,255,140,0.75)";
      ctx.lineWidth = 2;
      const m = 34, arm = 34;
      ctx.beginPath();
      ctx.moveTo(m, m + arm); ctx.lineTo(m, m); ctx.lineTo(m + arm, m);
      ctx.moveTo(w - m - arm, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + arm);
      ctx.moveTo(w - m, h - m - arm); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m - arm, h - m);
      ctx.moveTo(m + arm, h - m); ctx.lineTo(m, h - m); ctx.lineTo(m, h - m - arm);
      ctx.stroke();

      // centre cross
      ctx.strokeStyle = "rgba(120,255,140,0.5)";
      ctx.beginPath();
      ctx.moveTo(w / 2 - 16, h / 2); ctx.lineTo(w / 2 - 5, h / 2);
      ctx.moveTo(w / 2 + 5, h / 2); ctx.lineTo(w / 2 + 16, h / 2);
      ctx.moveTo(w / 2, h / 2 - 16); ctx.lineTo(w / 2, h / 2 - 5);
      ctx.moveTo(w / 2, h / 2 + 5); ctx.lineTo(w / 2, h / 2 + 16);
      ctx.stroke();

      // designation gate under the cursor
      const px = pointer.current.x - rect.left;
      const py = pointer.current.y - rect.top;
      if (px >= 0 && px <= w && py >= 0 && py <= h) {
        const g = 26;
        ctx.strokeStyle = "rgba(255,210,80,0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px - g, py - g + 9); ctx.lineTo(px - g, py - g); ctx.lineTo(px - g + 9, py - g);
        ctx.moveTo(px + g - 9, py - g); ctx.lineTo(px + g, py - g); ctx.lineTo(px + g, py - g + 9);
        ctx.moveTo(px + g, py + g - 9); ctx.lineTo(px + g, py + g); ctx.lineTo(px + g - 9, py + g);
        ctx.moveTo(px - g + 9, py + g); ctx.lineTo(px - g, py + g); ctx.lineTo(px - g, py + g - 9);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,210,80,0.95)";
        ctx.fillRect(px - 1, py - 1, 2, 2);
      }

      // weapons in the air. They cannot be seen by the sensor itself — the pod
      // head is forward of the racks, so a bomb off the rail sits behind the
      // sensor — so the pod draws the symbology instead: a gate on the weapon
      // while it is in view, and an edge marker pointing at it while it is not.
      const tracks = hud.dfBombTracks;
      let labeled = false;
      for (const b of tracks) {
        const info = sim?.projectOffscreen(b.x, b.y, b.z, out, 46);
        if (!info) continue;
        const r = info.inside ? 9 : 7;
        ctx.strokeStyle = info.inside ? "rgba(255,210,80,0.95)" : "rgba(255,210,80,0.6)";
        ctx.lineWidth = info.inside ? 2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(out.x, out.y - r);
        ctx.lineTo(out.x + r, out.y);
        ctx.lineTo(out.x, out.y + r);
        ctx.lineTo(out.x - r, out.y);
        ctx.closePath();
        ctx.stroke();
        if (info.inside && !labeled) {
          labeled = true;
          ctx.fillStyle = "rgba(255,210,80,0.95)";
          ctx.font = "10px ui-monospace, monospace";
          ctx.fillText(`LGB ${b.km.toFixed(1)} KM`, out.x + r + 5, out.y + 3);
        }
      }

      // the laser spot itself, if it is inside the sensor's field of view
      const d = hud.dfDesignated;
      if (d && sim && sim.projectPoint(d.x, d.y + 2, d.z, out)) {
        const r = 11;
        ctx.strokeStyle = "rgba(255,91,77,0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(out.x, out.y - r); ctx.lineTo(out.x + r, out.y);
        ctx.lineTo(out.x, out.y + r); ctx.lineTo(out.x - r, out.y);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,140,110,0.95)";
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText(`LASER ${d.km.toFixed(1)} KM`, out.x + r + 5, out.y + 3);
      }

      // readouts
      ctx.fillStyle = "rgba(120,255,140,0.9)";
      ctx.font = "600 12px ui-monospace, monospace";
      ctx.fillText("TARGET POD", m, m - 10);
      ctx.fillStyle = "rgba(214,236,255,0.85)";
      ctx.font = "11px ui-monospace, monospace";
      ctx.fillText("DRAG TO SLEW · RELEASE OVER A TARGET TO LAUNCH", m, h - m + 22);
      ctx.fillText("[R] OR [C] TO LEAVE THE POD", m, h - m + 38);
      ctx.fillStyle = "rgba(255,210,80,0.9)";
      ctx.fillText(
        `LGB ${hud.dfBombs}/${hud.dfBombsMax}` +
          (hud.dfBombsAway > 0 ? ` · ${hud.dfBombsAway} AWAY` : "") +
          (hud.dfBombsTracking > 0 ? ` · ${hud.dfBombsTracking} TRACKING` : ""),
        w - m - 150,
        m - 10,
      );
      if (hud.dfMissilesMax > 0) {
        ctx.fillStyle = "rgba(255,140,110,0.9)";
        ctx.fillText(
          `MSL ${hud.dfMissiles}/${hud.dfMissilesMax} · [E]` +
            (hud.dfMissiles === 0 ? " — RAILS EMPTY" : ""),
          w - m - 150,
          m + 8,
        );
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [sim]);

  return <canvas ref={ref} className="hud-pod" />;
}

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
      // rollDeg is negative for a right bank (starboard wing down). The ladder
      // is world-fixed, so it must counter-rotate: banking right lifts the
      // ladder's right end up the same way the real horizon appears to.
      ctx.rotate(roll);

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
