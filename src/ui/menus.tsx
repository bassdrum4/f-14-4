// UI chrome: main menu, pause, settings, controls, flight results.
// React only; the canvas keeps rendering behind these overlays.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Sim, Phase } from "../sim/engine";
import { AIRCRAFT_LIST } from "../sim/aircraft";
import { worldSeedForRoom } from "../sim/world";
import {
  USERNAME_MAX,
  currentAccount,
  dismissOnboarding,
  normalizeUsername,
  onboardingSeen,
  pullGamestate,
  pushGamestate,
  setCallsign,
  subscribeAccounts,
  type Account,
} from "../accounts";
import { gamestateConfigured } from "../gamestate";
import type { ChatMsg, NetState } from "../net/multiplayer";
import { APP_VERSION } from "../version";
import { Hud, useHud } from "./Hud";
import {
  ACTION_LABELS, DAYLIGHT_LABELS, DEFAULT_BINDINGS, MISSION_MODE_CHIPS, MISSION_MODE_LABELS, callsignOf, keyLabel,
  roomCode, suggestRoomCode, type Action, type DaylightMode, type MissionMode, type Quality,
  type Settings,
} from "../settings";
import {
  clearPending, exportPending, feedbackConfigured,
  feedbackEndpointProblem, flushFeedback, listPending,
  submitFeedback, type FeedbackKind,
} from "../feedback/feedback";

function usePhase(sim: Sim | null): Phase {
  const subscribe = (cb: () => void) =>
    sim ? sim.subscribePhase(() => cb()) : () => {};
  return useSyncExternalStore(
    subscribe,
    () => (sim ? sim.phase : ("menu" as Phase)),
    () => "menu" as Phase,
  );
}

/** Shown before any session exists, so the store read stays referentially stable. */
const IDLE_NET: NetState = {
  status: "idle", room: "", self: "", host: false, pilots: [],
  hz: 0, sent: 0, recv: 0,
};

function useNet(sim: Sim | null): NetState {
  const subscribe = (cb: () => void) =>
    sim ? sim.subscribeNet(() => cb()) : () => {};
  return useSyncExternalStore(
    subscribe,
    () => (sim ? sim.netSnapshot : IDLE_NET),
    () => IDLE_NET,
  );
}

/** Shown before any session exists, so the store read stays referentially stable. */
const EMPTY_CHAT: readonly ChatMsg[] = [];

function useChat(sim: Sim | null): readonly ChatMsg[] {
  const subscribe = (cb: () => void) =>
    sim ? sim.subscribeChat(cb) : () => {};
  return useSyncExternalStore(
    subscribe,
    () => (sim ? sim.chat : EMPTY_CHAT),
    () => EMPTY_CHAT,
  );
}

/**
 * The signed-in account. The store hands back a stable object, so React only
 * re-renders when the account really changes (sign in, sign out, first load).
 */
export function useAccount(): Account | null {
  return useSyncExternalStore(subscribeAccounts, currentAccount, () => null);
}

/** Who this pilot flies as: the account name, or the guest callsign. */
function identityName(account: Account | null, settings: Settings): string {
  return account?.username ?? callsignOf(settings);
}

export function UiRoot({ sim, settings, onSettings }: {
  sim: Sim | null;
  settings: Settings;
  onSettings: (s: Settings) => void;
}) {
  const phase = usePhase(sim);
  const account = useAccount();
  // First run: offer a callsign before the menu, but never block the sim on it.
  const [introDone, setIntroDone] = useState(() => onboardingSeen());
  return (
    <>
      {!introDone && !account && <FirstRun onDone={() => setIntroDone(true)} />}
      {phase === "menu" && (
        <MainMenu sim={sim} settings={settings} onSettings={onSettings} openMultiplayer={sim?.pendingRoomReentry === true} onOpenedMultiplayer={() => sim?.consumeRoomReentry()} />
      )}
      {phase !== "menu" && (
        <Hud sim={sim} daylight={settings.daylight} minimap={settings.minimap} />
      )}
      {phase === "paused" && sim && (
        <PauseMenu sim={sim} settings={settings} onSettings={onSettings} />
      )}
      {phase === "result" && sim && <ResultOverlay sim={sim} />}
    </>
  );
}

// ---------------------------------------------------------------------------

