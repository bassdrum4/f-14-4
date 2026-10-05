// UI chrome: main menu, pause, settings, controls, flight results.
// React only; the canvas keeps rendering behind these overlays.

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Game, Phase, WorldState } from "../game/game";
import type { WorldId } from "../sim/world";
import { Hud, useHud } from "./Hud";
import {
  ACTION_LABELS, DAYLIGHT_LABELS, DEFAULT_BINDINGS, GAME_MODE_LABELS, keyLabel,
  type Action, type DaylightMode, type GameMode, type Quality, type Settings,
} from "../settings";

function usePhase(game: Game | null): Phase {
  const subscribe = (cb: () => void) =>
    game ? game.subscribePhase(() => cb()) : () => {};
  return useSyncExternalStore(
    subscribe,
    () => (game ? game.phase : ("menu" as Phase)),
    () => "menu" as Phase,
  );
}

const READY_WORLD: WorldState = { status: "ready", id: "archipelago" };

function useWorld(game: Game | null): WorldState {
  const subscribe = (cb: () => void) =>
    game ? game.subscribeWorld(() => cb()) : () => {};
  return useSyncExternalStore(
    subscribe,
    () => (game ? game.worldStateSnapshot : READY_WORLD),
    () => READY_WORLD,
  );
}

export function UiRoot({ game, settings, onSettings }: {
  game: Game | null;
  settings: Settings;
  onSettings: (s: Settings) => void;
}) {
  const phase = usePhase(game);
  return (
    <>
      {phase === "menu" && (
        <MainMenu game={game} settings={settings} onSettings={onSettings} />
      )}
      {phase !== "menu" && (
        <Hud game={game} daylight={settings.daylight} minimap={settings.minimap} />
      )}
      {phase === "paused" && game && (
        <PauseMenu game={game} settings={settings} onSettings={onSettings} />
      )}
      {phase === "result" && game && <ResultOverlay game={game} />}
    </>
  );
}

// ---------------------------------------------------------------------------

function Btn({ children, onClick, primary }: {
  children: React.ReactNode; onClick?: () => void; primary?: boolean;
}) {
  return (
    <button className={"menu-btn" + (primary ? " primary" : "")} onClick={onClick}>
      {children}
    </button>
  );
}

type Screen = "main" | "settings" | "controls";

function MainMenu({ game, settings, onSettings }: {
  game: Game | null; settings: Settings; onSettings: (s: Settings) => void;
}) {
  const [screen, setScreen] = useState<Screen>("main");
  const world = useWorld(game);
  const [switching, setSwitching] = useState(false);
  const busy = switching || world.status === "loading";

  const pickWorld = async (kind: WorldId) => {
    if (!game || busy || kind === world.id) return;
    setSwitching(true);
    const err = await game.setWorldKind(kind);
    if (!err) onSettings({ ...settings, world: kind });
    setSwitching(false);
  };

  return (
    <div className="ui-root menu-bg">
      <div className="menu-panel">
        <div className="menu-title">
          <span className="menu-kicker">VF-84 JOLLY ROGERS</span>
          <h1>F-14 TOMCAT</h1>
          <span className="menu-sub">CARRIER FLIGHT SIMULATOR</span>
        </div>

        {screen === "main" && (
          <>
            <div className="menu-buttons">
              <Btn primary onClick={() => game?.startMission("carrier")}>
                CAT SHOT — CARRIER LAUNCH
              </Btn>
              <Btn onClick={() => game?.startMission("airfield")}>
                RUNWAY — ISLAND AIRFIELD
              </Btn>
              <Btn onClick={() => setScreen("settings")}>SETTINGS</Btn>
              <Btn onClick={() => setScreen("controls")}>CONTROLS</Btn>
            </div>
            <div className="menu-world">
              <span className="menu-world-label">WORLD</span>
              <div className="menu-world-chips">
                <button
                  className={"world-chip" + (world.id === "archipelago" ? " on" : "")}
                  disabled={busy}
                  onClick={() => void pickWorld("archipelago")}
                >
                  PROCEDURAL ISLANDS
                </button>
                <button
                  className={"world-chip" + (world.id === "kauai" ? " on" : "")}
                  disabled={busy}
                  onClick={() => void pickWorld("kauai")}
                >
                  KAUAI · LIVE MAPBOX TERRAIN
                </button>
              </div>
              {world.status === "loading" && (
                <div className="menu-world-note">Fetching Mapbox terrain &amp; satellite imagery…</div>
              )}
              {world.status === "error" && <div className="menu-world-note err">{world.error}</div>}
              {world.id === "kauai" && world.status === "ready" && (
                <div className="menu-world-credit">Terrain &amp; imagery © Mapbox © OpenStreetMap</div>
              )}
            </div>
          </>
        )}
        {screen === "settings" && (
          <SettingsPanel settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />
        )}
        {screen === "controls" && (
          <ControlsPanel settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />
        )}
      </div>
      <div className="menu-footer">
        Mouse drag — look around · C — camera · ESC — pause
      </div>
    </div>
  );
}

