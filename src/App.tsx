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
    return () => {
      g.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
