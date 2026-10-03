// International Standard Atmosphere (troposphere + lower stratosphere).

export interface Atmos {
  rho: number; // kg/m^3
  temp: number; // K
  soundSpeed: number; // m/s
  sigma: number; // density ratio vs sea level
}

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
  const rho = pressure / (287.0531 * temp);
  const soundSpeed = 20.0468 * Math.sqrt(temp);
  return { rho, temp, soundSpeed, sigma: rho / 1.225 };
}
