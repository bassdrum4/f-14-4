/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional development-only URL for a feedback collector stand-in.
   * Production always uses the F-14 Supabase Edge Function. */
  readonly VITE_FEEDBACK_ENDPOINT?: string;

  /** Multiplayer signalling server override. The public PeerJS broker is the
   *  default, so these are only needed for a self-hosted one. */
  readonly VITE_PEER_HOST?: string;
  readonly VITE_PEER_PORT?: string;
  readonly VITE_PEER_PATH?: string;
  readonly VITE_PEER_KEY?: string;
  readonly VITE_PEER_SECURE?: string;
  /** JSON array of RTCIceServer — add a TURN server for strict NATs. */
  readonly VITE_PEER_ICE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