function Btn({ children, onClick, primary, disabled }: {
  children: React.ReactNode; onClick?: () => void; primary?: boolean; disabled?: boolean;
}) {
  return (
    <button
      className={"menu-btn" + (primary ? " primary" : "")}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Callsign + cloud gamestate
// ---------------------------------------------------------------------------

/**
 * Edit the callsign and move the gamestate around. The cloud is optional
 * (nothing is sent anywhere while no endpoint is configured); with it, a
 * pilot types their callsign on a new machine and their settings come home.
 */
function AccountPanel({
  account,
  settings,
  onSettings,
  onBack,
}: {
  account: Account | null;
  settings: Settings;
  onSettings: (s: Settings) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(account?.username ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const cloud = gamestateConfigured();

  const save = async () => {
    if (busy || !name.trim()) return;
    setBusy(true);
    setMsg(null);
    const res = setCallsign(name);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error });
      setBusy(false);
      return;
    }
    if (cloud) {
      const pushed = await pushGamestate(res.account.username, settings);
      setMsg(pushed.ok ? { ok: true, text: `GAMESTATE SAVED TO THE CLOUD FOR ${res.account.username}` } : { ok: false, text: pushed.error ?? "Save failed." });
    } else {
      setMsg({ ok: true, text: `FLYING AS ${res.account.username}` });
    }
    setBusy(false);
  };

  const pull = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const cs = normalizeUsername(name) || account?.username || "";
    if (!cs) {
      setMsg({ ok: false, text: "Type a callsign first." });
      setBusy(false);
      return;
    }
    setCallsign(cs);
    const res = await pullGamestate(cs, settings);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "Fetch failed." });
    } else if (res.settings) {
      onSettings(res.settings);
      setMsg({ ok: true, text: `GAMESTATE LOADED FOR ${cs.toUpperCase()} — MODE, TIME, SENSITIVITY, KEYBINDS AND AIRCRAFT RESTORED` });
    }
    setBusy(false);
  };

  return (
    <div className="menu-screen">
      <h3 className="menu-h3">PILOT</h3>
      <p className="menu-note">
        Your callsign is who the flight sees on the roster and the lobby.
        {cloud
          ? " The gamestate — gamemode, time of day, sensitivity, keybinds, aircraft — is saved to the cloud under it, so any machine can fetch it back."
          : " Cloud gamestate is not wired up on this build; settings live in this browser."}
      </p>

      <label className="menu-row">
        <span>Callsign</span>
        <input
          className="menu-input"
          value={name}
          maxLength={USERNAME_MAX}
          autoComplete="off"
          placeholder="MAVERICK"
          onChange={(e) => setName(normalizeUsername(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
          }}
        />
      </label>

      <div className="menu-row-btns">
        <Btn primary disabled={busy} onClick={() => void save()}>
          {busy ? "WORKING…" : "SET CALLSIGN"}
        </Btn>
        {cloud && (
          <Btn disabled={busy} onClick={() => void pull()}>
            FETCH MY GAMESTATE
          </Btn>
        )}
      </div>

      {msg && <div className={"menu-world-note" + (msg.ok ? "" : " err")}>{msg.text}</div>}

      <div className="menu-row-btns">
        <Btn onClick={onBack}>BACK</Btn>
      </div>
    </div>
  );
}

