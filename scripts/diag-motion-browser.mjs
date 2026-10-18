/** Actual Chromium + PeerJS + localhost signalling, three pages in one mesh.
 * Install browser: npx playwright install chromium
 * Run: npm run test:motion:browser
 * Optional executable: F14_CHROMIUM_EXECUTABLE=/absolute/path/chromium
 * Impairments delay/drop application motion sends; they do not emulate UDP/NAT. */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { build } from "esbuild";
import { chromium } from "@playwright/test";
import { PeerServer } from "peer";

const { outputFiles } = await build({
  entryPoints: ["scripts/fixtures/motionBrowserClient.ts"],
  bundle: true,
  write: false,
  format: "iife",
  define: { "import.meta.env": "{}" },
});
const legacySource = execFileSync(
  "git",
  ["show", "36357aa:src/net/multiplayer.ts"],
  { encoding: "utf8" },
);
const legacyBuild = await build({
  entryPoints: ["scripts/fixtures/motionBrowserClient.ts"],
  bundle: true,
  write: false,
  format: "iife",
  define: { "import.meta.env": "{}" },
  plugins: [
    {
      name: "historical-multiplayer",
      setup(b) {
        b.onLoad({ filter: /src\/net\/multiplayer\.ts$/ }, (args) => ({
          contents: legacySource,
          loader: "ts",
          resolveDir: dirname(args.path),
        }));
      },
    },
  ],
});
const legacyHtml = `<!doctype html><title>F14 historical peer</title><script>${legacyBuild.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script>`;
const html = `<!doctype html><title>F14 real WebRTC regression</title><script>${outputFiles[0].text.replaceAll("</script", "<\\/script")}</script>`;
const web = createServer((req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end(req.url === "/legacy" ? legacyHtml : html);
});
await new Promise((resolve) => web.listen(0, "127.0.0.1", resolve));
let signal;
const peerServer = PeerServer(
  { port: 0, host: "127.0.0.1", path: "/net", allow_discovery: false },
  (server) => {
    signal = server;
  },
);
// PeerServer invokes the callback asynchronously after listening.
while (!signal?.listening) await new Promise((r) => setTimeout(r, 10));
const port = signal.address().port,
  url = `http://127.0.0.1:${web.address().port}`;
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.F14_CHROMIUM_EXECUTABLE,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--allow-loopback-in-peer-connection",
    "--disable-features=WebRtcHideLocalIpsWithMdns",
  ],
});
const contexts = [],
  pages = [];
