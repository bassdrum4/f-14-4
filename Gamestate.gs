/**
 * ============================================================================
 *  F-14 TOMCAT CARRIER SIMULATOR — GAMESTATE STORE  (Gamestate.gs)
 * ============================================================================
 *
 *  A free, no-backend profile store for the sim. The static site POSTs the
 *  pilot's settings ("gamestate") to this web app, and fetches them back with
 *  just a callsign — so a pilot's gamemode, time of day, sensitivity, keybinds
 *  and aircraft follow them between browsers and machines.
 *
 *
 *  SETUP — about two minutes
 *  -------------------------
 *   1. Go to  https://script.google.com  →  New project.
 *   2. Delete the default Code.gs content and paste this whole file in.
 *   3. Run ▸ any function once (e.g. `health`) and accept the OAuth prompt —
 *      it only needs Sheets access to its own spreadsheet.
 *   4. Deploy ▸ New deployment ▸ ⚙ Web app:
 *          Execute as:       Me
 *          Who has access:   Anyone        ← required; the sim posts anonymously
 *      Authorise, then copy the URL that ends in /exec.
 *   5. Paste that /exec URL over the GAMESTATE_ENDPOINT constant in the sim's
 *      src/gamestate.ts (the file says where). That is the only step that
 *      connects the two.
 *
 *  No secrets, no keys, no script properties: this is an informal profile
 *  store for a game, not a security boundary. Anyone who can guess a callsign
 *  can read or overwrite that profile — the same trust level as a username in
 *  any browser game. The data is exactly what the settings screen shows.
 *
 *
 *  ENDPOINTS (single web app, JSON over text/plain)
 *  ------------------------------------------------
 *   POST  { action:"get",  callsign }   →  { ok, found, gamestate }
 *   POST  { action:"save", callsign, gamestate } →  { ok, saved }
 *   GET   (anything else)               →  health check
 *
 *  The POST body is sent as text/plain (Content-Type: text/plain;charset=UTF-8)
 *  so the browser treats it as a CORS simple request and skips the preflight
 *  that Apps Script web apps answer inconsistently — the same trick the
 *  feedback collector uses (see Code.gs). Apps Script hands us the exact body
 *  either way via e.postData.contents.
 *
 *
 *  STORAGE
 *  -------
 *  One Google Sheet, one row per callsign:
 *      Callsign | Updated | Gamestate (JSON)
 *  The spreadsheet is created on first use and remembered by its ID in this
 *  file, so nothing needs configuring. Callsigns are matched case-insensitively
 *  (MAVERICK and maverick are the same pilot), matching the roster.
 * ============================================================================
 */

// --- configuration ---------------------------------------------------------

var SHEET_NAME = 'GameState';
var MAX_CALLSIGN = 12;      // matches the roster / settings cap
var MAX_STATE_BYTES = 8000; // a settings blob is ~700 bytes; be generous
// The spreadsheet ID is filled in automatically on first save/get. To use an
// existing spreadsheet instead, paste its ID between the quotes.
var SPREADSHEET_ID = '';

var HEADER = ['Callsign', 'Updated', 'Gamestate (JSON)'];
var COL_CALLSIGN = 1;
var COL_UPDATED = 2;
var COL_STATE = 3;

// --- entry points ----------------------------------------------------------

function doGet() {
  return json_({ ok: true, app: 'f14sim', endpoint: 'gamestate', time: new Date().toISOString() });
}

function doPost(e) {
  var raw = e && e.postData && e.postData.contents ? String(e.postData.contents) : '';
  if (!raw) return json_({ ok: false, error: 'empty request body' });

  var payload;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    return json_({ ok: false, error: 'body is not valid JSON' });
  }
  if (!payload || typeof payload !== 'object') {
    return json_({ ok: false, error: 'body must be a JSON object' });
  }

  var callsign = normalize_(payload.callsign);
  if (!callsign) return json_({ ok: false, error: 'callsign is required' });

  var action = String(payload.action || '');

  if (action === 'get') {
    return json_(get_(callsign));
  }
  if (action === 'save') {
    var state = payload.gamestate;
    if (state === null || state === undefined) return json_({ ok: false, error: 'gamestate is required' });
    var body = JSON.stringify(state);
    if (body.length > MAX_STATE_BYTES) return json_({ ok: false, error: 'gamestate too large' });
    return json_(save_(callsign, body));
  }
  return json_({ ok: false, error: 'unknown action: use "get" or "save"' });
}

// --- operations ------------------------------------------------------------

function get_(callsign) {
  var row = findRow_(callsign);
  if (row < 0) return { ok: true, found: false, gamestate: null };
  var cell = sheet_().getRange(row, COL_STATE).getValue();
  var state = null;
  try {
    state = JSON.parse(String(cell));
  } catch (err) {
    state = null; // a corrupted row reads as "no profile", never a crash
  }
  return { ok: true, found: state !== null, gamestate: state };
}

function save_(callsign, body) {
  var sheet = sheet_();
  var row = findRow_(callsign);
  if (row < 0) {
    sheet.appendRow([safe_(callsign), new Date(), body]);
    autoResizeOnce_(sheet);
  } else {
    sheet.getRange(row, COL_UPDATED).setValue(new Date());
    sheet.getRange(row, COL_STATE).setValue(body);
  }
  return { ok: true, saved: true, callsign: callsign };
}

/** 1-based row of the callsign (case-insensitive), or -1. */
function findRow_(callsign) {
  var sheet = sheet_();
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var values = sheet.getRange(2, COL_CALLSIGN, last - 1, 1).getValues();
  var want = String(callsign).toLowerCase();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).toLowerCase() === want) return i + 2;
  }
  return -1;
}

// --- spreadsheet -----------------------------------------------------------

function sheet_() {
  var ss = null;
  if (SPREADSHEET_ID) {
    try { ss = SpreadsheetApp.openById(SPREADSHEET_ID); } catch (err) { ss = null; }
  }
  if (!ss) {
    // Remember the auto-created spreadsheet in this file, so a redeploy keeps
    // the same store. Script properties would be cleaner but this endpoint is
    // deliberately zero-config.
    ss = SpreadsheetApp.create('F-14 Tomcat — Gamestate');
    SPREADSHEET_ID = ss.getId();
  }
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    var head = sheet.getRange(1, 1, 1, HEADER.length);
    head.setFontWeight('bold').setFontColor('#78ff8c').setBackground('#0a0e12');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

var RESIZED = false;
function autoResizeOnce_(sheet) {
  if (RESIZED) return;
  RESIZED = true;
  try { sheet.autoResizeColumns(1, HEADER.length); } catch (err) { /* cosmetic */ }
}

// --- helpers ---------------------------------------------------------------

/**
 * Callsigns are normalized on both ends: trimmed, uppercased, folded to the
 * roster's character set and capped, so "Maverick ", "maverick" and
 * "MAVERICK" all land on one row.
 */
function normalize_(v) {
  var s = String(v === null || v === undefined ? '' : v).trim().toUpperCase();
  s = s.replace(/[^A-Z0-9._-]/g, '');
  return s.slice(0, MAX_CALLSIGN);
}

/**
 * Neutralise spreadsheet formula injection. A callsign starting with `=`, `+`,
 * `-`, `@`, TAB or CR would otherwise be evaluated as a formula — and this
 * endpoint is reachable by anyone. Prefixing with an apostrophe forces text.
 */
function safe_(v) {
  var s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) return "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
