import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // viteSingleFile inlines every JS/CSS asset into dist/index.html, so the
  // build output is one self-contained file that runs from file:// or any
  // static host. Dev server settings (HMR off) are intentionally untouched.
  plugins: [react(), viteSingleFile()],
  server: {
    host: true,
    hmr: false,
    strictPort: false,
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
