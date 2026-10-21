// Reproducible WebGL inspection of the actual procedural aircraft and rig.
// F14_CHROMIUM_EXECUTABLE optionally selects an installed Chromium binary.
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const server=await createServer({appType:'custom',server:{host:"127.0.0.1",port:5173}});
server.middlewares.use('/__aircraft-review',(_req,res)=>{
  res.setHeader('Content-Type','text/html');
  res.end(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;background:#19232c;color:#e2e9ed;font:14px system-ui}
    canvas{display:block;width:100vw;height:100vh}#label{position:absolute;top:28px;left:32px}
    h1{font-size:26px;letter-spacing:.08em;margin:0 0 5px}p{margin:0;color:#aebfcb}
    </style></head><body><div id="label"><h1 id="title"></h1><p>PROCEDURAL AIRFRAME · IN-GAME GEOMETRY</p></div><script type="module">
    import * as THREE from '/@fs${process.cwd()}/node_modules/three/build/three.module.js';
    import {buildAircraft} from '/@fs${process.cwd()}/src/render/geometry.ts';
    import {animateJet} from '/@fs${process.cwd()}/src/render/rig.ts';
    import {aircraftEnvironment} from '/@fs${process.cwd()}/src/render/airframe.ts';
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x23323e);
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
    renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(1);
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    document.body.append(renderer.domElement);
    const reflection=aircraftEnvironment(renderer);scene.environment=reflection.texture;scene.environmentIntensity=.65;
    const light=new THREE.DirectionalLight(0xfff1dd,3.2);light.position.set(-15,25,-10);
    light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-22,right:22,top:22,bottom:-22});light.shadow.normalBias=.025;scene.add(light);
    scene.add(new THREE.HemisphereLight(0xc8e6ff,0x3f4852,1.1));
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x253440,roughness:.95}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-2.07;ground.receiveShadow=true;scene.add(ground);
    const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,2000);
    let jet;
    window.inspectAircraft=(id='tomcat',view='front',options={})=>{
      if(jet)scene.remove(jet.group);jet=buildAircraft(id,options.bandit?'bandit':'gray');scene.add(jet.group);
      const state={time:options.time??12,sweepT:options.sweep??0,flapT:options.flap??0,gearT:options.gear??0,wheelPen:0,abLevel:options.ab??0};
      animateJet(jet,state,1,1/60);
      const views={front:[23,14,-27],rear:[-23,10,29],top:[.01,33,.01],side:[29,5,-3],close:[9,6,-12]};
      camera.position.set(...views[view]);camera.lookAt(0,.2,0);scene.updateMatrixWorld(true);renderer.render(scene,camera);
      document.querySelector('#title').textContent=({'tomcat':'F-14A TOMCAT','hornet':'F/A-18C HORNET','crusader':'F-8E CRUSADER','intruder':'A-6E INTRUDER','seahawk':'SH-60B SEAHAWK'})[id];
      window.__aircraft=jet;return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
    };
    window.inspectAircraft();window.__ready=true;
    </script></body></html>`);
});
await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.F14_CHROMIUM_EXECUTABLE,
  args:['--no-sandbox','--no-zygote','--single-process','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
  page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error(m.text());}});
  await page.goto(`http://127.0.0.1:${server.config.server.port}/__aircraft-review`);
  await page.waitForFunction(()=>window.__ready);
  const output=process.env.F14_AIRCRAFT_SCREENSHOTS??'/tmp/f14-aircraft-visuals';mkdirSync(output,{recursive:true});
  for(const id of ['tomcat','hornet','crusader','intruder','seahawk']) {
    const stats=await page.evaluate(id=>window.inspectAircraft(id,'front',{gear:1}),id);
    assert(stats.triangles>1000&&stats.triangles<80000,`${id}: bounded triangle count ${stats.triangles}`);
    assert(stats.calls<100,`${id}: bounded draw calls ${stats.calls}`);
    await page.screenshot({path:`${output}/${id}.png`});
    console.log(`${id}: ${stats.calls} draws, ${stats.triangles} triangles`);
  }
  for(const [name,view,options] of [
    ['tomcat-rear','rear',{ab:1}],['tomcat-top','top',{}],['tomcat-swept','rear',{sweep:1,ab:1}],
    ['tomcat-cockpit','close',{}],['hornet-rear','rear',{ab:1}],['crusader-rear','rear',{ab:1}]
  ]) {
    await page.evaluate(({name,view,options})=>window.inspectAircraft(name.split('-')[0],view,options),{name,view,options});
    await page.screenshot({path:`${output}/${name}.png`});
  }
  assert.deepEqual(errors,[],'no WebGL or runtime errors');
  console.log(`PASS aircraft WebGL rendering; screenshots in ${output}`);
  // Then walk the real UI -> settings -> renderer -> flight path, rather than
  // relying on the isolated model viewer to validate integration.
  const game=await createServer({server:{host:'127.0.0.1',port:5174}});
  await game.listen();
  try {
    const live=await browser.newPage({viewport:{width:1440,height:900}});
    live.on('pageerror',e=>errors.push(e.message));
    live.on('console',m=>{if(m.type()==='error'&&/WebGL|THREE|shader/i.test(m.text()))errors.push(m.text());});
    await live.route('**/src/App.tsx',async route=>{
      const response=await route.fetch();
      await route.fulfill({response,body:(await response.text()).replace('setSim(g);','setSim(g); window.__aircraftGame=g;')});
    });
    await live.addInitScript(()=>{
      localStorage.setItem('f14sim.onboarded.v1','1');
      localStorage.setItem('f14sim.settings.v1',JSON.stringify({quality:'low',volume:0}));
    });
    await live.goto(`http://127.0.0.1:${game.config.server.port}`);
    await live.getByRole('button',{name:/FLY SOLO/}).click();
    for(const [name,id] of [['F/A-18C HORNET','hornet'],['A-6E INTRUDER','intruder'],
      ['F-8E CRUSADER','crusader'],['SH-60B SEAHAWK','seahawk'],['F-14A TOMCAT','tomcat']]) {
      await live.getByRole('button',{name,exact:true}).click();
      await live.waitForFunction(id=>window.__aircraftGame?.state.spec.id===id,id);
      assert.equal(await live.evaluate(()=>window.__aircraftGame.renderer.jet.group.name),`aircraft-${id}`);
    }
    await live.getByRole('button',{name:'TAKEOFF — RUNWAY',exact:true}).click();
    await live.waitForFunction(()=>window.__aircraftGame?.phase==='flying');
    const before=await live.evaluate(()=>window.__aircraftGame.state.throttle);
    await live.keyboard.down('w');
    await live.waitForFunction(t=>window.__aircraftGame.state.throttle>t+.02,before);
    await live.keyboard.up('w');
    // A reproducible airborne pose lets reviewers see the new airframe in the
    // actual world without waiting for a complete manual takeoff.
    await live.evaluate(()=>{
      const sim=window.__aircraftGame,s=sim.state;
      s.pos.y+=1500;s.vel.set(0,0,-220);s.onGround=false;s.gearDown=false;s.gearT=0;
      s.flapsDown=false;s.flapT=0;s.abOn=true;s.throttle=1;s.rpm=1;
      sim.prevPos.copy(s.pos);sim.rig.mode='action';
    });
    await live.waitForFunction(()=>window.__aircraftGame.state.abLevel>.5);
    await live.screenshot({path:`${output}/tomcat-in-flight.png`});
    assert.deepEqual(errors,[],'no runtime or shader errors during aircraft switches and flight');
    assert(await live.evaluate(()=>window.__aircraftGame.renderer.scene.environment!==null));
    await live.keyboard.press('Escape');
    await live.waitForFunction(()=>window.__aircraftGame.phase==='paused');
    await live.close();
    console.log('PASS actual game: five aircraft switches, runway launch, throttle, airborne exhaust, environment reflections and pause');
  } finally {await game.close();}
} finally {await browser.close();await server.close();}
