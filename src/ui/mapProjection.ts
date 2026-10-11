/** Map coordinates in the pilot's heading frame: right and down on screen. */
export function headingUpPoint(dx: number, dz: number, headingDeg: number): { x: number; y: number } {
  const h = headingDeg * Math.PI / 180, cos = Math.cos(h), sin = Math.sin(h);
  return { x: dx * cos + dz * sin, y: -dx * sin + dz * cos };
}
