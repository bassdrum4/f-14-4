/** Drive the production frame scheduler with a monotonic virtual clock. */
import assert from "node:assert/strict";
import { Multiplayer, emptyPose } from "../src/net/multiplayer";
import { FLAG_ACTIVE } from "../src/render/remoteJets";
const original = Object.getOwnPropertyDescriptor(performance, "now");
let now = 1000;
Object.defineProperty(performance, "now", {
  configurable: true,
  value: () => now,
});
try {
  for (const fps of [20, 30, 60, 90, 144])
    for (const roll of [false, true]) {
      now = 1000;
      const net = new Multiplayer(),
        sent: number[] = [];
      const conn = {
        open: true,
        peer: "remote",
        dataChannel: { bufferedAmount: 0 },
        bufferSize: 0,
        send: (data: unknown) => {
          if (data instanceof ArrayBuffer) sent.push(now);
        },
        close() {},
      };
      Object.assign(net, {
        status: "online",
        conns: new Map([["remote", conn]]),
      });
      const p = emptyPose();
      p.flags = FLAG_ACTIVE;
      p.y = 2000;
      p.vx = 250;
      p.speed = 250;
      for (let frame = 0; frame < fps * 10; frame++) {
        now = 1000 + (frame * 1000) / fps;
        p.x = (now - 1000) * 0.25;
        if (roll) {
          p.qz = Math.sin(((now - 1000) / 1000) * 1.5);
          p.qw = Math.cos(((now - 1000) / 1000) * 1.5);
        }
        net.publish(p);
      }
      const hz = sent.length / 10;
      console.log(
        `${fps} fps ${roll ? "roll" : "cruise"}: ${hz.toFixed(1)} motion Hz`,
      );
      assert(hz <= 60.2);
      if (!roll) assert(Math.abs(hz - Math.min(30, fps)) < 1);
      else assert(hz >= Math.min(fps, 45));
      net.dispose();
    }
} finally {
  if (original) Object.defineProperty(performance, "now", original);
  else delete (performance as any).now;
}
console.log("ALL MOTION SCHEDULING CHECKS PASSED");
