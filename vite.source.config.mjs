import {defineConfig} from "vite";
import {resolve} from "node:path";
export default defineConfig({base:"./",build:{outDir:"dist-source",rollupOptions:{input:resolve(process.cwd(),"source.html")}}});
