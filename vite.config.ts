import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * index.html is deliberately a full, self-contained, deployable production
 * page for GitHub Pages and the web-app host. Vite must NEVER treat that old
 * inline bundle as the source of truth.
 *
 * Before Vite scans HTML entry modules, replace only the precompiled
 * script/style with the real TypeScript entry. This ensures:
 *   npm run dev   -> TypeScript app, live
 *   npm run build -> dist/index.html, self-contained, from TypeScript
 *   npm run build:publish -> updates committed root index.html on request
 */
function typescriptEntry(): Plugin {
  return {
    name: "typescript-entry-over-committed-standalone",
    enforce: "pre",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        if (ctx.path !== "/" && !ctx.path.endsWith("/index.html")) return html;
        if (html.includes('src="/src/main.tsx"')) return html;

        const inlineBundle = /<script type="module" crossorigin>[\s\S]*?<\/script>/;
        const inlineStyles = /<style rel="stylesheet" crossorigin>[\s\S]*?<\/style>/;
        if (!inlineBundle.test(html) || !inlineStyles.test(html)) {
          throw new Error("Standalone index.html shape changed; cannot safely switch the build to TypeScript.");
        }
        return html
          .replace(inlineBundle, '<script type="module" src="/src/main.tsx"></script>')
          .replace(inlineStyles, "");
      },
    },
  };
}

export default defineConfig({
  plugins: [typescriptEntry(), react(), viteSingleFile()],
  server: {
    host: true,
    hmr: false,
    strictPort: false,
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
