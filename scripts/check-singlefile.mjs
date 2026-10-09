// Check the deployable HTML is self-contained without running Vite.
import { readFile } from "node:fs/promises";
const html=await readFile("index.html","utf8");
if(!/<script type="module" crossorigin>[\s\S]*?<\/script>/.test(html) ||
   !/<style rel="stylesheet" crossorigin>[\s\S]*?<\/style>/.test(html) ||
   !html.includes('<div id="root"></div>')){
  throw new Error("Root index.html is not a complete standalone build.");
}
console.log("PASS: root index.html contains self-contained JS/CSS and app root.");
