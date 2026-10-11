// Ordinary input, cloud restore, slow network, and graphics lifecycle regressions.
import { strict as assert } from 'node:assert';
import { Scene, Mesh, BoxGeometry, MeshStandardMaterial, DirectionalLight } from 'three';
const root = process.env.F14_SOURCE_ROOT ?? new URL('../', import.meta.url).pathname;
const settings = await import(root + 'src/settings.ts');
const { InputManager } = await import(root + 'src/input/input.ts');
const accounts = await import(root + 'src/accounts.ts');
const { ResolutionBudget } = await import(root + 'src/render/performance.ts');
const { WorldRenderer } = await import(root + 'src/render/renderer.ts');
const { spawnAircraft, stepAircraft } = await import(root + 'src/sim/flight.ts');
const feedback = await import(root + 'src/feedback/feedback.ts');
let failed = 0;
async function check(name: string, run: () => void | Promise<void>) {
  try { await run(); console.log('PASS ' + name); }
  catch (e) { failed++; console.error('FAIL ' + name + ': ' + String(e)); }
}
const listeners = new Map<string, Set<(e: any) => void>>();
(globalThis as any).window = {
  addEventListener(type: string, fn: (e: any) => void) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type)!.add(fn); },
  removeEventListener(type: string, fn: (e: any) => void) { listeners.get(type)?.delete(fn); },
};
const canvas = { addEventListener() {}, removeEventListener() {} };
function dispatch(type: string, e: any = {}) { for (const fn of listeners.get(type) ?? []) fn(e); }
function key(code: string) { dispatch('keydown', { code, target: null, repeat: false, preventDefault() {} }); }
function mouse(button = 0) { return { button, clientX: 20, clientY: 30 }; }
await check('Mouse release outside canvas cannot designate a target', () => {
  const input: any = new InputManager(settings.defaultSettings()); input.attach(canvas as any);
  dispatch('mouseup', mouse()); assert.equal(input.takeClick(), null);
  input.onMouseDown(mouse()); dispatch('mouseup', mouse(2)); dispatch('mouseup', mouse());
  assert.deepEqual(input.takeClick(), { x: 20, y: 30 }); input.detach();
});
await check('Focus loss immediately releases smoothed flight axes', () => {
  const input = new InputManager(settings.defaultSettings()); input.attach(canvas as any);
  key('ArrowUp'); assert(input.sample(.2).pitch > 0); dispatch('blur');
  assert.equal(input.sample(1 / 120).pitch, 0); input.detach();
});
await check('An occupied binding swaps keys and both actions remain usable', () => {
  const rebind = (settings as any).rebind;
  const s = settings.defaultSettings(); s.bindings = rebind ? rebind(s.bindings, 'camera', 'KeyE') : { ...s.bindings, camera: 'KeyE' };
  const input = new InputManager(s); input.attach(canvas as any);
  key('KeyE'); assert(input.take('camera')); assert(!input.take('missile'));
  key('KeyC'); assert(input.take('missile')); input.detach();
});
await check('Blocked storage preserves callsign without crashing', () => {
  (globalThis as any).localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.doesNotThrow(() => accounts.currentAccount()); assert(accounts.setCallsign('MAVERICK').ok);
  assert.equal(accounts.currentAccount()?.username, 'MAVERICK');
});
await check('A guest has a stable identity when storage is unavailable', () => {
  const s = settings.loadSettings(); const first = settings.callsignOf(s);
  for (let i = 0; i < 50; i++) assert.equal(settings.callsignOf(s), first);
});
await check('Cloud restoration retains the adaptive resolution preference', () => {
  const s = settings.defaultSettings(); s.adaptiveResolution = false;
  const restored = accounts.applyGamestate(settings.defaultSettings(), accounts.profileOf(s));
  assert.equal(restored.adaptiveResolution, false);
  const legacy: any = accounts.profileOf(s); delete legacy.adaptiveResolution;
  assert.equal(accounts.applyGamestate(settings.defaultSettings(), legacy).adaptiveResolution, true);
});
await check('Catapult requires engine power and still launches after spool-up', () => {
  const s = spawnAircraft('carrier'); const idle = { pitch: 0, roll: 0, yaw: 0, throttleUp: false, throttleDown: false, trimUp: false, trimDown: false, brake: false, catHold: true };
  for (let i = 0; i < 180; i++) stepAircraft(s, idle, 1 / 120);
  assert.equal(s.catPhase, 'ready'); assert(!s.airborne);
  for (let i = 0; i < 540; i++) stepAircraft(s, { ...idle, throttleUp: true }, 1 / 120);
  assert(s.catPhase === 'firing' || s.airborne);
});
await check('Launch hints show the actual assigned keys', () => {
  const s = settings.defaultSettings(); s.bindings.throttleUp = 'KeyI'; s.bindings.cat = 'KeyL';
  const jet = spawnAircraft('carrier', 0, 'tomcat', s.bindings);
  assert(jet.banner?.text.includes('(I)')); assert(jet.banner?.text.includes('HOLD L'));
});
await check('Adaptive resolution responds to sustained three FPS', () => {
  const budget = new ResolutionBudget();
  for (let i = 1; i < 40; i++) budget.sample(i * 333, true, true);
  assert.equal(budget.scale, .65);
});
await check('Renderer teardown releases world GPU resources exactly once', () => {
  const scene = new Scene(); const geo = new BoxGeometry(); const mat = new MeshStandardMaterial();
  scene.add(new Mesh(geo, mat), new Mesh(geo, mat));
  let geometries = 0, materials = 0; geo.addEventListener('dispose', () => geometries++); mat.addEventListener('dispose', () => materials++);
  const renderer: any = Object.create(WorldRenderer.prototype);
  Object.assign(renderer, { scene, sun: new DirectionalLight(), scaleCues: { dispose() {} }, renderer: { dispose() {} } });
  renderer.dispose(); assert.equal(geometries, 1); assert.equal(materials, 1);
});
const data = new Map<string, string>();
(globalThis as any).localStorage = { getItem(k: string) { return data.get(k) ?? null; }, setItem(k: string, v: string) { data.set(k, v); } };
const input = { kind: 'bug' as const, message: 'Network retry regression', includeContext: false };
const nativeFetch = globalThis.fetch;
await check('Submitting during a flush cannot lose a queued report', async () => {
  feedback.clearPending(); globalThis.fetch = async () => { throw new Error('offline'); };
  await feedback.submitFeedback(input, null);
  let release!: () => void; const wait = new Promise<void>(resolve => { release = resolve; });
  globalThis.fetch = async () => { await wait; return new Response('{"ok":true}'); };
  const flushing = feedback.flushFeedback();
  globalThis.fetch = async () => { throw new Error('offline'); };
  await feedback.submitFeedback({ ...input, message: 'New report during retry' }, null);
  release(); await flushing;
  assert.equal(feedback.pendingCount(), 1); assert.equal(feedback.listPending()[0].message, 'New report during retry');
});
await check('Overlapping retry requests send each report once', async () => {
  feedback.clearPending(); globalThis.fetch = async () => { throw new Error('offline'); };
  await feedback.submitFeedback(input, null);
  let release!: () => void; const wait = new Promise<void>(resolve => { release = resolve; }); let posts = 0;
  globalThis.fetch = async () => { posts++; await wait; return new Response('{"ok":true}'); };
  const a = feedback.flushFeedback(), b = feedback.flushFeedback(); release(); await Promise.all([a, b]);
  assert.equal(posts, 1); assert.equal(feedback.pendingCount(), 0);
});
globalThis.fetch = nativeFetch;
if (failed) process.exit(1);
