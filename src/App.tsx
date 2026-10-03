import { useEffect, useRef, useState } from "react";
import { Game } from "./game/game";
import { UiRoot } from "./ui/menus";
import { loadSettings, saveSettings, type Settings } from "./settings";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    if (!canvasRef.current) return;
    const g = new Game(canvasRef.current, settings);
    setGame(g);
    let cancelled = false;
    // restore the saved world; fall back to the islands if Mapbox is unavailable
    if (settings.world !== "archipelago") {
      void g.setWorldKind(settings.world).then((err) => {
        if (cancelled || !err) return;
        setSettings((s) => {
          const next = { ...s, world: "archipelago" as const };
          saveSettings(next);
          return next;
        });
      });
    }
    return () => {
      cancelled = true;
      g.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSettings = (s: Settings) => {
    setSettings(s);
    saveSettings(s);
    game?.applySettings(s);
  };

  return (
    <div className="app">
      <canvas ref={canvasRef} className="game-canvas" />
      <UiRoot game={game} settings={settings} onSettings={updateSettings} />
    </div>
  );
}