function PauseMenu({ game, settings, onSettings }: {
  game: Game; settings: Settings; onSettings: (s: Settings) => void;
}) {
  const [screen, setScreen] = useState<Screen>("main");
  return (
    <div className="ui-root pause-bg">
      <div className="menu-panel small">
        <h2 className="menu-h2">PAUSED</h2>
        {screen === "main" && (
          <div className="menu-buttons">
            <Btn primary onClick={() => game.resume()}>RESUME</Btn>
            <Btn onClick={() => game.restart()}>RESTART FLIGHT</Btn>
            <Btn onClick={() => setScreen("settings")}>SETTINGS</Btn>
            <Btn onClick={() => setScreen("controls")}>CONTROLS</Btn>
            <Btn onClick={() => game.quitToMenu()}>QUIT TO MENU</Btn>
          </div>
        )}
        {screen === "settings" && (
          <SettingsPanel settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />
        )}
        {screen === "controls" && (
          <ControlsPanel settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />
        )}
      </div>
    </div>
  );
}

function ResultOverlay({ game }: { game: Game }) {
  const hud = useHud(game);
  if (!hud.resultTitle) return null;
  const kind = hud.resultKind;
  return (
    <div className={"ui-root result-bg " + (kind ?? "")}>
      <div className="result-panel">
        <h2 className={"result-title " + (kind ?? "")}>{hud.resultTitle}</h2>
        <p className="result-detail">{hud.resultDetail}</p>
        {hud.resultKind === "wire" && (
          <p className="result-sub">
            Flight time {hud.flightTime.toFixed(0)} s · Wire {hud.wire}
          </p>
        )}
        <div className="menu-buttons">
          <Btn primary onClick={() => game.restart()}>FLY AGAIN</Btn>
          <Btn onClick={() => game.quitToMenu()}>QUIT TO MENU</Btn>
        </div>
        <p className="result-hint">Choose a button, pilot.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SettingsPanel({ settings, onSettings, onBack }: {
  settings: Settings; onSettings: (s: Settings) => void; onBack: () => void;
}) {
  const set = (patch: Partial<Settings>) => onSettings({ ...settings, ...patch });
  return (
    <div className="menu-screen">
      <h3 className="menu-h3">SETTINGS</h3>
      <label className="menu-row">
        <span>Graphics quality</span>
        <select
          value={settings.quality}
          onChange={(e) => set({ quality: e.target.value as Quality })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="menu-row">
        <span>Volume</span>
        <input
          type="range" min={0} max={1} step={0.05}
          value={settings.volume}
          onChange={(e) => set({ volume: Number(e.target.value) })}
        />
      </label>
      <label className="menu-row">
        <span>Control sensitivity</span>
        <input
          type="range" min={0.4} max={1.5} step={0.05}
          value={settings.sensitivity}
          onChange={(e) => set({ sensitivity: Number(e.target.value) })}
        />
      </label>
      <label className="menu-row">
        <span>Game mode</span>
        <select
          value={settings.gameMode}
          onChange={(e) => set({ gameMode: e.target.value as GameMode })}
        >
          {(Object.keys(GAME_MODE_LABELS) as GameMode[]).map((m) => (
            <option key={m} value={m}>{GAME_MODE_LABELS[m]}</option>
          ))}
        </select>
      </label>
      <label className="menu-row">
        <span>Daylight</span>
        <select
          value={settings.daylight}
          onChange={(e) => set({ daylight: e.target.value as DaylightMode })}
        >
          {(Object.keys(DAYLIGHT_LABELS) as DaylightMode[]).map((m) => (
            <option key={m} value={m}>{DAYLIGHT_LABELS[m]}</option>
          ))}
        </select>
      </label>
      <label className="menu-row">
        <span>Time of day{settings.daylight === "fixed" ? "" : " (fixed mode)"}</span>
        <input
          type="range" min={0} max={24} step={0.25}
          disabled={settings.daylight !== "fixed"}
          value={settings.timeOfDay}
          onChange={(e) => set({ timeOfDay: Number(e.target.value) })}
        />
      </label>
      <label className="menu-row">
        <span>Show minimap</span>
        <input
          type="checkbox"
          checked={settings.minimap}
          onChange={(e) => set({ minimap: e.target.checked })}
        />
      </label>
      <p className="menu-note">
        Time of day drives the sun, sky and fog. Real time follows Hawaii (HST).
        Dogfight mode spawns AI bandits — fire guns with Q.
      </p>
      <Btn onClick={onBack}>BACK</Btn>
    </div>
  );
}

function ControlsPanel({ settings, onSettings, onBack }: {
  settings: Settings; onSettings: (s: Settings) => void; onBack: () => void;
}) {
  const [capturing, setCapturing] = useState<Action | null>(null);

  useEffect(() => {
    if (!capturing) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.code !== "Escape") {
        onSettings({ ...settings, bindings: { ...settings.bindings, [capturing]: e.code } });
      }
      setCapturing(null);
    };
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [capturing, settings, onSettings]);

  const actions = Object.keys(ACTION_LABELS) as Action[];
  return (
    <div className="menu-screen">
      <h3 className="menu-h3">CONTROLS</h3>
      <div className="bindings-grid">
        {actions.map((a) => (
          <button
            key={a}
            className={"binding" + (capturing === a ? " capturing" : "")}
            onClick={() => setCapturing(a)}
          >
            <span>{ACTION_LABELS[a]}</span>
            <kbd>
              {capturing === a ? "press a key…" : keyLabel(settings.bindings[a])}
            </kbd>
          </button>
        ))}
      </div>
      <p className="menu-note">Mouse: drag to look around (chase camera · C cycles chase / cockpit / action).</p>
      <div className="menu-row-btns">
        <Btn
          onClick={() =>
            onSettings({ ...settings, bindings: { ...DEFAULT_BINDINGS } })
          }
        >
          RESET DEFAULTS
        </Btn>
        <Btn onClick={onBack}>BACK</Btn>
      </div>
    </div>
  );
}
