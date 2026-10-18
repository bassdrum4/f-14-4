/** Real PeerJS client used by diag-motion-browser.mjs; never bundled into the app. */
import { Peer, type DataConnection } from "peerjs";
import { Scene } from "three";
import { Multiplayer, emptyPose } from "../../src/net/multiplayer";
import { RemoteFleet, FLAG_ACTIVE } from "../../src/render/remoteJets";

declare global {
  interface Window {
    networkTest: ReturnType<typeof createClient>;
  }
}
function createClient() {
  const fleet = new RemoteFleet(new Scene());
  const events: {
    chat: number;
    shots: number;
    combats: number;
    poses: number;
    legacyBytes: number;
    errors: string[];
  } = { chat: 0, shots: 0, combats: 0, poses: 0, legacyBytes: 0, errors: [] };
  const profiles = {
    latency: 0,
    jitter: 0,
    loss: 0,
    reorder: false,
    burst: false,
  };
  let net: Multiplayer, timer: ReturnType<typeof setInterval> | undefined;
  let motionChannels = 0,
    pcs = 0,
    random = 7,
    stopped = false;
  const connections: RTCPeerConnection[] = [];
  const rand = () => {
    random = (Math.imul(random, 1664525) + 1013904223) | 0;
    return (random >>> 0) / 4294967296;
  };
  const wrap = (conn: DataConnection) => {
    const originalSend = conn.send.bind(conn);
    conn.send = ((data: unknown) => {
      if (data instanceof ArrayBuffer) events.legacyBytes += data.byteLength;
      originalSend(data);
    }) as DataConnection["send"];
    const pc = conn.peerConnection;
    if (pc) {
      pcs++;
      connections.push(pc);
      const create = pc.createDataChannel.bind(pc);
      pc.createDataChannel = ((label: string, options?: RTCDataChannelInit) => {
        const dc = create(label, options);
        if (label !== "f14-motion-v2") return dc;
        motionChannels++;
        const send = dc.send.bind(dc);
        dc.send = ((data: ArrayBuffer) => {
          // Real RTCDataChannel, with deterministic application-level impairments
          // BEFORE SCTP. This is not a claim of OS-level UDP loss emulation.
          if (rand() < profiles.loss) return;
          const delay = Math.max(
            0,
            profiles.latency +
              (rand() * 2 - 1) * profiles.jitter +
              (profiles.reorder && rand() < 0.15 ? 100 : 0) +
              (profiles.burst && performance.now() % 3000 < 200 ? 250 : 0),
          );
          const copy = data.slice(0);
          setTimeout(() => {
            if (dc.readyState === "open") send(copy);
          }, delay);
        }) as RTCDataChannel["send"];
        return dc;
      }) as RTCPeerConnection["createDataChannel"];
    }
    return conn;
  };
  return {
    async start(port: number, host: boolean, room: string) {
      net = new Multiplayer(
        {
          onPilot: (id, name, aircraft) => fleet.spawn(id, aircraft, name),
          onPilotLeave: (id) => fleet.remove(id),
          onPose: (id, p) => {
            events.poses++;
            fleet.push(id, p, performance.now());
          },
          onLinkDelay: (id, ms) => fleet.setLinkDelay(id, ms),
          onChat: () => events.chat++,
          onBattleShot: () => events.shots++,
          onCombat: () => events.combats++,
        },
        (id, options) => {
          const peer = new Peer(id, {
            ...options,
            host: "127.0.0.1",
            port,
            path: "/net",
            secure: false,
            config: { iceServers: [] },
          });
          const connect = peer.connect.bind(peer);
          peer.connect = ((id: string, options?: any) =>
            wrap(connect(id, options))) as Peer["connect"];
          peer.on("connection", wrap);
          peer.on("error", (e) => events.errors.push(e.type));
          return peer;
        },
      );
      if (host) net.open(room, "LEAD", "tomcat");
      else net.join(room, "WING", "tomcat");
      let last = performance.now();
      const pose = emptyPose();
      pose.flags = FLAG_ACTIVE;
      pose.y = 2000;
      pose.vx = 250;
      pose.speed = 250;
      timer = setInterval(() => {
        const now = performance.now();
        if (!stopped) {
          pose.x += (now - last) * 0.25;
          net.publish(pose);
        }
        last = now;
        fleet.update(now);
      }, 1000 / 60);
    },
    impair(profile: Partial<typeof profiles>) {
      Object.assign(profiles, profile);
    },
    pause(on: boolean) {
      stopped = on;
    },
    visibility(hidden: boolean) {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: hidden,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    },
    drop(peerId: string) {
      (net as any).conns.get(peerId)?.close();
    },
    closeMotion() {
      for (const link of (net as any).motionLinks.values())
        (link as any).channel?.close();
    },
    backpressure() {
      for (const link of (net as any).motionLinks.values()) {
        const dc = (link as any).channel;
        if (!dc) continue;
        Object.defineProperty(dc, "bufferedAmount", {
          configurable: true,
          value: 4096,
        });
      }
    },
    drain() {
      for (const link of (net as any).motionLinks.values()) {
        const dc = (link as any).channel;
        if (dc) delete dc.bufferedAmount;
      }
    },
    chat() {
      net.sendChat("RELIABLE RADIO");
    },
    shot() {
      net.sendBattleShot({
        weapon: "gun",
        match: 1,
        life: 1,
        seq: 1,
        pos: [0, 2000, 0],
        vel: [250, 0, 0],
      });
    },
    snapshot() {
      return {
        net: net.snapshot,
        links: net.networkDiagnostics ?? [],
        motion: fleet.diagnostics(),
        events,
        pcs,
        motionChannels,
        pcStates: connections.map((pc) => ({
          ice: pc.iceConnectionState,
          connection: pc.connectionState,
          gathering: pc.iceGatheringState,
          local: pc.localDescription?.sdp,
          remote: pc.remoteDescription?.sdp,
        })),
        transports: [...(net as any).conns.values()].map((c: any) => ({
          peer: c.peer,
          reliable: c.dataChannel.ordered,
          maxRetransmits: c.dataChannel.maxRetransmits,
          controlLabel: c.dataChannel.label,
          motion: (net as any).motionLinks?.get(c)?.channel
            ? {
                ordered: (net as any).motionLinks?.get(c).channel.ordered,
                maxRetransmits: (net as any).motionLinks?.get(c).channel
                  .maxRetransmits,
                id: (net as any).motionLinks?.get(c).channel.id,
              }
            : null,
        })),
      };
    },
    stop() {
      clearInterval(timer);
      net.dispose();
      fleet.dispose();
    },
  };
}
window.networkTest = createClient();
