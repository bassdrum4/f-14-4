/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Mapbox public token (pk.…) used for terrain + imagery tiles. */
  readonly VITE_MAPBOX_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
