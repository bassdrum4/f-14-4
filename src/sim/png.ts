// Minimal PNG decoder for 8-bit, non-interlaced images (greyscale / RGB / RGBA).
// IDAT inflation uses DecompressionStream, which exists in browsers and Bun, so
// the exact same decode path runs in the app and in dev scripts. No dependencies.

export interface DecodedPng {
  width: number;
  height: number;
  /** RGBA8 pixels, row-major starting at the top-left corner. */
  data: Uint8Array;
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export async function decodePng(bytes: Uint8Array): Promise<DecodedPng> {
  if (bytes.length < 8 || PNG_SIG.some((b, i) => bytes[i] !== b)) {
    throw new Error("not a PNG");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat: Uint8Array[] = [];

  let off = 8;
  while (off + 12 <= bytes.length) {
    const len = view.getUint32(off);
    const type = String.fromCharCode(bytes[off + 4], bytes[off + 5], bytes[off + 6], bytes[off + 7]);
    const start = off + 8;
    if (type === "IHDR") {
      width = view.getUint32(start);
      height = view.getUint32(start + 4);
      bitDepth = bytes[start + 8];
      colorType = bytes[start + 9];
      interlace = bytes[start + 12];
    } else if (type === "IDAT") {
      idat.push(bytes.subarray(start, start + len));
    } else if (type === "IEND") {
      break;
    }
    off = start + len + 4; // skip payload + CRC
  }

  if (width <= 0 || height <= 0) throw new Error("bad PNG header");
  if (bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${bitDepth}`);
  if (interlace !== 0) throw new Error("interlaced PNG not supported");
  const channels =
    colorType === 0 ? 1 : colorType === 2 ? 3 : colorType === 4 ? 2 : colorType === 6 ? 4 : -1;
  if (channels < 0) throw new Error(`unsupported PNG colour type ${colorType}`);

  const raw = await inflate(concat(idat));
  const stride = width * channels;
  if (raw.length < height * (stride + 1)) throw new Error("truncated PNG data");

  const out = new Uint8Array(width * height * 4);
  let prev = new Uint8Array(stride);
  let cur = new Uint8Array(stride);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    cur.set(raw.subarray(rp, rp + stride));
    rp += stride;
    unfilter(filter, cur, prev, channels);
    for (let x = 0; x < width; x++) {
      const si = x * channels;
      const di = (y * width + x) * 4;
      if (channels === 1) {
        const v = cur[si];
        out[di] = v;
        out[di + 1] = v;
        out[di + 2] = v;
        out[di + 3] = 255;
      } else if (channels === 2) {
        const v = cur[si];
        out[di] = v;
        out[di + 1] = v;
        out[di + 2] = v;
        out[di + 3] = cur[si + 1];
      } else if (channels === 3) {
        out[di] = cur[si];
        out[di + 1] = cur[si + 1];
        out[di + 2] = cur[si + 2];
        out[di + 3] = 255;
      } else {
        out[di] = cur[si];
        out[di + 1] = cur[si + 1];
        out[di + 2] = cur[si + 2];
        out[di + 3] = cur[si + 3];
      }
    }
    const swap = prev;
    prev = cur;
    cur = swap;
  }
  return { width, height, data: out };
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate"); // zlib-wrapped deflate (PNG IDAT)
  const writer = ds.writable.getWriter();
  const written = (async () => {
    await writer.write(data);
    await writer.close();
  })();
  const buf = await new Response(ds.readable).arrayBuffer();
  await written;
  return new Uint8Array(buf);
}

function concat(chunks: Uint8Array[]): Uint8Array {
  let len = 0;
  for (const c of chunks) len += c.length;
  const out = new Uint8Array(len);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

function unfilter(type: number, cur: Uint8Array, prev: Uint8Array, bpp: number): void {
  const n = cur.length;
  if (type === 0) return; // None
  if (type === 1) {
    for (let i = bpp; i < n; i++) cur[i] = (cur[i] + cur[i - bpp]) & 255;
    return;
  }
  if (type === 2) {
    for (let i = 0; i < n; i++) cur[i] = (cur[i] + prev[i]) & 255;
    return;
  }
  if (type === 3) {
    for (let i = 0; i < n; i++) {
      const left = i >= bpp ? cur[i - bpp] : 0;
      cur[i] = (cur[i] + ((left + prev[i]) >> 1)) & 255;
    }
    return;
  }
  if (type === 4) {
    for (let i = 0; i < n; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      cur[i] = (cur[i] + paeth(a, b, c)) & 255;
    }
    return;
  }
  throw new Error(`bad PNG filter ${type}`);
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}
