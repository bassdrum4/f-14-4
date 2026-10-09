// Selectable aircraft. Every flyable type is a bag of numbers the flight model
// reads each step (mass, wing, inertia, thrust, ordnance). Keeping them in one
// table lets the sim stay deterministic while each jet gets its own handling:
// the Tomcat is a heavy fleet interceptor, the Hornet is a light agile
// multirole, and the Intruder is a slow, armoured bomb truck.
//
// The numbers are sim-tuned approximations of the real aircraft, not
// validated aerodynamic data.

export type AircraftId = "tomcat" | "hornet" | "intruder";

export interface AircraftSpec {
  id: AircraftId;
  name: string; // short cockpit label, e.g. "F-14A TOMCAT"
  role: string; // one-word role for the menu
  blurb: string; // menu description

  // --- mass + aero ---
  mass: number; // kg, combat loaded
  sWing: number; // m^2 reference wing area
  span: number; // m
  chord: number; // m mean aero chord
  iPitch: number; // kg m^2 about body X
  iYaw: number; // kg m^2 about body Y
  iRoll: number; // kg m^2 about body Z
  clAlpha: number; // lift-curve slope, per rad
  alphaStall: number; // rad
  cd0: number; // zero-lift drag
  kInduced: number; // induced-drag factor
  cmElev: number; // pitch control power
  cmQ: number; // pitch damping
  clAil: number; // roll control power
  clP: number; // roll damping
  cnRud: number; // rudder power
  flapLift: number; // extra CL from full flaps
  sweepMin: number; // wing sweep, degrees (spread)
  sweepMax: number; // wing sweep, degrees (full back) — equal to min = fixed wing

  // --- engines ---
  idleThrust: number; // N
  thrustDry: number; // N, total military
  abThrust: number; // N, total added by afterburner (0 = no burner)

  // --- combat ---
  bombs: number; // bombs on the racks
  /** Radar missiles on the rails (0 = this type carries none). */
  missiles: number;
  gunRps: number; // rounds per second
  gunDamage: number; // damage per gun hit on an aircraft
  hull: number; // structural hit points
}

export const AIRCRAFT: Record<AircraftId, AircraftSpec> = {
  tomcat: {
    id: "tomcat",
    name: "F-14A TOMCAT",
    role: "Interceptor",
    blurb: "Fast, long-legged, twin-tail fleet defender. Balanced guns and a six-bomb load.",
    mass: 30_000,
    sWing: 54.6,
    span: 19.5,
    chord: 4.88,
    iPitch: 3.0e5,
    iYaw: 5.0e5,
    iRoll: 6.0e4,
    clAlpha: 5.0,
    alphaStall: 0.26,
    cd0: 0.026,
    kInduced: 0.05,
    cmElev: 0.19,
    cmQ: 14,
    clAil: 0.055,
    clP: 0.5,
    cnRud: 0.03,
    flapLift: 0.8,
    sweepMin: 20,
    sweepMax: 68,
    idleThrust: 3_500,
    thrustDry: 150_000,
    abThrust: 110_000,
    bombs: 6,
    missiles: 2,
    gunRps: 10,
    gunDamage: 12,
    hull: 100,
  },
  hornet: {
    id: "hornet",
    name: "F/A-18C HORNET",
    role: "Multirole",
    blurb: "Light and quick to roll, with a fast-firing gun. Four bombs and a lighter hull.",
    mass: 17_000,
    sWing: 38,
    span: 12.3,
    chord: 4.0,
    iPitch: 1.6e5,
    iYaw: 2.8e5,
    iRoll: 3.5e4,
    clAlpha: 4.6,
    alphaStall: 0.3,
    cd0: 0.029,
    kInduced: 0.062,
    cmElev: 0.22,
    cmQ: 16,
    clAil: 0.072,
    clP: 0.55,
    cnRud: 0.035,
    flapLift: 0.7,
    sweepMin: 0,
    sweepMax: 0,
    idleThrust: 3_000,
    thrustDry: 112_000,
    abThrust: 78_000,
    bombs: 4,
    missiles: 2,
    gunRps: 14,
    gunDamage: 10,
    hull: 85,
  },
  intruder: {
    id: "intruder",
    name: "A-6E INTRUDER",
    role: "Bomber",
    blurb: "Slow, heavy, and armoured — with sixteen bombs and a hard-hitting pair of guns.",
    mass: 26_000,
    sWing: 49,
    span: 16.2,
    chord: 5.2,
    iPitch: 4.0e5,
    iYaw: 6.0e5,
    iRoll: 1.1e5,
    clAlpha: 4.8,
    alphaStall: 0.24,
    cd0: 0.034,
    kInduced: 0.06,
    cmElev: 0.15,
    cmQ: 12,
    clAil: 0.03,
    clP: 0.45,
    cnRud: 0.028,
    flapLift: 1.0,
    sweepMin: 0,
    sweepMax: 0,
    idleThrust: 2_500,
    thrustDry: 93_000,
    abThrust: 0,
    bombs: 16,
    missiles: 0, // a clean A-6: all bombs, no rails
    gunRps: 6,
    gunDamage: 8,
    hull: 130,
  },
};

/** Menu order: the F-14 first, then the alternatives. */
export const AIRCRAFT_LIST: AircraftSpec[] = [
  AIRCRAFT.tomcat,
  AIRCRAFT.hornet,
  AIRCRAFT.intruder,
];

export const DEFAULT_AIRCRAFT: AircraftId = "tomcat";

/** Safe lookup: any unknown id falls back to the Tomcat. */
export function specFor(id: AircraftId): AircraftSpec {
  return AIRCRAFT[id] ?? AIRCRAFT.tomcat;
}

/** Highest bomb count across the fleet, used to size mesh pools. */
export const MAX_BOMBS = AIRCRAFT_LIST.reduce((m, a) => Math.max(m, a.bombs), 0);
/** Highest missile count across the fleet, used to size mesh pools. */
export const MAX_MISSILES = AIRCRAFT_LIST.reduce((m, a) => Math.max(m, a.missiles), 0);
