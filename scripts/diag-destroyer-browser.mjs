// Full UI/renderer smoke test. Install Chromium with `npx playwright install chromium`.
// F14_CHROMIUM_EXECUTABLE can select an existing executable.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { createServer } from "vite";
const server = await createServer({ server: { host: "127.0.0.1", port: 5173 } });
await server.listen();
const browser = await chromium.launch({ headless: true, executablePath: process.env.F14_CHROMIUM_EXECUTABLE,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", e => errors.push(e.message));
  // Expose the real App instance only in this test, without a production global.
  await page.route("**/src/App.tsx", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace("setSim(g);", "setSim(g); window.__destroyerTest = g;") });
  });
  await page.addInitScript(() => localStorage.setItem("f14sim.onboarded.v1", "1"));
  await page.goto(`http://127.0.0.1:${server.config.server.port}`);
  await page.getByRole("button", { name: /FLY SOLO/ }).click();
  await page.getByRole("button", { name: /DDG DESTROYER/ }).click();
  assert(await page.getByRole("button", { name: /DDG DESTROYER.*BETA PHASE/ }).isVisible());
  assert.equal(await page.getByRole("button", { name: /TAKEOFF — RUNWAY/ }).count(), 0);
  await page.getByRole("button", { name: "SEA TRIALS", exact: true }).click();
  await page.screenshot({ path: "/tmp/f14-destroyer-selector.png" });
  await page.getByRole("button", { name: "TAKE STATION — DESTROYER", exact: true }).click();
  await page.waitForFunction(() => window.__destroyerTest?.phase === "flying");
  await page.waitForTimeout(300);
  const get = () => page.evaluate(() => {
    const sim = window.__destroyerTest, s = sim.state;
    return { id: s.spec.id, y: s.pos.y, throttle: s.throttle, heading: s.headingDeg, turret: s.turretYaw ?? 0,
      missiles: sim.df.missilesLeft, pod: sim.snapshot.pod, speed: s.speed, onGround: s.onGround, result: s.result };
  });
  let state = await get(); assert.equal(state.id, "destroyer"); assert.equal(state.onGround, false); assert.equal(state.result, null);
  await page.screenshot({ path: "/tmp/f14-destroyer-sea.png" });
  await page.keyboard.down("w");
  await page.waitForFunction(() => window.__destroyerTest.state.throttle > .05 && window.__destroyerTest.state.speed > 0, null, { timeout: 15000 });
  await page.keyboard.up("w");
  state = await get(); assert(state.throttle > .05 && state.speed > 0);
  const initial = state;
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(start => window.__destroyerTest.state.turretYaw > start + .03, initial.turret, { timeout: 15000 });
  await page.keyboard.up("ArrowRight");
  state = await get(); assert(state.turret > initial.turret + .03); assert.equal(state.heading, initial.heading);
  await page.keyboard.press("r"); await page.waitForFunction(() => window.__destroyerTest.snapshot.pod);
  await page.keyboard.down("q");
  await page.waitForFunction(() => window.__destroyerTest.df.tracers.some(t => !t.hostile), null, { timeout: 15000 });
  await page.keyboard.up("q");
  assert(await page.evaluate(() => window.__destroyerTest.df.tracers.some(t => !t.hostile)));
  await page.screenshot({ path: "/tmp/f14-destroyer-director.png" });
  await page.keyboard.press("Escape"); await page.waitForFunction(() => window.__destroyerTest.phase === "paused");
  await page.keyboard.press("Escape"); await page.waitForFunction(() => window.__destroyerTest.phase === "flying");
  await page.reload(); await page.waitForFunction(() => window.__destroyerTest?.state.spec.id === "destroyer");
  assert.deepEqual(errors, []);
  console.log("PASS selector beta label, safe sea launch, throttle, independent director, firing, pause/resume, saved selection and WebGL rendering");
} finally { await browser.close(); await server.close(); }
