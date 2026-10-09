// Host-owned hull, scores and lives. Weapon flight is local for responsive aim;
// hits carry both life numbers so delayed packets cannot damage a respawn.
export type BattleWeapon = 'gun' | 'missile';
export interface WeaponLaunch { weapon: BattleWeapon; pos: [number,number,number]; vel: [number,number,number] }
export interface BattleShot extends WeaponLaunch { match: number; life: number; seq: number }
export interface BattleAction {
  kind: 'hit' | 'ready' | 'death'; match: number; seq: number;
  life: number; victim?: string; victimLife?: number; weapon?: BattleWeapon;
}
export interface BattlePilot {
  id: string; name: string; hp: number; kills: number; deaths: number;
  life: number; shield: boolean; respawnIn: number; ready: boolean;
}
export interface BattleSnapshot { match: number; pilots: BattlePilot[] }
interface Entry extends BattlePilot { shieldUntil: number; respawnAt: number }
export class BattleReferee {
  private pilots = new Map<string, Entry>();
  private seen = new Set<string>();
  private lastHit = new Map<string, number>();
  match = 0;
  reset(match: number): void { this.match = match; this.pilots.clear(); this.seen.clear(); this.lastHit.clear(); }
  restore(snapshot: BattleSnapshot, now: number): void {
    this.reset(snapshot.match);
    for (const p of snapshot.pilots) this.pilots.set(p.id, { ...p, shieldUntil: p.shield ? now + 5 : 0, respawnAt: p.hp === 0 && p.ready ? now + p.respawnIn : 0 });
  }
  reconcile(roster: Array<{ id: string; name: string }>): void {
    const ids = new Set(roster.map(p => p.id));
    for (const id of this.pilots.keys()) if (!ids.has(id)) this.pilots.delete(id);
    for (const p of roster) {
      const old = this.pilots.get(p.id);
      if (old) old.name = p.name;
      else this.pilots.set(p.id, { ...p, hp: 0, kills: 0, deaths: 0, life: 0, shield: false, respawnIn: 0, ready: false, shieldUntil: 0, respawnAt: 0 });
    }
  }
  action(attacker: string, action: BattleAction, now: number, range: number, gunDamage = 7): boolean {
    if (action.match !== this.match || !Number.isInteger(action.seq) || action.seq < 0) return false;
    const p = this.pilots.get(attacker);
    if (!p) return false;
    const key = `${attacker}/${action.seq}`;
    if (this.seen.has(key)) return false;
    this.seen.add(key);
    if (this.seen.size > 4096) this.seen.delete(this.seen.values().next().value!);
    if (action.kind === 'ready') {
      if (p.ready) return false;
      p.ready = true; this.spawn(p, now); return true;
    }
    if (!p.ready || p.hp <= 0 || action.life !== p.life) return false;
    if (action.kind === 'death') { this.down(p, now); return true; }
    if (action.kind !== 'hit' || (action.weapon !== 'gun' && action.weapon !== 'missile')) return false;
    const v = this.pilots.get(action.victim ?? '');
    if (!v || v === p || !v.ready || v.hp <= 0 || action.victimLife !== v.life) return false;
    if (now < p.shieldUntil || now < v.shieldUntil || !Number.isFinite(range) || range > (action.weapon === 'gun' ? 2200 : 12000)) return false;
    const rateKey = `${attacker}/${action.weapon}`;
    const last = this.lastHit.get(rateKey) ?? -Infinity;
    if (now - last < (action.weapon === 'gun' ? .018 : .45)) return false;
    this.lastHit.set(rateKey, now);
    v.hp = Math.max(0, v.hp - (action.weapon === 'missile' ? 90 : Math.min(10, Math.max(1, gunDamage))));
    if (v.hp === 0) { p.kills++; this.down(v, now); }
    return true;
  }
  private down(p: Entry, now: number): void { p.hp = 0; p.deaths++; p.respawnAt = now + 3; }
  private spawn(p: Entry, now: number): void { p.life++; p.hp = 100; p.shieldUntil = now + 5; p.respawnAt = 0; }
  snapshot(now: number): BattleSnapshot {
    for (const p of this.pilots.values()) if (p.ready && p.hp === 0 && p.respawnAt > 0 && now >= p.respawnAt) this.spawn(p, now);
    return { match: this.match, pilots: [...this.pilots.values()].map(p => ({ id: p.id, name: p.name, hp: p.hp, kills: p.kills, deaths: p.deaths, life: p.life, ready: p.ready, shield: p.hp > 0 && now < p.shieldUntil, respawnIn: p.respawnAt ? Math.max(0, p.respawnAt - now) : 0 })) };
  }
}
