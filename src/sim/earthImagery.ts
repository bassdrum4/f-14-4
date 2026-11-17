// The baked satellite photo for the real-Earth heightfield.
//
// The bake ships the land tiles as raw JPEG bytes, so there is no image decoder
// in the build step: the browser stitches them onto one canvas and that canvas
// becomes the terrain's map. Water-only tiles are omitted — the sim draws its
// own sea on top, and a uniform ocean photo underneath would only cost bytes.
//
// Loading is asynchronous (an <img> decode is), so the texture appears a frame
// or two after the world is first built. `preloadEarthImagery()` is fired when
// the beta is selected and when a sortie starts, and the caller re-applies the
// world when it resolves.

import * as THREE from "three";
import { EARTH_IMAGERY } from "./terrain/niihau";

let texture: THREE.Texture | null = null;
let pending: Promise<THREE.Texture | null> | null = null;

/** The stitched photo, or null until it has finished decoding. */
export function earthImageryTexture(): THREE.Texture | null {
  return texture;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("earth imagery tile failed"));
    img.src = src;
  });
}

/**
 * Decode the tiles and build the terrain texture. Idempotent: the work happens
 * once and every later call returns the same texture.
 *
 * `maxPixels` is a ceiling on the longer side, because a GPU that cannot upload
 * the full mosaic would otherwise fail the whole beta; below the ceiling the
 * photo is drawn to scale instead.
 */
export function preloadEarthImagery(maxPixels = 4096): Promise<THREE.Texture | null> {
  if (texture) return Promise.resolve(texture);
  if (pending) return pending;
  if (!EARTH_IMAGERY || typeof document === "undefined") return Promise.resolve(null);

  pending = (async () => {
    const { widthPx, heightPx, tiles } = EARTH_IMAGERY;
    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Deep-water tone for everything the land tiles do not cover. Mostly hidden
    // by the ocean surface, but it is what shows through at the coast.
    ctx.fillStyle = "#0b2534";
    ctx.fillRect(0, 0, widthPx, heightPx);

    const decoded = await Promise.all(
      tiles.map(async (t) => ({
        t,
        img: await loadImage(`data:image/jpeg;base64,${t.jpg}`).catch(() => null),
      })),
    );
    for (const { t, img } of decoded) {
      if (img) ctx.drawImage(img, t.x, t.y);
    }

    let source: HTMLCanvasElement = canvas;
    const longest = Math.max(widthPx, heightPx);
    if (longest > maxPixels) {
      const scale = maxPixels / longest;
      const small = document.createElement("canvas");
      small.width = Math.max(1, Math.round(widthPx * scale));
      small.height = Math.max(1, Math.round(heightPx * scale));
      const sctx = small.getContext("2d");
      if (sctx) {
        sctx.drawImage(canvas, 0, 0, small.width, small.height);
        source = small;
      }
    }

    const tex = new THREE.CanvasTexture(source);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    texture = tex;
    return tex;
  })();

  return pending;
}
