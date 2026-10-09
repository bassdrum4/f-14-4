// Recreate the single-file deployment from recovered current simulator sources.
import {readFile,writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFile(resolve(root,p),"utf8");
const [template,js,css]=await Promise.all([read("src/restored/standalone.template.html"),read("src/restored/runtime.js"),read("src/restored/runtime.css")]);
const JT="/*__INLINE_SIMULATOR_JS__*/",CT="/*__INLINE_SIMULATOR_CSS__*/";
if(template.split(JT).length!==2||template.split(CT).length!==2)throw Error("Invalid standalone template");
const html=template.replace(JT,()=>js).replace(CT,()=>css);
if(process.argv.includes("--check")){
  if(await read("index.html")!==html){console.error("Standalone index.html is out of sync. Run npm run build:standalone.");process.exitCode=1;}
  else console.log("PASS: standalone HTML matches recovered source byte-for-byte.");
}else{await writeFile(resolve(root,"index.html"),html,"utf8");console.log("Updated standalone index.html");}
