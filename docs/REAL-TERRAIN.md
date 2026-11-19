# Real terrain (beta free flight)

A solo free-flight option that flies **real** terrain over Hawaii instead of the
seeded island chain: a 60 km home box baked into the build, and real ground
streamed in beyond it, so there is no wall to fly into. It is a start option on the FLY SOLO screen (`NEW · IN
BETA`) and changes nothing else: the fleet, the airfield, the runway plateau, the
anchorage depths and every mission are exactly as they were.

## What is actually real

| | |
|---|---|
| Place | Niihau and Lehua, Hawaii — 21.9100 N, 160.0900 W |
| Box | 60 km × 60 km, the same `EXTENT` the procedural world uses |
| Grid | 512 × 512 samples, 117.2 m per sample, int16 metres |
| Imagery | Sentinel-2 cloudless, 10 m native, baked at z13 (~17 m/px) |
| Cutting | unknown (2026-11) elevation, from open DEM tiles |

The fixed airfield plateau sits on ground that is **139 m** in the real data
against its 140 m design height, so flattening it is invisible. The carrier
anchorage falls in open water 513–2,594 m deep, so the anchorage carve is a no-op
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

## Imagery

The ground is a real photo: **Sentinel-2 cloudless**, published by EOX IT
Services under CC BY 4.0, fetched keyless from the EOX WMTS endpoint. Tiles are
stored as raw JPEG bytes (no image decoder in the build) and stitched onto a
single canvas texture at runtime, so the published file stays self-contained.

Only tiles containing land are kept — 23 of them for this box. Water-only tiles
are dropped because the sim draws its own sea over the terrain, and shipping
thousands of empty ocean JPEGs would be dead weight. The terrain material uses
the photo as its colour and keeps the vertex colours only for slope shading, so
the procedural biome palette is not applied to this world at all.

`--no-imagery` bakes heights only.

## Where you start

The beta card on the FLY SOLO screen carries a **START WHERE** picker: Niihau
(the fleet, the runway, the missions) plus Kauai, the Grand Canyon, Everest, the
Matterhorn, Mount Fuji and Rio de Janeiro. Everything except home starts the
sortie **in the air** at that region's altitude and heading, already at cruise —
there is no deck or runway out there to launch from.

Choosing a region re-anchors the world frame on it, so the aircraft starts at the
origin rather than tens of thousands of kilometres out, where float32 metres only
resolve to a few metres and the view would shimmer. The frame is anchored per
sortie, not floated: fly a few thousand kilometres from the anchor and the same
limit returns. While the frame is away from home, the baked terrain, the airfield
and the fleet are not drawn at all — they belong to Niihau, and the minimap drops
their markers with them.

## Beyond the box: streaming

The home box is baked because the flight model asks for heights synchronously,
thousands of times a second. Outside it the same data now arrives at runtime.

| | |
|---|---|
| Heights | Esri `WorldElevation3D/Terrain3D`, z12 LERC tiles, float32 metres, ~42 KB each |
| Photo | EOX Sentinel-2 z12 tiles — the same imagery the box was baked from |
| Ring | every tile within 4 tiles (~36 km) of the aircraft |
| Mesh | one chunk per tile, 32 × 32 quads (~285 m cells) |

- **Why Esri for heights.** It is free and keyless, and the only free elevation
  service found that sends CORS headers. The Mapzen terrarium bucket used for
  the bake does not, so a page cannot read its pixels — fine at build time,
  useless at runtime.
- **Decoder.** Tiles are LERC-compressed, decoded in the page by Esri's
  Apache-2.0 `lerc` package. Its 118 KB wasm is inlined by the bundler, so the
  published build is still one self-contained HTML file.
- **Why 36 km.** That is roughly where the scene fog closes, so drawing further
  would cost fetches for ground nobody can see.
- **The flight model.** `terrainHeight` uses the baked box inside ±30 km and the
  streamed cache outside. Ground that has not arrived yet reads as open water
  (−25 m) rather than a guess, so a late tile can never conjure a mountain in
  front of the aircraft.
- **The sea.** The ocean plane follows the aircraft, so open water is endless
  without any coordinate growing.

Two things keep the 30 km boundary from showing:

- **Chunks never cover the box.** A cell whose centre lies inside the baked box
  is left out of the streamed geometry, so the two meshes meet at the edge
  instead of fighting over the same ground. The single cell that straddles the
  edge is sunk 1.2 m so the baked mesh wins that sliver.
- **No ground under the sea.** The elevation service carries no bathymetry:
  open ocean comes back as exactly 0 m. Drawn as terrain that is a flat sheet
  coplanar with the sim's sea, which z-fights with it and shows the photo's
  water colour under a hard chunk edge. Any cell whose corners are all at or
  below the waterline is dropped, so the ring only ever draws land and the sea
  is always the sim's own.

Expect a faint tone step at the boundary: the box is photographed at z13 and
the streamed ground at z12, and the two DEM sources disagree by a few metres.

Robustness: tiles are fetched six at a time with a 15 s timeout, retried with
1/2/4 s backoff up to four attempts, kept in a 640-tile least-recently-used
cache, and asked for along the aircraft's track ~20 s ahead of where it is
going. Requests still in flight are aborted when the sim is torn down.

## Attribution (required)

The Tilezen dataset is a composite, and its providers must be credited. Terrain
in this box is drawn from SRTM, GMTED2010 and USGS 3DEP:

> United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data
> courtesy of the U.S. Geological Survey.
>
> Terrain Tiles was accessed on 2026-11 from registry.opendata.aws/terrain-tiles.

The full provider list is at
[tilezen/joerd attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).

Satellite imagery: **Sentinel-2 cloudless** by
[EOX IT Services GmbH](https://s2maps.eu), licensed
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Contains modified
Copernicus Sentinel data 2020.

Streamed elevation outside the box: Esri
[WorldElevation3D/Terrain3D](https://server.arcgisonline.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer)
from the ArcGIS Online world elevation services, used under their terms of use.

## Limits

- Free flight only. Dogfight, strike and campaign depend on the seeded islands.
- Multiplayer rooms are seeded worlds, so opening or joining a room returns to
  the procedural chain by design.
- No floating origin yet. Positions are absolute float32 metres: comfortable for
  a few thousand kilometres, coarse beyond that. A true round-the-world flight
  needs the floating origin, which is the next step.
- The world → lat/lon mapping is a local equirectangular projection around
  Niihau. It is right over Hawaii and stretches with distance, so ground far
  from the box is positioned approximately even though its heights are real.
- Expect pop-in at the streaming frontier: a new tile appears when its fetch
  lands, and on a bad connection that can be a visible wall of ground filling in.
- The home box still defines where the fleet lives. A different region means
  re-baking with `--lat`/`--lon` and checking the probe report: the airfield and
  the eight anchorages are fixed, and that is what constrains where the box can
  go. Streaming does not lift that constraint — it only means you can leave.