/** First launch: pick a callsign and fly. No accounts, no passwords. */
function FirstRun({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const go = () => {
    if (name.trim().length >= 2) setCallsign(name);
    dismissOnboarding();
    onDone();
  };
  return (
    <div className="ui-root intro-bg">
      <div className="menu-panel">
        <div className="menu-title">
          <span className="menu-kicker">CARRIER AIR WING</span>
          <h1>F-14 TOMCAT</h1>
          <span className="menu-sub">CARRIER FLIGHT SIMULATOR</span>
        </div>
        <p className="menu-note">
          Pick a callsign to fly under — the flight will see it on the roster.
        </p>
        <label className="menu-row">
          <span>Callsign</span>
          <input
            className="menu-input"
            value={name}
            maxLength={USERNAME_MAX}
            autoComplete="off"
            placeholder="MAVERICK"
            autoFocus
            onChange={(e) => setName(normalizeUsername(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") go();
            }}
          />
        </label>
        <div className="menu-row-btns">
          <Btn primary onClick={go}>
            FLY
          </Btn>
        </div>
      </div>
    </div>
  );
}

type Screen = "main" | "solo" | "settings" | "controls" | "multiplayer" | "feedback" | "account";

function MainMenu({ sim, settings, onSettings, openMultiplayer, onOpenedMultiplayer }: {
  sim: Sim | null; settings: Settings; onSettings: (s: Settings) => void;
  openMultiplayer?: boolean; onOpenedMultiplayer?: () => void;
}) {
  // A dead pilot sent back to their room's lobby lands straight on the
  // multiplayer screen (the room is still linked) instead of the main board.
  const [screen, setScreen] = useState<Screen>(() => (openMultiplayer ? "multiplayer" : "main"));
  useEffect(() => {
    if (openMultiplayer) {
      setScreen("multiplayer");
      onOpenedMultiplayer?.();
    }
  }, [openMultiplayer, onOpenedMultiplayer]);
  const net = useNet(sim);
  const account = useAccount();
  const chooseRoom = (versus: boolean) => {
    if (net.status !== "online" && net.status !== "connecting") {
      onSettings({ ...settings, missionMode: versus ? "versus" : "dogfight" });
    }
    setScreen("multiplayer");
  };
  return (
    <div className="ui-root menu-bg dispatch-bg">
      <div className="menu-panel dispatch-panel">
        <div className="dispatch-top"><span>FLIGHT OPERATIONS / 01</span><span>v{APP_VERSION}</span></div>
        <button className="dispatch-brand" onClick={() => setScreen("main")} aria-label="Back to flight operations">
          <span className="dispatch-mark">F—14</span>
          <span className="dispatch-name">CARRIER<br />AIR WING</span>
        </button>
        <div className="acct-strip">
          <span className={"dot " + (account ? "online" : "idle")} />
          <span className="acct-strip-name">{account ? account.username.toUpperCase() : "GUEST PILOT"}</span>
          <button className="acct-link" onClick={() => setScreen("account")}>PILOT RECORD</button>
        </div>
        {screen === "main" && <>
          <div className="dispatch-heading"><span>READY ON THE DECK</span><h1>Your aircraft.<br />Your sortie.</h1></div>
          <div className="dispatch-actions">
            <button className="dispatch-action lead" onClick={() => setScreen("solo")}><span className="dispatch-number">01</span><span><strong>FLY SOLO</strong><small>Pick your aircraft. Make your own run.</small></span><b aria-hidden="true">↗</b></button>
            <button className="dispatch-action" onClick={() => chooseRoom(false)}><span className="dispatch-number">02</span><span><strong>FLY TOGETHER</strong><small>{net.status === "online" ? `Room ${net.room} · ${net.pilots.length} linked` : "Open a room. Bring a wingman."}</small></span><b aria-hidden="true">↗</b></button>
            <button className="dispatch-action" onClick={() => chooseRoom(true)}><span className="dispatch-number">03</span><span><strong>HEAD-TO-HEAD</strong><small>Live pilots. Guns and missiles. Settle it in the air.</small></span><b aria-hidden="true">↗</b></button>
          </div>
          <nav className="dispatch-nav" aria-label="Flight tools">
            <button onClick={() => setScreen("settings")}>SETTINGS</button>
            <button onClick={() => setScreen("controls")}>CONTROLS</button>
            <button onClick={() => setScreen("account")}>PILOT</button>
            <button onClick={() => setScreen("feedback")}>FEEDBACK</button>
          </nav>
          <div className="dispatch-stamp">CLEAR FOR LAUNCH <span>///</span></div>
        </>}
        {screen === "solo" && <FlightSetup sim={sim} settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />}
        {screen === "settings" && <SettingsPanel settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />}
        {screen === "controls" && <ControlsPanel settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />}
        {screen === "multiplayer" && <MultiplayerPanel sim={sim} settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />}
        {screen === "feedback" && <FeedbackPanel sim={sim} settings={settings} onBack={() => setScreen("main")} />}
        {screen === "account" && <AccountPanel account={account} settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />}
      </div>
      <div className="dispatch-side" aria-hidden="true"><span>LAUNCH / RECOVER / REPEAT</span><strong>KEEP<br />THE SKY<br />YOURS.</strong><span>BROWSER FLIGHT SIMULATOR</span></div>
      <div className="menu-footer">C — camera · R — target pod · E — missile · Q — guns · Esc — pause</div>
    </div>
  );
}

function FlightSetup({ sim, settings, onSettings, onBack }: {
  sim: Sim | null; settings: Settings; onSettings: (s: Settings) => void; onBack: () => void;
}) {
  const mode = settings.missionMode === "versus" ? "cruise" : settings.missionMode;
  const craft = AIRCRAFT_LIST.find(a => a.id === settings.aircraft) ?? AIRCRAFT_LIST[0];
  const launch = (mission: "carrier" | "airfield") => {
    if (settings.missionMode === "versus") onSettings({ ...settings, missionMode: mode });
    sim?.startMission(mission);
  };
  return <div className="menu-screen">
    <h3 className="menu-h3">SORTIE SETUP</h3>
    <span className="menu-world-label">AIRCRAFT</span>
    <div className="menu-world-chips">{AIRCRAFT_LIST.map(a => <button key={a.id} className={"world-chip" + (settings.aircraft === a.id ? " on" : "")} onClick={() => onSettings({ ...settings, aircraft: a.id })}>{a.name}</button>)}</div>
    <p className="menu-note">{craft.blurb} · {craft.bombs} bombs · {craft.missiles} missiles</p>
    <span className="menu-world-label">MISSION</span>
    <div className="menu-world-chips">{(["cruise", "dogfight", "strike"] as MissionMode[]).map(m => <button key={m} className={"world-chip" + (mode === m ? " on" : "")} onClick={() => onSettings({ ...settings, missionMode: m })}>{MISSION_MODE_CHIPS[m]}</button>)}</div>
    <p className="menu-note">{MISSION_MODE_LABELS[mode]}</p>
    <div className="menu-buttons"><Btn primary onClick={() => launch("carrier")}>CAT SHOT — CARRIER</Btn><Btn onClick={() => launch("airfield")}>TAKEOFF — RUNWAY</Btn><Btn onClick={onBack}>BACK</Btn></div>
  </div>;
}

function PauseMenu({ sim, settings, onSettings }: {
  sim: Sim; settings: Settings; onSettings: (s: Settings) => void;
}) {
  const [screen, setScreen] = useState<Screen>("main");
  const net = useNet(sim);
  const account = useAccount();
  return (
    <div className="ui-root pause-bg">
      <div className="menu-panel small">
        <h2 className="menu-h2">PAUSED</h2>
        {screen === "main" && (
          <>
            <div className="menu-buttons">
              <Btn primary onClick={() => sim.resume()}>RESUME</Btn>
              <Btn onClick={() => sim.restart()}>RESTART FLIGHT</Btn>
              <Btn onClick={() => sim.quitToMenu()}>QUIT TO MENU</Btn>
            </div>
            <div className="menu-nav">
              <button className="world-chip" onClick={() => setScreen("multiplayer")}>
                {net.status === "online" ? `ROOM ${net.room}` : "MULTIPLAYER"}
              </button>
              <button className="world-chip" onClick={() => setScreen("settings")}>SETTINGS</button>
              <button className="world-chip" onClick={() => setScreen("controls")}>CONTROLS</button>
              <button className="world-chip" onClick={() => setScreen("feedback")}>FEEDBACK</button>
              <button className="world-chip" onClick={() => setScreen("account")}>
                {account ? account.username.toUpperCase() : "PILOT"}
              </button>
            </div>
          </>
        )}
        {screen === "settings" && (
          <SettingsPanel settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />
        )}
        {screen === "controls" && (
          <ControlsPanel settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />
        )}
        {screen === "multiplayer" && (
          <MultiplayerPanel sim={sim} settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />
        )}
        {screen === "feedback" && (
          <FeedbackPanel sim={sim} settings={settings} onBack={() => setScreen("main")} />
        )}
        {screen === "account" && (
          <AccountPanel
            account={account}
            settings={settings}
            onSettings={onSettings}
            onBack={() => setScreen("main")}
          />
        )}
      </div>
    </div>
  );
}

function ResultOverlay({ sim }: { sim: Sim }) {
  const hud = useHud(sim);
  const live = hud.netStatus === "online" || hud.netStatus === "connecting";
  if (!hud.resultTitle) return null;
  const kind = hud.resultKind;
  // A crash already got its whole cinematic: the screen just closes it out.
  const died = kind === "crash";
  return (
    <div className={"ui-root result-bg " + (kind ?? "")}>
      <div className="result-panel">
        <h2 className={"result-title " + (kind ?? "")}>{died ? "YOU DIED" : hud.resultTitle}</h2>
        <p className="result-detail">{hud.resultDetail}</p>
        {died && (
          <p className="result-sub">
            {hud.resultTitle} · Flight time {hud.flightTime.toFixed(0)} s
            {hud.dfActive ? ` · ${hud.dfKills} tagged` : ""}
          </p>
        )}
        {hud.resultKind === "wire" && (
          <p className="result-sub">
            Flight time {hud.flightTime.toFixed(0)} s · Wire {hud.wire}
          </p>
        )}
        <div className="menu-buttons">
          {live ? (
            <Btn primary onClick={() => sim.returnToRoom()}>
              BACK TO THE ROOM
            </Btn>
          ) : (
            <Btn primary onClick={() => sim.restart()}>FLY AGAIN</Btn>
          )}
          <Btn onClick={() => sim.quitToMenu()}>QUIT TO MENU</Btn>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SettingsPanel({ settings, onSettings, onBack }: {
  settings: Settings; onSettings: (s: Settings) => void; onBack: () => void;
}) {
  const set = (patch: Partial<Settings>) => onSettings({ ...settings, ...patch });
  const [tab, setTab] = useState("flight");
  return <div className="menu-screen settings-screen">
    <h3 className="menu-h3">SETTINGS</h3>
    <nav className="settings-tabs" aria-label="Settings category">{["flight", "controls", "graphics", "audio", "interface"].map(t => <button key={t} aria-pressed={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t.toUpperCase()}</button>)}</nav>
    {tab === "flight" && <>
      <label className="menu-row"><span>Daylight</span><select value={settings.daylight} onChange={e => set({ daylight: e.target.value as DaylightMode })}>{(Object.keys(DAYLIGHT_LABELS) as DaylightMode[]).map(m => <option key={m} value={m}>{DAYLIGHT_LABELS[m]}</option>)}</select></label>
      <label className="menu-row"><span>Time / {String(Math.floor(settings.timeOfDay)).padStart(2, "0")}:{String(Math.round(settings.timeOfDay % 1 * 60)).padStart(2, "0")}</span><input type="range" min={0} max={23.75} step={0.25} disabled={settings.daylight !== "fixed"} value={settings.timeOfDay} onChange={e => set({ timeOfDay: Number(e.target.value) })} /></label>
      <p className="menu-note">Choose aircraft and mission in Sortie Setup. Room hosts choose the shared mission in the lobby.</p>
    </>}
    {tab === "controls" && <><label className="menu-row"><span>Sensitivity / {settings.sensitivity.toFixed(2)}</span><input type="range" min={0.4} max={3} step={0.05} value={settings.sensitivity} onChange={e => set({ sensitivity: Number(e.target.value) })} /></label><ControlsPanel settings={settings} onSettings={onSettings} onBack={onBack} /></>}
    {tab === "graphics" && <><label className="menu-row"><span>World detail</span><select value={settings.quality} onChange={e => set({ quality: e.target.value as Quality })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="menu-row"><span>Adaptive resolution</span><input type="checkbox" checked={settings.adaptiveResolution} onChange={e => set({ adaptiveResolution: e.target.checked })} /></label><p className="menu-note">Automatically adjusts picture resolution to keep flight smooth. Low reduces scenery density, effects and shadows.</p></>}
    {tab === "audio" && <label className="menu-row"><span>Volume / {Math.round(settings.volume * 100)}%</span><input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={e => set({ volume: Number(e.target.value) })} /></label>}
    {tab === "interface" && <label className="menu-row"><span>Show minimap</span><input type="checkbox" checked={settings.minimap} onChange={e => set({ minimap: e.target.checked })} /></label>}
    {tab !== "controls" && <Btn onClick={onBack}>BACK</Btn>}
  </div>;
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
      <p className="menu-note">
        Drag the mouse to look around · C cycles chase / cockpit / action. R opens
        the target pod: drag to slew the sensor, release over a target to send a
        laser-guided bomb.
      </p>
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

// ---------------------------------------------------------------------------
// Multiplayer lobby
// ---------------------------------------------------------------------------

function statusText(net: NetState): string {
  switch (net.status) {
    case "idle":
      return "OFFLINE — solo flight";
    case "connecting":
      return `CONTACTING THE FLIGHT… ${net.room}`;
    case "online":
      return `ON STATION · ROOM ${net.room} · ${net.self}`;
    case "error":
      return "NOT CONNECTED";
  }
}

function MultiplayerPanel({ sim, settings, onSettings, onBack }: {
  sim: Sim | null; settings: Settings; onSettings: (s: Settings) => void; onBack: () => void;
}) {
  const net = useNet(sim);
  const account = useAccount();
  const [guest, setGuest] = useState(() => callsignOf(settings));
  // The account name wins when there is one, so wingmen see it on the roster.
  const callsign = identityName(account, settings);
  // Blank until a pilot types one. A pre-filled code read like a room that was
  // already waiting, and it quietly decided which world everyone would fly.
  const [room, setRoom] = useState(() => settings.room);
  const code = roomCode(room);
  const canConnect = code.length > 0;
  // What the roster will actually show: the account name when there is one,
  // else the typed callsign (falling back to the saved one until it is typed).
  const name = account ? callsign : normalizeUsername(guest) || callsign;

  const online = net.status === "online";
  const connecting = net.status === "connecting";
  const live = online || connecting;

  // Persist the identity/room as they are edited, so the feedback form and the
  // next session both find them.
  const commit = () => {
    onSettings({ ...settings, callsign: name, room: code });
    if (online) sim?.setCallsign(name);
  };

  return (
    <div className="menu-screen mp-screen">
      <h3 className="menu-h3">{settings.missionMode === "versus" ? "HEAD-TO-HEAD" : "FLY TOGETHER"}</h3>
      <p className="menu-note">
        One pilot opens the room; everyone else joins with the code. Head-to-head starts airborne with separate spawns, a five-second shield, scores and automatic respawns.
      </p>

      <label className="menu-row">
        <span>Callsign</span>
        {account ? (
          <input className="menu-input" value={account.username} readOnly />
        ) : (
          <input
            className="menu-input"
            value={guest}
            maxLength={12}
            placeholder="PILOT"
            onChange={(e) => setGuest(normalizeUsername(e.target.value))}
            onBlur={commit}
          />
        )}
      </label>
      <label className="menu-row">
        <span>Room code</span>
        <span className="row-inline">
          <input
            className="menu-input"
            value={room}
            maxLength={10}
            placeholder="ANY WORD OR CODE"
            disabled={live}
            onChange={(e) => setRoom(roomCode(e.target.value))}
            onBlur={commit}
          />
          <button
            className="world-chip chip-inline"
            disabled={live}
            onClick={() => {
              const generated = suggestRoomCode();
              setRoom(generated);
              onSettings({ ...settings, callsign: name, room: generated });
            }}
          >
            GENERATE
          </button>
        </span>
      </label>
      <div className="menu-world-note">
        Any word or code — everyone who types it flies the same islands with you.
      </div>

      <div className="mp-status">
        <span className={"dot " + net.status} />
        <span>{statusText(net)}</span>
      </div>
      {net.error && <div className="menu-world-note err">{net.error}</div>}

      {/* In a room there is nothing to open or join: the door buttons only
          make sense while the pilot is still on the ground outside one. */}
      {!live && (
        <div className="menu-row-btns">
          <Btn
            primary
            disabled={!canConnect}
            onClick={() => {
              commit();
              sim?.openRoom(name, code);
            }}
          >
            OPEN ROOM
          </Btn>
          <Btn
            disabled={!canConnect}
            onClick={() => {
              commit();
              sim?.joinRoom(name, code);
            }}
          >
            JOIN ROOM
          </Btn>
        </div>
      )}

      {live && (
        <>
          <div className="menu-row-btns">
            <Btn primary onClick={() => sim?.leaveRoom()}>LEAVE ROOM</Btn>
          </div>
          <div className="menu-world-note">
            Room {net.room} joined — leave to open or join another.
          </div>
        </>
      )}

      {live && (
        <>
          <div className="mp-tally">
            {net.host ? "HOST" : "FLIGHT MEMBER"} · {net.pilots.length} LINKED
          </div>
          <div className="mp-roster">
            {net.pilots.length === 0 && (
              <div className="menu-world-note">
                {connecting
                  ? "Linking up…"
                  : `Waiting for a wingman to join with code ${net.room}.`}
              </div>
            )}
            {net.pilots.map((p) => (
              <div className="mp-pilot" key={p.id}>
                <span className={"dot " + (p.linked ? "online" : "connecting")} />
                <span className="mp-pilot-name">{p.name.toUpperCase()}</span>
                <span className="mp-pilot-air">
                  {AIRCRAFT_LIST.find((a) => a.id === p.aircraft)?.name ?? p.aircraft}
                </span>
                {p.host && <span className="badge">HOST</span>}
              </div>
            ))}
          </div>
          <ChatPanel sim={sim} online={online} />
        </>
      )}

      {/* Only the host picks the sortie and its settings: the room lifts off
          together, so a wingman's job is to be in the lobby when it does. */}
      {online && net.host && (
        <div className="mp-launch">
          <span className="menu-world-label">LAUNCH SETUP</span>
          <div className="menu-world">
            <span className="menu-world-label">MISSION</span>
            <div className="menu-world-chips">
              {(Object.keys(MISSION_MODE_LABELS) as MissionMode[]).map((m) => (
                <button
                  key={m}
                  className={"world-chip" + (settings.missionMode === m ? " on" : "")}
                  title={MISSION_MODE_LABELS[m]}
                  onClick={() => onSettings({ ...settings, missionMode: m })}
                >
                  {MISSION_MODE_CHIPS[m]}
                </button>
              ))}
            </div>
          </div>
          <div className="menu-world">
            <span className="menu-world-label">AIRCRAFT</span>
            <div className="menu-world-chips">
              {AIRCRAFT_LIST.map((a) => (
                <button
                  key={a.id}
                  className={"world-chip" + (a.id === settings.aircraft ? " on" : "")}
                  onClick={() => onSettings({ ...settings, aircraft: a.id })}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
          <label className="menu-row">
            <span>Daylight</span>
            <select
              value={settings.daylight}
              onChange={(e) => onSettings({ ...settings, daylight: e.target.value as DaylightMode })}
            >
              {(Object.keys(DAYLIGHT_LABELS) as DaylightMode[]).map((m) => (
                <option key={m} value={m}>{DAYLIGHT_LABELS[m]}</option>
              ))}
            </select>
          </label>
          {settings.daylight === "fixed" && (
            <label className="menu-row">
              <span>Time of day</span>
              <input
                type="range" min={0} max={24} step={0.25}
                value={settings.timeOfDay}
                onChange={(e) => onSettings({ ...settings, timeOfDay: Number(e.target.value) })}
              />
            </label>
          )}
          <div className="menu-row-btns">
            <Btn primary disabled={settings.missionMode === "versus" && !net.pilots.some(p => p.linked)} onClick={() => sim?.startRoomMission("carrier")}>
              {settings.missionMode === "versus" ? "START AIR BATTLE" : "CARRIER LAUNCH"}
            </Btn>
            {settings.missionMode !== "versus" && <Btn onClick={() => sim?.startRoomMission("airfield")}>
              RUNWAY TAKEOFF
            </Btn>}
          </div>
          <div className="menu-world-note">
            The room lifts off together with these settings.
          </div>
        </div>
      )}
      {online && !net.host && settings.missionMode === "versus" && <Btn onClick={() => sim?.joinBattle()}>JOIN ACTIVE AIR BATTLE</Btn>}
      {online && !net.host && (
        <div className="mp-launch">
          <span className="menu-world-label">WAITING FOR THE HOST</span>
          <div className="menu-world-note">
            The room's mission is {MISSION_MODE_LABELS[settings.missionMode]} — the host sets it,
            and everyone in the room flies it. Stay in the lobby: you lift off with the room.
          </div>
        </div>
      )}

      <div className="menu-row-btns">
        <Btn onClick={onBack}>BACK</Btn>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Room radio (lobby chat over the same data channel as everything else)
// ---------------------------------------------------------------------------

function ChatPanel({ sim, online }: { sim: Sim | null; online: boolean }) {
  const log = useChat(sim);
  const [draft, setDraft] = useState("");
  // The log grows downward, so the newest line is the one to keep on screen.
  const boxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [log.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sim?.sendChat(text);
    setDraft("");
  };

  return (
    <div className="mp-chat">
      <span className="menu-world-label">RADIO</span>
      <div className="mp-chat-log" ref={boxRef}>
        {log.length === 0 && (
          <div className="mp-chat-empty">
            Radio silence — say something to the flight.
          </div>
        )}
        {log.map((m, i) => (
          <div className="mp-chat-line" key={i}>
            <span className={"mp-chat-from" + (m.from ? "" : " unknown")}>
              {m.from ? m.from.toUpperCase() : "??"}
            </span>
            <span className="mp-chat-text">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="mp-chat-row">
        <input
          className="menu-input"
          value={draft}
          maxLength={160}
          placeholder={online ? "TRANSMIT TO THE FLIGHT" : "RADIO OFFLINE"}
          disabled={!online}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button className="world-chip chip-inline" disabled={!online || !draft.trim()} onClick={send}>
          SEND
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

const FEEDBACK_KINDS: Array<{ id: FeedbackKind; label: string }> = [
  { id: "bug", label: "BUG" },
  { id: "idea", label: "IDEA" },
  { id: "other", label: "OTHER" },
];

function FeedbackPanel({ sim, settings, onBack }: {
  sim: Sim | null; settings: Settings; onBack: () => void;
}) {
  const hud = useHud(sim);
  const [kind, setKind] = useState<FeedbackKind>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [includeContext, setIncludeContext] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(() => listPending().length);

  const configured = feedbackConfigured();
  const endpointProblem = feedbackEndpointProblem();
  const account = useAccount();
  const callsign = identityName(account, settings);

  /** The flight state that rides along with a report, when the pilot allows it. */
  const context = {
    aircraft: settings.aircraft,
    // The world is the room code, so record both: a human reading the sheet
    // sees the room, and the seed identifies the exact terrain.
    world: settings.room ? `${settings.room} (seed ${worldSeedForRoom(settings.room)})` : "solo",
    missionMode: settings.missionMode,
    quality: settings.quality,
    airborne: !hud.onGround,
    speedKt: Math.round(hud.speedKt),
    altFt: Math.round(hud.altFt),
    mach: Number(hud.mach.toFixed(2)),
    multiplayer: hud.netStatus === "online",
    room: hud.netRoom,
    wingmen: hud.netPilots,
    callsign,
  };

  const send = async () => {
    if (busy || !message.trim()) return;
    setBusy(true);
    const res = await submitFeedback(
      { kind, message, email, includeContext },
      includeContext ? context : null,
      callsign,
    );
    setPending(listPending().length);
    setResult({ ok: res.ok, text: res.message });
    if (res.ok) setMessage("");
    setBusy(false);
  };

  const retry = async () => {
    setBusy(true);
    const sent = await flushFeedback();
    setPending(listPending().length);
    setResult({
      ok: sent > 0,
      text: sent > 0 ? `Sent ${sent} queued item(s).` : "Nothing could be sent — still queued locally.",
    });
    setBusy(false);
  };

  const exportAll = () => {
    const blob = new Blob([exportPending()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `f14sim-feedback-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="menu-screen">
      <h3 className="menu-h3">FEEDBACK</h3>
      <p className="menu-note">
        Tell us what broke, what felt wrong, or what should be here next.
      </p>

      <div className="feedback-chips">
        {FEEDBACK_KINDS.map((k) => (
          <button
            key={k.id}
            className={"world-chip" + (kind === k.id ? " on" : "")}
            onClick={() => setKind(k.id)}
          >
            {k.label}
          </button>
        ))}
      </div>

      <textarea
        className="feedback-textarea"
        value={message}
        rows={5}
        maxLength={4000}
        placeholder={
          kind === "bug"
            ? "What happened, and what did you expect instead?"
            : kind === "idea"
              ? "What would make this sim better?"
              : "Anything else on your mind."
        }
        onChange={(e) => setMessage(e.target.value)}
      />

      <label className="menu-row">
        <span>Email (optional)</span>
        <input
          className="menu-input"
          value={email}
          maxLength={120}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="menu-row">
        <span>Attach flight state</span>
        <input
          type="checkbox"
          checked={includeContext}
          onChange={(e) => setIncludeContext(e.target.checked)}
        />
      </label>

      <div className="menu-row-btns">
        <Btn primary onClick={() => void send()}>
          {busy ? "SENDING…" : "SEND REPORT"}
        </Btn>
        <Btn onClick={onBack}>BACK</Btn>
      </div>

      {result && (
        <div className={"feedback-msg" + (result.ok ? "" : " err")}>{result.text}</div>
      )}

      <div className="feedback-queue">
        <span>
          {configured ? "Linked" : "No endpoint"} · {pending} queued locally
        </span>
        <div className="menu-row-btns">
          <Btn onClick={() => void retry()}>
            {configured ? "RETRY QUEUE" : "RETRY"}
          </Btn>
          <Btn
            onClick={() => {
              exportAll();
            }}
          >
            EXPORT JSON
          </Btn>
          <Btn
            onClick={() => {
              clearPending();
              setPending(0);
              setResult({ ok: true, text: "Local feedback queue cleared." });
            }}
          >
            CLEAR
          </Btn>
        </div>
      </div>

      {endpointProblem && !configured && (
        <div className="feedback-msg err">{endpointProblem}</div>
      )}
    </div>
  );
}
