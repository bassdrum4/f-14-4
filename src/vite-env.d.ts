/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional: a *different* Google Apps Script web app to collect feedback
   *  (https://script.google.com/macros/s/<SCRIPT_ID>/exec) instead of the
   *  shared backend in gamestate.ts. Development builds honour it (the
   *  headless checks point it at a local stand-in); production builds ignore it
   *  so a stale host value cannot redirect live reports. */
  readonly VITE_FEEDBACK_ENDPOINT?: string;
  /** Optional shared secret. Sent as an `api-key` header and `access_key` in
   *  the body; set the same value as FEEDBACK_KEY in the script's Script
   *  Properties and the backend will reject anything that does not match. A
   *  wrapped (unusable) value is ignored rather than sent. */
  readonly VITE_FEEDBACK_KEY?: string;

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
