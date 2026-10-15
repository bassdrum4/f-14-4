// UI chrome: main menu, pause, settings, controls, flight results.
// React only; the canvas keeps rendering behind these overlays.

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Sim, Phase } from "../sim/engine";
import { AIRCRAFT_LIST } from "../sim/aircraft";
import { carriers, worldSeedForRoom } from "../sim/world";
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
import type { NetState } from "../net/multiplayer";
import { APP_VERSION } from "../version";
import { Hud, useHud } from "./Hud";
import { operationTitle, phaseObjective } from "../sim/operations";
import {
  ACTION_LABELS, DAYLIGHT_LABELS, DEFAULT_BINDINGS, MISSION_MODE_CHIPS, MISSION_MODE_LABELS, WEATHER_LABELS, callsignOf, keyLabel, rebind,
  roomCode, suggestRoomCode, type Action, type DaylightMode, type MissionMode, type Quality,
  type Settings, type WeatherMode,
} from "../settings";
import {
  clearPending, exportPending, feedbackConfigured,
  feedbackEndpointProblem, flushFeedback, listPending,
  submitFeedback, type FeedbackKind,
} from "../feedback/feedback";

/** The boat a sortie launches from — the one on file in the gamestate. */
function homeCarrier(settings: Settings): string {
  const fleet = carriers();
  if (fleet.length === 0) return "the fleet";
  const idx = Math.min(Math.max(Math.floor(settings.launchCarrier) || 0, 0), fleet.length - 1);
  return fleet[idx].name;
}

