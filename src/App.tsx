import { useEffect, useRef, useState } from "react";
import { Sim } from "./sim/engine";
import { UiRoot } from "./ui/menus";
import { loadSettings, saveSettings, type Settings } from "./settings";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sim, setSim] = useState<Sim | null>(null);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    if (!canvasRef.current) return;
    // The world is generated from the room code, so the sim starts on the
    // home islands and follows whatever room the pilot opens or joins. The
    // account name and callsign are applied where they are used (the lobby, the
    // roster and the feedback form), so there is nothing to restore here.
    const g = new Sim(canvasRef.current, settings);
    setSim(g);
    // Bored embeds the game in an iframe. Share only coarse gameplay signals
    // with that parent, not account data or a Supabase client connection.
    // Standalone flights send nothing and keep their existing behavior.
    const embedded = window.parent !== window;
    const notify = (event: "ready" | "phase" | "input", phase: string) => {
      if (embedded) window.parent.postMessage({ type: "bored:f14-telemetry", event, phase }, "*");
    };
    let previousPhase: string = g.phase;
    let lastInputSignal = 0;
    notify("ready", previousPhase);
    const interaction = () => {
      if (!embedded || g.phase !== "flying" || document.hidden) return;
      const now = performance.now();
      if (now - lastInputSignal < 900) return; // bounded iframe message traffic
      lastInputSignal = now;
      notify("input", "flying");
    };
    const observePhase = embedded ? window.setInterval(() => {
      if (g.phase !== previousPhase) {
        previousPhase = g.phase;
        notify("phase", previousPhase);
      }
    }, 1000) : null;
    if (embedded) {
      window.addEventListener("keydown", interaction, { passive: true });
      canvasRef.current.addEventListener("pointerdown", interaction, { passive: true });
    }
    const observedCanvas = canvasRef.current;
    return () => {
      if (observePhase !== null) window.clearInterval(observePhase);
      if (embedded) {
        window.removeEventListener("keydown", interaction);
        observedCanvas?.removeEventListener("pointerdown", interaction);
      }
      g.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The room can ask for a setting — today the host's mission profile, so every
  // pilot in a room flies the same fight. The UI owns settings, so apply it and
  // persist it here rather than letting the sim rewrite them behind the menu.
  useEffect(() => {
    if (!sim) return;
    return sim.subscribeSettings((s) => {
      setSettings(s);
      saveSettings(s);
      sim.applySettings(s);
    });
  }, [sim]);

  const updateSettings = (s: Settings) => {
    setSettings(s);
    saveSettings(s);
    sim?.applySettings(s);
  };

  return (
    <div className="app">
      <canvas ref={canvasRef} className="sim-canvas" />
      <UiRoot sim={sim} settings={settings} onSettings={updateSettings} />
    </div>
  );
}
