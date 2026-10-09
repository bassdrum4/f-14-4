// Fast, dependency-free check that GitHub Pages is served from an inline build.
import { readFile } from "node:fs/promises";
const html=await readFile("index.html","utf8");
if (!html.includes('<script type="module" crossorigin>') || !html.includes('rel="stylesheet" crossorigin')) {
  console.error("Root index.html is not the expected self-contained deployable page.");
  process.exit(1);
}
if (html.includes('src="/src/main.tsx"')) {
  console.error("Root index.html contains a development entry instead of a standalone bundle.");
  process.exit(1);
}
console.log("PASS: root HTML remains standalone.");
