// Selectable aircraft. Every flyable type is a bag of numbers the flight model
// reads each step (mass, wing, inertia, thrust, ordnance). Keeping them in one
// table lets the sim stay deterministic while each type gets its own handling:
// the Tomcat is a heavy fleet interceptor, the Hornet a light agile multirole,
// the Crusader a supersonic gunfighter, the Intruder a slow armoured bomb truck
// and the Seahawk a rotary-wing ASW machine.
//
// The numbers are sim-tuned approximations of the real aircraft, not
// validated aerodynamic data. The rotary-wing type is the exception to the
// fixed-wing rules: its "thrust" is the rotor disc's total thrust in newtons
// and its "wing area" is the rotor disc area (see flight.ts stepRotorcraft).
//
// Sources for the real figures on the two new types (approximate, published
// figures vary by source):
//   F-8E Crusader  — 4x20mm Colt Mk 12 (125 rpg), J57-P-20A (47.6 kN dry /
//                    80.1 kN AB), 34.8 m^2 wing, ~13,150 kg combat weight,
//                    four AIM-9 rails and eight 500 lb bombs on the wings.
//   SH-60B Seahawk — 2x T700-GE-401C (1,890 shp each), 16.36 m rotor,
//                    ~9,927 kg max takeoff, ~258 rpm four-blade main rotor,
//                    two Hellfire/torpedo stations and a door gun.

export type AircraftId = "tomcat" | "hornet" | "crusader" | "intruder" | "seahawk";

export interface AircraftSpec {
  id: AircraftId;
  name: string; // short cockpit label, e.g. "F-14A TOMCAT"
  role: string; // one-word role for the menu
  blurb: string; // menu description
  /** Rotary wing: the flight model flies it with the rotor model, not a wing. */
  rotorcraft?: boolean;

  // --- mass + aero ---
  mass: number; // kg, combat loaded
  sWing: number; // m^2 reference wing area (rotor disc area for the Seahawk)
  span: number; // m (rotor diameter for the Seahawk)
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
  thrustDry: number; // N, total military (rotor max thrust for the Seahawk)
  abThrust: number; // N, total added by afterburner (0 = no burner)

  // --- combat ---
  bombs: number; // bombs on the racks
  /** Radar missiles on the rails (0 = this type carries none). */
  missiles: number;
  /** Countermeasure cartridges (flares); 0 = this type carries none. */
  flares: number;
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
    flares: 30,
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
    flares: 30,
    gunRps: 14,
    gunDamage: 10,
    hull: 85,
  },
  crusader: {
    id: "crusader",
    name: "F-8E CRUSADER",
    role: "Gunfighter",
    blurb: "The last gunfighter: supersonic, four 20 mm cannon and a four-Sidewinder rack.",
    // A light-ish delta-winged (42° swept) jet with a small wing, a big engine
    // and the F-8's famous nose-high landing attitude. Fast in a straight line,
    // stubborn in a turn, and the heaviest gun of the fleet.
    mass: 13_100,
    sWing: 34.8,
    span: 10.87,
    chord: 3.2,
    iPitch: 1.3e5,
    iYaw: 2.2e5,
    iRoll: 3.2e4,
    clAlpha: 4.4,
    alphaStall: 0.29,
    cd0: 0.028,
    kInduced: 0.07,
    cmElev: 0.2,
    cmQ: 15,
    clAil: 0.066,
    clP: 0.52,
    cnRud: 0.032,
    flapLift: 0.9, // the variable-incidence wing drops the nose for the boat
    sweepMin: 0,
    sweepMax: 0,
    idleThrust: 2_800,
    thrustDry: 47_600,
    abThrust: 32_500,
    bombs: 8,
    missiles: 4,
    flares: 16,
    gunRps: 16,
    gunDamage: 12,
    hull: 88,
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
    flares: 30,
    gunRps: 6,
    gunDamage: 8,
    hull: 130,
  },
  seahawk: {
    id: "seahawk",
    name: "SH-60B SEAHAWK",
    role: "Helicopter",
    blurb: "Rotary wing: collective for height, cyclic to tilt and go. Hovers, and no cat needed.",
    rotorcraft: true,
    // Rotor disc: 210 m^2 over a 16.36 m diameter, ~9.6 t on the skids. The
    // "thrust" figures are the rotor's total thrust: enough margin over weight
    // for a 1,000+ fpm climb at full collective and a gentle hover at ~55%.
    mass: 9_600,
    sWing: 210,
    span: 16.36,
    chord: 3.0,
    iPitch: 9.0e4,
    iYaw: 1.3e5,
    iRoll: 7.0e4,
    clAlpha: 4.2,
    alphaStall: 0.3,
    cd0: 0.04,
    kInduced: 0.08,
    cmElev: 0.2,
    cmQ: 14,
    clAil: 0.06,
    clP: 0.5,
    cnRud: 0.05,
    flapLift: 0.5,
    sweepMin: 0,
    sweepMax: 0,
    idleThrust: 20_000,
    thrustDry: 152_000,
    abThrust: 0,
    bombs: 0,
    missiles: 2, // two Hellfire / torpedo stations
    flares: 30,
    gunRps: 8, // door gun
    gunDamage: 6,
    hull: 95,
  },
};

/** Menu order: the F-14 first, then the alternatives. */
export const AIRCRAFT_LIST: AircraftSpec[] = [
  AIRCRAFT.tomcat,
  AIRCRAFT.hornet,
  AIRCRAFT.crusader,
  AIRCRAFT.intruder,
  AIRCRAFT.seahawk,
];

export const DEFAULT_AIRCRAFT: AircraftId = "tomcat";

/** Safe lookup: any unknown id falls back to the Tomcat. */
export function specFor(id: AircraftId): AircraftSpec {
  return AIRCRAFT[id] ?? AIRCRAFT.tomcat;
}

/** True when `id` names a flyable airframe. Used to sanitise stored profiles. */
export function isAircraftId(id: unknown): id is AircraftId {
  return typeof id === "string" && Object.prototype.hasOwnProperty.call(AIRCRAFT, id);
}

/** Highest bomb count across the fleet, used to size mesh pools. */
export const MAX_BOMBS = AIRCRAFT_LIST.reduce((m, a) => Math.max(m, a.bombs), 0);
/** Highest missile count across the fleet, used to size mesh pools. */
export const MAX_MISSILES = AIRCRAFT_LIST.reduce((m, a) => Math.max(m, a.missiles), 0);
