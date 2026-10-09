// Check the deployable HTML is self-contained without running Vite.
import { readFile } from "node:fs/promises";
const {version}=JSON.parse(await readFile("package.json","utf8"));
const [html,isolate]=await Promise.all([readFile("index.html","utf8"),readFile("isolate/index.html","utf8")]);
for(const [path,content] of [["index.html",html],["isolate/index.html",isolate]]){
  if(!/<script type="module" crossorigin>[\s\S]*?<\/script>/.test(content) ||
     !/<style rel="stylesheet" crossorigin>[\s\S]*?<\/style>/.test(content) ||
     !content.includes('<div id="root"></div>')){
    throw new Error(`${path} is not a complete standalone build.`);
  }
  const stamped=content.match(/<meta\s+name="application-version"\s+content="([^"]+)"\s*\/?\s*>/)?.[1];
  if(stamped!==version) throw new Error(`${path} carries ${stamped ?? "no version"}; expected ${version}. Run npm run build.`);
}
if(html!==isolate) throw new Error("Root and isolate HTML builds differ. Run npm run build.");
console.log(`PASS: both standalone builds match package version ${version} and contain self-contained JS/CSS.`);