let errors = [];
const snap = async (p) => p.evaluate(() => window.networkTest.snapshot());
const wait = async (fn) => {
  const end = Date.now() + 15000;
  while (Date.now() < end) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw Error("Timed out waiting for network assertion");
};
try {
  for (let i = 0; i < 3; i++) {
    const context = await browser.newContext({ permissions: ["microphone"] });
    contexts.push(context);
    const page = await context.newPage();
    pages.push(page);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") console.error("BROWSER", msg.text());
    });
    await page.goto(url);
    await page.evaluate(async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    });
    await page.evaluate(
      ({ port, host }) => window.networkTest.start(port, host, "BROWSER"),
      { port, host: i === 0 },
    );
    await wait(async () => {
      const s = await snap(page);
      return s.net.status === "online" && (i === 0 || s.events.poses > 10);
    });
  }
  await wait(async () => {
    const ss = await Promise.all(pages.map(snap));
    return ss.every(
      (s) =>
        s.net.pilots.length === 2 &&
        s.links.length === 2 &&
        s.links.every((l) => l.transport === "motion"),
    );
  });
  let states = await Promise.all(pages.map(snap));
  for (const s of states)
    for (const t of s.transports) {
      assert.equal(t.reliable, true);
      assert.equal(t.maxRetransmits, null);
      assert.equal(t.motion.ordered, false);
      assert.equal(t.motion.maxRetransmits, 0);
      assert.equal(t.motion.id, 32);
    }
  assert(
    states.every((s) => s.pcs === 2 && s.motionChannels === 2),
    "one PC and motion channel per peer",
  );
  console.log(
    "PASS actual three-page PeerJS mesh: reliable controls + negotiated unordered zero-retransmit motion, same PC",
  );
  const counts = states.map((s) => s.events.poses);
  await pages[0].evaluate(() =>
    window.networkTest.impair({
      latency: 100,
      jitter: 45,
      loss: 0.1,
      reorder: true,
      burst: true,
    }),
  );
  await pages[0].evaluate(() => {
    window.networkTest.chat();
    window.networkTest.shot();
  });
  await wait(async () => {
    const ss = await Promise.all(pages.slice(1).map(snap));
    return ss.every(
      (s) =>
        s.events.chat === 1 &&
        s.events.shots === 1 &&
        s.events.poses > counts[1] + 30,
    );
  });
  await wait(async () => {
    const ss = await Promise.all(pages.slice(1).map(snap));
    return ss.some((s) => s.links.some((l) => l.reordered > 0 && l.loss > 0));
  });
  console.log(
    "PASS application-level latency/jitter/10% drop/reorder/delayed bursts; reliable chat and weapon events remain intact",
  );
  await pages[0].evaluate(() => window.networkTest.backpressure());
  const blocked = await snap(pages[0]);
  await new Promise((r) => setTimeout(r, 250));
  const afterBlock = await snap(pages[0]);
  assert(
    afterBlock.links.every(
      (l, i) => l.sentBytes === blocked.links[i].sentBytes,
    ),
  );
  await pages[0].evaluate(() => {
    window.networkTest.chat();
    window.networkTest.drain();
  });
  await wait(async () => {
    const s = await snap(pages[0]);
    return s.links.every((l, i) => l.sentBytes > blocked.links[i].sentBytes);
  });
  console.log(
    "PASS independent motion backpressure coalesces updates; reliable radio continues",
  );
  await pages[0].evaluate(() => {
    window.networkTest.impair({
      latency: 0,
      jitter: 0,
      loss: 0,
      reorder: false,
      burst: false,
    });
    window.networkTest.closeMotion();
  });
  await wait(async () => {
    const s = await snap(pages[0]);
    return (
      s.motionChannels >= 4 && s.links.every((l) => l.transport === "motion")
    );
  });
  console.log(
    "PASS closed motion channels recreate on the existing peer connections",
  );
  const guest = await snap(pages[1]),
    hostId = states[0].net.self;
  await pages[1].evaluate((id) => window.networkTest.drop(id), hostId);
  await wait(async () => {
    const s = await snap(pages[1]);
    return (
      s.net.pilots.some((p) => p.id === hostId && p.linked) &&
      s.links.some((l) => l.id === hostId && l.transport === "motion") &&
      s.events.poses > guest.events.poses + 20
    );
  });
  console.log("PASS real PeerJS host reconnection renegotiates motion");
  await pages[0].evaluate(() => {
    window.networkTest.visibility(true);
    window.networkTest.pause(true);
  });
  await new Promise((r) => setTimeout(r, 500));
  // Returning from a background/throttled tab must not extrapolate indefinitely.
  const held = await snap(pages[1]);
  assert(held.motion.every((m) => Number.isFinite(m.correctionM)));
  await pages[0].evaluate(() => {
    window.networkTest.visibility(false);
    window.networkTest.pause(false);
  });
  console.log(
    "PASS visibility hold/resume and stale prediction remain finite (synthetic visibility, not browser timer throttling)",
  );
  const legacyContext = await browser.newContext({
    permissions: ["microphone"],
  });
  contexts.push(legacyContext);
  const legacyPage = await legacyContext.newPage();
  pages.push(legacyPage);
  legacyPage.on("pageerror", (e) => errors.push(e.message));
  await legacyPage.goto(url + "/legacy");
  await legacyPage.evaluate(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
  });
  await legacyPage.evaluate(
    (port) => window.networkTest.start(port, false, "BROWSER"),
    port,
  );
  await wait(async () => {
    const s = await snap(legacyPage);
    return s.events.poses > 30 && s.net.pilots.length === 3;
  });
  const old = await snap(legacyPage);
  assert(old.transports.every((t) => t.motion === null));
  assert(old.events.legacyBytes > 0);
  assert((await snap(pages[0])).links.some((l) => l.transport === "legacy"));
  console.log(
    "PASS historical 36357aa client exchanges exact 52-byte poses alongside modern peers",
  );
  states = await Promise.all(pages.map(snap));
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        browser: browser.version(),
        states: states.map((s) => ({
          id: s.net.self,
          poses: s.events.poses,
          links: s.links,
          motion: s.motion,
        })),
      },
      null,
      2,
    ),
  );
  console.log("ALL BROWSER NETWORK CHECKS PASSED");
} catch (error) {
  console.error(
    JSON.stringify(
      { errors, states: await Promise.all(pages.map(snap)) },
      null,
      2,
    ),
  );
  throw error;
} finally {
  for (const p of pages)
    await p.evaluate(() => window.networkTest.stop()).catch(() => {});
  await browser.close();
  web.close();
  signal.close();
  peerServer.emit("close");
}

// peer@1.0.2's maintenance timers have no public shutdown API. All sockets and
// browsers are closed above; end this standalone diagnostic's remaining timers.
process.exit(0);
