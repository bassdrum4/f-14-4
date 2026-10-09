import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const projectPath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  // Keep the editable entry separate from the published, standalone HTML.
  root: projectPath("./app"),
  plugins: [
    react(),
    {
      name: "editable-dev-entry",
      apply: "serve",
      transformIndexHtml: {
        order: "pre",
        handler(html) {
          return html.replace('../src/main.tsx', `/@fs${projectPath("./src/main.tsx")}`);
        },
      },
    },
    viteSingleFile(),
    {
      name: "publish-single-file",
      apply: "build",
      closeBundle() {
        mkdirSync(projectPath("./isolate"), { recursive: true });
        for (const path of ["./index.html", "./isolate/index.html"]) {
          copyFileSync(projectPath("./dist/index.html"), projectPath(path));
        }
        // Keep the recovered runtime and its existing export commands current.
        const html = readFileSync(projectPath("./dist/index.html"), "utf8");
        const js = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
        const css = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1];
        if (js === undefined || css === undefined) throw new Error("Missing inline assets");
        const template = html.replace(js, () => "/*__INLINE_SIMULATOR_JS__*/")
          .replace(css, () => "/*__INLINE_SIMULATOR_CSS__*/");
        mkdirSync(projectPath("./src/restored"), { recursive: true });
        writeFileSync(projectPath("./src/restored/runtime.js"), js);
        writeFileSync(projectPath("./src/restored/runtime.css"), css);
        writeFileSync(projectPath("./src/restored/standalone.template.html"), template);
      },
    },
  ],
  server: {
    host: true,
    fs: { allow: [projectPath(".")] },
    hmr: false,
    strictPort: false,
  },
  build: {
    outDir: projectPath("./dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
  },
});
