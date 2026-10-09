// Publish the actual single-file TypeScript build to the GitHub Pages root.
// This writes index.html only after Vite has finished successfully.
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const output = resolve("dist/index.html");
const target = resolve("index.html");
const html = await readFile(output, "utf8");
if (!html.includes('<div id="root"></div>')) throw new Error("Expected application root missing from build.");
if (!html.includes('type="module"')) throw new Error("Expected inlined JavaScript missing from build.");
if (/<script\s[^>]*src="\/assets\//.test(html) || /<link\s[^>]*href="\/assets\//.test(html)) {
  throw new Error("The build is not self-contained; refusing to publish.");
}
await writeFile(target, html, "utf8");
console.log("Published dist/index.html to root index.html (single-file, TypeScript-built).");
