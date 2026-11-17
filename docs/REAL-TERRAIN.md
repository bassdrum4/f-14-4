# Real terrain (beta free flight)

A solo free-flight option that flies a **real** 60 km square of Hawaii instead of
the seeded island chain. It is a start option on the FLY SOLO screen (`NEW · IN
BETA`) and changes nothing else: the fleet, the airfield, the runway plateau, the
anchorage depths and every mission are exactly as they were.

## What is actually real

| | |
|---|---|
| Place | Niihau and Lehua, Hawaii — 21.9100 N, 160.0900 W |
| Box | 60 km × 60 km, the same `EXTENT` the procedural world uses |
| Grid | 512 × 512 samples, 117.2 m per sample, int16 metres |
| Cutting | unknown (2026-11) elevation, from open DEM tiles |

The fixed airfield plateau sits on ground that is **139 m** in the real data
against its 140 m design height, so flattening it is invisible. All eight carrier
anchorages fall in open water 513–2,594 m deep, so the anchorage carve is a no-op
too. That is why this box was chosen: the world layout is untouched.

The sun model already used `HOME_SITE` at 21.92 N, 159.47 W, so daylight in the
real box is consistent with the rest of the sim.

## Where the heights come from

[Mapzen / Tilezen terrain tiles](https://registry.opendata.aws/terrain-tiles), an
AWS Open Data dataset: `s3://elevation-tiles-prod`, us-east-1, **no account and
no API key**. Tiles are 256 px PNGs in Web Mercator, zoom 12 here, with elevation
encoded as `(R * 256 + G + B / 256) - 32768` metres.

`scripts/bake-terrain.ts` downloads the tiles, decodes them with no third-party
dependencies, resamples the box onto the grid and writes
`src/sim/terrain/niihau.ts` as base64 — inlined because the published build is a
single self-contained HTML file.

Re-bake (tiles are cached in `.cache/terrain-tiles`, so this works offline after
the first run):

```sh
bun scripts/bake-terrain.ts              # the shipped box
bun scripts/bake-terrain.ts --probe --lat 21.91 --lon -160.09
```

The script refuses to write output if any carrier anchorage lands on dry ground,
and prints the airfield ground height and the box's land fraction so a new site
can be checked before it is committed.

## Attribution (required)

The Tilezen dataset is a composite, and its providers must be credited. Terrain
in this box is drawn from SRTM, GMTED2010 and USGS 3DEP:

> United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data
> courtesy of the U.S. Geological Survey.
>
> Terrain Tiles was accessed on 2026-11 from registry.opendata.aws/terrain-tiles.

The full provider list is at
[tilezen/joerd attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).

## Limits

- Free flight only. Dogfight, strike and campaign depend on the seeded islands.
- Multiplayer rooms are seeded worlds, so opening or joining a room returns to
  the procedural chain by design.
- One box. A different region means re-baking with `--lat`/`--lon` and checking
  the probe report; the airfield and the eight anchorages are fixed, and that is
  what constrains where a real site can go.
