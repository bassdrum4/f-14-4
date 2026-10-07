// International Standard Atmosphere (troposphere + lower stratosphere).

export interface Atmos {
  rho: number; // kg/m^3
  temp: number; // K
  soundSpeed: number; // m/s
  sigma: number; // density ratio vs sea level
}

/**
 * Shared result, mutated on every call. This runs inside the 120 Hz sim step
 * and inside the gun cue's 240-step integration every frame, so it must not
 * allocate: every caller reads the fields immediately and never keeps the
 * object across another call.
 */
const OUT: Atmos = { rho: 1.225, temp: 288.15, soundSpeed: 340.3, sigma: 1 };

export function atmosphere(altM: number): Atmos {
  const h = Math.max(-500, Math.min(20000, altM));
  let temp: number;
  let pressure: number;
  if (h < 11000) {
    temp = 288.15 - 0.0065 * h;
    pressure = 101325 * Math.pow(temp / 288.15, 5.2559);
  } else {
    temp = 216.65;
    pressure = 22632.06 * Math.exp(-0.00015769 * (h - 11000));
  }
  OUT.temp = temp;
  OUT.rho = pressure / (287.0531 * temp);
  OUT.soundSpeed = 20.0468 * Math.sqrt(temp);
  OUT.sigma = OUT.rho / 1.225;
  return OUT;
}
