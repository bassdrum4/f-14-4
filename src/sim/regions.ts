// Where a real-terrain free flight can begin.
//
// The fleet, the airfield and every mission are pinned to Niihau, so starting
// anywhere else means starting in the air over that place — there is no deck to
// launch from out there. Each preset carries the altitude and heading its first
// frame is flown at, chosen to clear the ground under it.

import { latLonToWorld } from "./terrainStream";

export interface Region {
  id: string;
  label: string;
  /** One-line note shown under the picker. */
  sub: string;
  lat: number;
  lon: number;
  /** Start altitude, MSL metres — always clear of the ground below. */
  altitudeM: number;
  headingDeg: number;
}

/** The baked home box: the only place with a carrier, a runway and missions. */
export const HOME_REGION = "niihau";

/** Speed the aircraft is trimmed to when it is placed in the air. */
export const REGION_CRUISE_KT = 320;

export const REGIONS: Region[] = [
  {
    id: HOME_REGION,
    label: "Niihau, Hawaii",
    sub: "The fleet",
    lat: 21.91,
    lon: -160.09,
    altitudeM: 0,
    headingDeg: 90,
  },
  {
    id: "kauai",
    label: "Kauai, Hawaii",
    sub: "60 km east",
    lat: 22.05,
    lon: -159.5,
    altitudeM: 2600,
    headingDeg: 270,
  },
  {
    id: "grand-canyon",
    label: "Grand Canyon, Arizona",
    sub: "the Colorado",
    lat: 36.1,
    lon: -112.1,
    altitudeM: 3400,
    headingDeg: 300,
  },
  {
    id: "everest",
    label: "Everest, Nepal",
    sub: "the Himalaya",
    lat: 27.99,
    lon: 86.93,
    altitudeM: 8800,
    headingDeg: 300,
  },
  {
    id: "matterhorn",
    label: "Matterhorn, Alps",
    sub: "the Pennine Alps",
    lat: 45.98,
    lon: 7.66,
    altitudeM: 4900,
    headingDeg: 200,
  },
  {
    id: "fuji",
    label: "Mount Fuji, Japan",
    sub: "Honshu",
    lat: 35.36,
    lon: 138.73,
    altitudeM: 4300,
    headingDeg: 200,
  },
  {
    id: "rio",
    label: "Rio de Janeiro",
    sub: "Guanabara Bay",
    lat: -22.95,
    lon: -43.2,
    altitudeM: 1900,
    headingDeg: 250,
  },
];

/** The named region, or the home box when the id is missing or unknown. */
export function regionById(id: string | undefined): Region {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}

/** A region's start position in world metres. */
export function regionStart(region: Region): { x: number; z: number } {
  return latLonToWorld(region.lat, region.lon);
}