/** Where the next launch begins, in words: the boat, or the shore runway. */
function launchPointLabel(settings: Settings): string {
  return settings.launchKind === "airfield" ? "the shore runway" : `carrier ${homeCarrier(settings)}`;
}

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
  return (
    <>
      {phase === "menu" && (
        <MainMenu sim={sim} settings={settings} onSettings={onSettings} openMultiplayer={sim?.pendingRoomReentry === true} onOpenedMultiplayer={() => sim?.consumeRoomReentry()} />
      )}
      {phase !== "menu" && (
        <Hud sim={sim} daylight={settings.daylight} minimap={settings.minimap} ladder={settings.hudLadder} gunCross={settings.hudGunCross} />
      )}
      {phase === "paused" && sim && !sim.operationDebrief && (
        <PauseMenu sim={sim} settings={settings} onSettings={onSettings} />
      )}
      {phase === "paused" && sim?.operationDebrief && <OperationDebrief sim={sim} />}
      {phase === "result" && sim && <ResultOverlay sim={sim} settings={settings} />}
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
        Your callsign is what the roster and the lobby show.
        {cloud
          ? " Saved under it: gamemode, time, sensitivity, keybinds, aircraft."
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

/**
 * The callsign card — asked for at the moment a pilot leaves the menu to fly,
 * and only then. It used to render alongside the home board on first launch,
 * where the dispatch panel's semi-transparent gradient let it ghost through
 * behind the buttons; a pilot who has not filled a name in now sees it once
 * they press a launch button, and can still take off as a guest.
 */
function CallsignGate({ onGo, onCancel }: { onGo: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const ok = name.trim().length >= 2;
  const go = (save: boolean) => {
    if (save && ok) setCallsign(name);
    dismissOnboarding();
    onGo();
  };
  return (
    <div className="ui-root intro-bg">
      <div className="menu-panel small">
        <div className="menu-title">
          <span className="menu-kicker">BEFORE YOU LAUNCH</span>
          <h1>YOUR CALLSIGN</h1>
          <span className="menu-sub">THE FLIGHT SEES IT ON THE ROSTER</span>
        </div>
        <p className="menu-note">
          Optional. Fly under it and the rest of the flight sees it — or launch as a guest.
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
              if (e.key === "Enter") go(true);
            }}
          />
        </label>
        <div className="menu-row-btns">
          <Btn primary disabled={!ok} onClick={() => go(true)}>
            FLY
          </Btn>
          <Btn onClick={() => go(false)}>FLY AS GUEST</Btn>
          <Btn onClick={onCancel}>BACK</Btn>
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
  // The callsign card is held back from the home board: a launch button that
  // still has no name parks its action here and asks first. Answering it — by
  // entering a name or flying as a guest — marks it answered for good.
  const [pending, setPending] = useState<{ run: () => void } | null>(null);
  const gate = (run: () => void) => {
    if (onboardingSeen()) run();
    else setPending({ run });
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
            <button className="dispatch-action lead" onClick={() => {
              sim?.leaveRoom();
              if (settings.missionMode === "versus") onSettings({ ...settings, missionMode: "cruise" });
              setScreen("solo");
            }}><span className="dispatch-number">01</span><span><strong>FLY SOLO</strong><small>Pick your aircraft.</small></span><b aria-hidden="true">↗</b></button>
            <button className="dispatch-action" onClick={() => chooseRoom(false)}><span className="dispatch-number">02</span><span><strong>FLY TOGETHER</strong><small>{net.status === "online" ? `Room ${net.room} · ${net.pilots.length} linked` : "Open a room. Bring a wingman."}</small></span><b aria-hidden="true">↗</b></button>
            <button className="dispatch-action" onClick={() => chooseRoom(true)}><span className="dispatch-number">03</span><span><strong>HEAD-TO-HEAD</strong><small>Live pilots, guns and missiles.</small></span><b aria-hidden="true">↗</b></button>
          </div>
          <nav className="dispatch-nav" aria-label="Flight tools">
            <button onClick={() => setScreen("settings")}>SETTINGS</button>
            <button onClick={() => setScreen("controls")}>CONTROLS</button>
            <button onClick={() => setScreen("account")}>PILOT</button>
            <button onClick={() => setScreen("feedback")}>FEEDBACK</button>
          </nav>
          <div className="dispatch-stamp">CLEAR FOR LAUNCH <span>///</span></div>
        </>}
        {screen === "solo" && <FlightSetup sim={sim} settings={settings} onSettings={onSettings} gate={gate} onBack={() => setScreen("main")} />}
        {screen === "settings" && <SettingsPanel sim={sim} settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />}
        {screen === "controls" && <ControlsPanel settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />}
        {screen === "multiplayer" && <MultiplayerPanel sim={sim} settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />}
        {screen === "feedback" && <FeedbackPanel sim={sim} settings={settings} onBack={() => setScreen("main")} />}
        {screen === "account" && <AccountPanel account={account} settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />}
      </div>
      <div className="dispatch-side" aria-hidden="true"><span>LAUNCH / RECOVER / REPEAT</span><strong>KEEP<br />THE SKY<br />YOURS.</strong><span>BROWSER FLIGHT SIMULATOR</span></div>
      <div className="menu-footer">{keyLabel(settings.bindings.camera)} — camera · {keyLabel(settings.bindings.throttleUp)} — throttle · {keyLabel(settings.bindings.cat)} — catapult · {keyLabel(settings.bindings.bomb)} — target pod · {keyLabel(settings.bindings.missile)} — missile · {keyLabel(settings.bindings.fire)} — guns · {keyLabel(settings.bindings.map)} — map · {keyLabel(settings.bindings.settings)} — settings · Enter — radio · {keyLabel(settings.bindings.pause)} — pause</div>
      {pending && (
        <CallsignGate
          onGo={() => {
            const run = pending.run;
            setPending(null);
            run();
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

function FlightSetup({ sim, settings, onSettings, onBack, gate }: {
  sim: Sim | null; settings: Settings; onSettings: (s: Settings) => void; onBack: () => void;
  gate: (run: () => void) => void;
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
    <div className="menu-world-chips">{(["cruise", "dogfight", "strike", "campaign"] as MissionMode[]).map(m => <button key={m} className={"world-chip" + (mode === m ? " on" : "")} onClick={() => onSettings({ ...settings, missionMode: m })}>{MISSION_MODE_CHIPS[m]}</button>)}</div>
    {(mode === "strike" || mode === "dogfight" || mode === "campaign") && <MissionBrief mode={mode} settings={settings} onSettings={onSettings} />}
    <p className="menu-note">{MISSION_MODE_LABELS[mode]}</p>
    <label className="menu-row"><span>Weather</span><select value={settings.weather ?? "clear"} onChange={e => onSettings({ ...settings, weather: e.target.value as WeatherMode })}>{(Object.keys(WEATHER_LABELS) as WeatherMode[]).map(w => <option key={w} value={w}>{WEATHER_LABELS[w]}</option>)}</select></label>
    <p className="menu-note">Home deck: {homeCarrier(settings)} — land on another boat and it becomes home.</p>
    <div className="menu-buttons"><Btn primary onClick={() => gate(() => launch("carrier"))}>{craft.rotorcraft ? "LIFT OFF — CARRIER" : "CAT SHOT — CARRIER"}</Btn><Btn onClick={() => gate(() => launch("airfield"))}>TAKEOFF — RUNWAY</Btn><Btn onClick={onBack}>BACK</Btn></div>
  </div>;
}

function PauseMenu({ sim, settings, onSettings }: {
  sim: Sim; settings: Settings; onSettings: (s: Settings) => void;
}) {
  // Asked for settings from the air (the settings key)? Open on that screen.
  // A plain read rather than a consume: React runs this initialiser twice under
  // StrictMode, and a one-shot flag would be spent by the first pass.
  const [screen, setScreen] = useState<Screen>(() =>
    sim.settingsRequested ? "settings" : "main",
  );
  const net = useNet(sim);
  const account = useAccount();
  return (
    <div className="ui-root pause-bg">
      <div className="menu-panel small">
        <h2 className="menu-h2">{net.status === "online" ? "FLIGHT MENU" : "PAUSED"}</h2>
        {net.status === "online" && <p className="menu-note" role="status">Paused. The room keeps flying and you can still be hit.</p>}
        {screen === "main" && (
          <>
            <div className="menu-buttons">
              <Btn primary onClick={() => sim.resume()}>RESUME</Btn>
              {sim.snapshot.operation && <Btn onClick={() => sim.finishOperation()}>OPERATION DEBRIEF</Btn>}
              <Btn onClick={() => setScreen("settings")}>SETTINGS</Btn>
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
          <SettingsPanel sim={sim} settings={settings} onSettings={onSettings} onBack={() => setScreen("main")} />
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

function ResultOverlay({ sim, settings }: { sim: Sim; settings: Settings }) {
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
        {/* Paddles' grade card: what the pass looked like from the platform. */}
        {hud.lsoGrade && (
          <div className="lso-card">
            <div className="lso-grade-row">
              <span className="menu-world-label">LSO GRADE</span>
              <strong className={"lso-grade " + gradeClass(hud.lsoGrade.grade)}>{hud.lsoGrade.grade}</strong>
            </div>
            <p className="result-sub">{hud.lsoGrade.summary}</p>
          </div>
        )}
        {hud.operation?.state.kind === "campaign" && (
          <p className="result-sub">
            {operationTitle(hud.operation.state)} · the stage and everything already wrecked carry to the next sortie
          </p>
        )}
        {!died && !live && (
          <p className="result-sub">
            Recovered on {launchPointLabel(settings)} · rearm &amp; continue launches from there
          </p>
        )}
        <div className="menu-buttons">
          {hud.operation && (hud.operation.state.status === "success" || hud.operation.state.status === "failure") && <Btn onClick={() => sim.finishOperation()}>OPERATION DEBRIEF</Btn>}
          {live ? (
            <>
              {!died && hud.operation && (kind === "wire" || kind === "landing") && <Btn primary onClick={() => sim.continueRecovery()}>REARM & CONTINUE</Btn>}
              <Btn primary={died || !hud.operation} onClick={() => sim.returnToRoom()}>BACK TO THE ROOM</Btn>
            </>
          ) : (
            <Btn primary onClick={() => kind === "wire" || kind === "landing" ? sim.continueRecovery() : sim.restart()}>{kind === "wire" || kind === "landing" ? "REARM & CONTINUE" : "FLY AGAIN"}</Btn>
          )}
          {(kind === "wire" || kind === "landing") && !live && <Btn onClick={() => sim.restart()}>RESTART MISSION</Btn>}
          <Btn onClick={() => sim.quitToMenu()}>QUIT TO MENU</Btn>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function MissionBrief({ mode, settings, onSettings, disabled = false }: {
  mode: "strike" | "dogfight" | "campaign"; settings: Settings; onSettings: (s: Settings) => void; disabled?: boolean;
}) {
  const authored = settings.missionStyle !== "endless";
  const bastion = (settings.strikeVariant ?? "convoy") === "bastion";
  return <div className="mission-brief">
    <div className="menu-world-chips">
      <button disabled={disabled} className={"world-chip" + (authored ? " on" : "")} onClick={() => onSettings({ ...settings, missionStyle: "operation" })}>OPERATION</button>
      <button disabled={disabled} className={"world-chip" + (!authored ? " on" : "")} onClick={() => onSettings({ ...settings, missionStyle: "endless" })}>ENDLESS PRACTICE</button>
    </div>
    {authored && mode === "strike" && <div className="menu-world-chips">
      <button disabled={disabled} className={"world-chip" + (!bastion ? " on" : "")} onClick={() => onSettings({ ...settings, strikeVariant: "convoy" })}>CONVOY</button>
      <button disabled={disabled} className={"world-chip" + (bastion ? " on" : "")} onClick={() => onSettings({ ...settings, strikeVariant: "bastion" })}>IRON BASTION</button>
    </div>}
    <strong>{!authored ? "ENDLESS WAVES" : mode === "campaign" ? "TASK FORCE ARCHON" : mode === "strike" ? (bastion ? "OPERATION IRON BASTION" : "STOP THE CONVOY") : "FLEET DEFENSE"}</strong>
    <p className="menu-note">{!authored ? "Practice against repeating waves. Recover to repair and rearm." : mode === "campaign"
      ? "Three ordered stages: island bastion, convoy, opposing fleet. Stage, wrecks and damage carry across sorties."
      : mode === "strike"
      ? bastion
        ? "Bunker, hangars and fuel depot, behind radar-cued SAMs and AAA."
        : "Stop 2 of 3 transports before they unload."
      : "Scout, then two escorted bomber attacks. Bomb the flight deck to stop launches."}</p>
    {authored && <p className="menu-note">{mode === "campaign" ? "Recovery rearms without resetting the operation, so the war continues." : "Recovery rearms without resetting the operation."}</p>}
  </div>;
}

/** Colour treatment for an LSO grade: the good pass, the fair one, the ugly one. */
function gradeClass(grade: string): string {
  if (grade === "OK") return "good";
  if (grade === "(OK)" || grade === "B") return "fair";
  return "poor";
}

function OperationDebrief({ sim }: { sim: Sim }) {
  const hud = useHud(sim), op = hud.operation;
  if (!op) return null;
  const s = op.state, resolved = s.status === "success" || s.status === "failure";
  const mayRestart = hud.netStatus !== "online" || hud.netHost;
  return <div className="ui-root result-bg"><div className="result-panel operation-debrief">
    <span className="menu-world-label">{operationTitle(s)} · OPERATION {s.seed}</span>
    <h2 className="result-title">{s.status === "success" ? "OBJECTIVE SECURED" : s.status === "failure" ? "OPERATION FAILED" : "OPERATION STATUS"}</h2>
    <p className="result-detail">{phaseObjective(s)}</p>
    <div className="operation-stats">
      {(s.kind === "bastion" || (s.kind === "campaign" && s.phase === "bastion")) ? <p>Fortress {s.stopped}/3 · radar {op.radarOnline ? "up" : "down"} · optional {s.optional}</p>
        : s.kind === "convoy" ? <p>Stopped {s.stopped}/3 · arrived {s.arrived}/3 · optional {s.optional}</p>
        : <p>Carrier {Math.round(s.fleetHull)}% · scout {s.scoutStopped ? "stopped" : s.scoutReported ? "reported" : "pending"} · launches {s.suppressed ? "suppressed" : "active"}</p>}
      {s.kind === "campaign" && <p>Stage {(s.campaignStage ?? 1)}/3</p>}
      <p>{Math.floor(s.elapsed / 60)}m {Math.floor(s.elapsed % 60)}s · kills {op.kills} · ordnance {op.storesUsed} · {hud.weatherLabel}</p>
      {op.recoveryBonus > 0 && <p>Recovery +{op.recoveryBonus}{op.recoveryBonus === 150 ? ` · wire ${op.recoveryWire}` : ""}</p>}
    </div>
    <div className="menu-buttons">
      {(!hud.resultKind && s.status !== "failure") && <Btn primary onClick={() => sim.recoverOperation()}>{resolved ? "RECOVER FOR BONUS" : "RESUME OPERATION"}</Btn>}
      {mayRestart && <Btn primary={s.status === "failure"} onClick={() => sim.restart()}>RETRY SAME OPERATION</Btn>}
      {mayRestart && <Btn onClick={() => sim.nextOperation()}>NEXT OPERATION</Btn>}
      {!mayRestart && <p className="menu-note">The host chooses Retry or Next for the room.</p>}
      <Btn onClick={() => sim.quitToMenu()}>FINISH TO MENU</Btn>
    </div>
  </div></div>;
}

function SettingsPanel({ sim = null, settings, onSettings, onBack }: {
  sim?: Sim | null; settings: Settings; onSettings: (s: Settings) => void; onBack: () => void;
}) {
  const net = useNet(sim);
  const set = (patch: Partial<Settings>) => onSettings({ ...settings, ...patch });
  const [tab, setTab] = useState("flight");
  return <div className="menu-screen settings-screen">
    <h3 className="menu-h3">SETTINGS</h3>
    {net.status === "online" && <p className="menu-note" role="status">ROOM {net.room} · {net.host ? "HOST" : "FLIGHT MEMBER"} · {net.allowLateJoin === false ? "JOINING AFTER LAUNCH DISABLED" : "JOINING AFTER LAUNCH ALLOWED"}</p>}
    <nav className="settings-tabs" aria-label="Settings category">{["flight", "controls", "graphics", "audio", "interface"].map(t => <button key={t} aria-pressed={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t.toUpperCase()}</button>)}</nav>
    {tab === "flight" && <>
      <label className="menu-row"><span>Weather</span><select value={settings.weather ?? "clear"} onChange={e => set({ weather: e.target.value as WeatherMode })}>{(Object.keys(WEATHER_LABELS) as WeatherMode[]).map(m => <option key={m} value={m}>{WEATHER_LABELS[m]}</option>)}</select></label>
      <label className="menu-row"><span>Daylight</span><select value={settings.daylight} onChange={e => set({ daylight: e.target.value as DaylightMode })}>{(Object.keys(DAYLIGHT_LABELS) as DaylightMode[]).map(m => <option key={m} value={m}>{DAYLIGHT_LABELS[m]}</option>)}</select></label>
      <label className="menu-row"><span>Time / {String(Math.floor(settings.timeOfDay)).padStart(2, "0")}:{String(Math.round(settings.timeOfDay % 1 * 60)).padStart(2, "0")}</span><input type="range" min={0} max={23.75} step={0.25} disabled={settings.daylight !== "fixed"} value={settings.timeOfDay} onChange={e => set({ timeOfDay: Number(e.target.value) })} /></label>
      <p className="menu-note">Aircraft and mission are set in Sortie Setup; room hosts pick the shared mission.</p>
    </>}
    {tab === "controls" && <><label className="menu-row"><span>Sensitivity / {settings.sensitivity.toFixed(2)}</span><input type="range" min={0.4} max={3} step={0.05} value={settings.sensitivity} onChange={e => set({ sensitivity: Number(e.target.value) })} /></label><ControlsPanel settings={settings} onSettings={onSettings} onBack={onBack} /></>}
    {tab === "graphics" && <><label className="menu-row"><span>World detail</span><select value={settings.quality} onChange={e => set({ quality: e.target.value as Quality })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="menu-row"><span>Adaptive resolution</span><input type="checkbox" checked={settings.adaptiveResolution} onChange={e => set({ adaptiveResolution: e.target.checked })} /></label><p className="menu-note">Drops resolution to hold the frame rate; Low also thins scenery and effects.</p></>}
    {tab === "audio" && <label className="menu-row"><span>Volume / {Math.round(settings.volume * 100)}%</span><input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={e => set({ volume: Number(e.target.value) })} /></label>}
    {tab === "interface" && <>
      <label className="menu-row"><span>Show minimap</span><input type="checkbox" checked={settings.minimap} onChange={e => set({ minimap: e.target.checked })} /></label>
      <label className="menu-row"><span>Angle ladder (green pitch/roll overlay)</span><input type="checkbox" checked={settings.hudLadder} onChange={e => set({ hudLadder: e.target.checked })} /></label>
      <label className="menu-row"><span>Gun cross (green sight, tracer line, range)</span><input type="checkbox" checked={settings.hudGunCross} onChange={e => set({ hudGunCross: e.target.checked })} /></label>
      <p className="menu-note">In the air, {keyLabel(settings.bindings.settings ?? "KeyO")} pauses and opens this screen. Both overlays sit over the middle of the view.</p>
    </>}
    {tab !== "controls" && <Btn onClick={onBack}>BACK</Btn>}
  </div>;
}

export function ControlsPanel({ settings, onSettings, onBack }: {
  settings: Settings; onSettings: (s: Settings) => void; onBack: () => void;
}) {
  const [capturing, setCapturing] = useState<Action | null>(null);
  const rotor = AIRCRAFT_LIST.find((a) => a.id === settings.aircraft)?.rotorcraft === true;

  useEffect(() => {
    if (!capturing) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.repeat) return;
      if (e.code !== "Escape") {
        onSettings({ ...settings, bindings: rebind(settings.bindings, capturing, e.code) });
      }
      setCapturing(null);
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [capturing, settings, onSettings]);

  // The same key is a different control on a helicopter: the throttle axis is
  // the collective lever, and the fore/aft pair tilts the disc the other way.
  // Bindings are shared across the fleet, so only the wording changes — and the
  // rows a helicopter has no use for (gear, flaps, speed brake, burner,
  // catapult) are left out of the list rather than advertised and ignored.
  const rotorLabels: Partial<Record<Action, string>> = {
    pitchUp: "Disc forward (fly forward)",
    pitchDown: "Disc back (slow, then reverse)",
    throttleUp: "Collective up (climb)",
    throttleDown: "Collective down (descend)",
  };
  const rotorUnused = new Set<Action>(["gear", "flaps", "speedbrake", "ab", "cat"]);
  const actions = (Object.keys(ACTION_LABELS) as Action[]).filter(
    (a) => !(rotor && rotorUnused.has(a)),
  );
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
            <span>{rotor ? (rotorLabels[a] ?? ACTION_LABELS[a]) : ACTION_LABELS[a]}</span>
            <kbd>
              {capturing === a ? "press a key…" : keyLabel(settings.bindings[a])}
            </kbd>
          </button>
        ))}
      </div>
      {rotor && (
        <p className="menu-note">
          Helicopter: the collective is the height lever, the cyclic tilts the
          disc, and the pedals swing the tail. The fore/aft pair reads the
          reverse of the winged stick — up flies the machine forward.
        </p>
      )}
      <p className="menu-note">
        Drag the mouse to look around · {keyLabel(settings.bindings.camera)} cycles chase / cockpit / action. {keyLabel(settings.bindings.bomb)} opens
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
  const activeOperation = sim?.snapshot.operation?.state.status === "active";
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
          {/* Watching is always allowed: a spectator never asks the host to
              admit another aircraft, so it works before and after a launch. */}
          <Btn
            disabled={!canConnect}
            onClick={() => {
              commit();
              sim?.joinAsSpectator(name, code);
            }}
          >
            JOIN AS SPECTATOR
          </Btn>
        </div>
      )}

      {live && (
        <>
          <div className="menu-row-btns">
            <Btn primary onClick={() => sim?.leaveRoom()}>LEAVE ROOM</Btn>
            {/* A spectator can step into the fight, or out of it, at any time. */}
            {!net.host && <Btn onClick={() => sim?.setSpectating(!net.spectator)}>
              {net.spectator ? "TAKE A SEAT IN THE COCKPIT" : "SWITCH TO SPECTATOR"}
            </Btn>}
          </div>
          <div className="menu-world-note">
            Room {net.room} joined — leave to open or join another.
            {net.spectator && " You are watching this room: no aircraft of yours is in the fight."}
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
            {net.spectator && (
              <div className="mp-pilot self">
                <span className="dot online" />
                <span className="mp-pilot-name">{name.toUpperCase() || "SPECTATOR"}</span>
                <span className="mp-pilot-air">watching</span>
                <span className="badge">SPECTATING</span>
              </div>
            )}
            {net.pilots.map((p) => (
              <div className="mp-pilot" key={p.id}>
                <span className={"dot " + (p.linked ? "online" : "connecting")} />
                <span className="mp-pilot-name">{p.name.toUpperCase()}</span>
                <span className="mp-pilot-air">
                  {p.spectator ? "watching" : AIRCRAFT_LIST.find((a) => a.id === p.aircraft)?.name ?? p.aircraft}
                </span>
                {p.host && <span className="badge">HOST</span>}
                {p.spectator && !p.host && <span className="badge">SPECTATOR</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {live && <div className="mp-launch">
          <div className="menu-world">
            <span className="menu-world-label">YOUR AIRCRAFT</span>
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
        </div>}

      {/* Only the host picks the sortie and its settings: the room lifts off
          together, so a wingman's job is to be in the lobby when it does. */}
      {online && net.host && (
        <div className="mp-launch">
          <span className="menu-world-label">LAUNCH SETUP</span>
          <label className="menu-row">
            <span>Allow players to join after the game starts</span>
            <input type="checkbox" checked={net.allowLateJoin !== false} onChange={e => sim?.setAllowLateJoin(e.target.checked)} />
          </label>
          <div className="menu-world">
            <span className="menu-world-label">MISSION</span>
            <div className="menu-world-chips">
              {(Object.keys(MISSION_MODE_LABELS) as MissionMode[]).map((m) => (
                <button
                  key={m}
                  className={"world-chip" + (settings.missionMode === m ? " on" : "")}
                  title={MISSION_MODE_LABELS[m]}
                  disabled={activeOperation}
                  onClick={() => onSettings({ ...settings, missionMode: m })}
                >
                  {MISSION_MODE_CHIPS[m]}
                </button>
              ))}
            </div>
          </div>
          {(settings.missionMode === "dogfight" || settings.missionMode === "strike" || settings.missionMode === "campaign") && <MissionBrief mode={settings.missionMode} settings={settings} onSettings={onSettings} disabled={activeOperation} />}
          {activeOperation && <p className="menu-note">Finish the current operation first.</p>}
          <label className="menu-row">
            <span>Weather (the whole room feels it)</span>
            <select
              value={settings.weather ?? "clear"}
              onChange={(e) => onSettings({ ...settings, weather: e.target.value as WeatherMode })}
            >
              {(Object.keys(WEATHER_LABELS) as WeatherMode[]).map((w) => (
                <option key={w} value={w}>{WEATHER_LABELS[w]}</option>
              ))}
            </select>
          </label>
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
      {online && !net.host && settings.missionMode === "versus" && net.started && <Btn onClick={() => sim?.joinBattle()}>JOIN ACTIVE AIR BATTLE</Btn>}
      {online && !net.host && (
        <div className="mp-launch">
          <span className="menu-world-label">WAITING FOR THE HOST</span>
          <div className="menu-world-note">
            The room's mission is {MISSION_MODE_LABELS[settings.missionMode]}. Stay in the lobby: you lift off with the host. In flight, press Enter to chat.
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
