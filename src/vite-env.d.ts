/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Apps Script web app that collects feedback (see Code.gs):
   *  https://script.google.com/macros/s/<SCRIPT_ID>/exec
   *  A valid value wins; when it is missing or is the production store's
   *  encrypted wrapper, the client falls back to the built-in collector URL. */
  readonly VITE_FEEDBACK_ENDPOINT?: string;
  /** Optional shared secret. Sent as an `api-key` header and `access_key` in
   *  the body; set the same value as FEEDBACK_KEY in the script's Script
   *  Properties and Code.gs will reject anything that does not match. A
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
