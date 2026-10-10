/**
 * ============================================================================
 *  F-14 TOMCAT CARRIER SIMULATOR — BACKEND  (Gamestate.gs)
 * ============================================================================
 *
 *  One free, no-backend Apps Script web app for the whole sim. The static site
 *  POSTs JSON to this deployment and everything lands in one Google Sheet:
 *
 *    • the pilot's settings ("gamestate"), keyed on callsign, so their
 *      gamemode, time of day, sensitivity, keybinds and aircraft follow them
 *      between browsers and machines;
 *    • the feedback form's reports, one row each.
 *
 *  Both used to be separate scripts (this one and a Code.gs collector), which
 *  meant two deployments, two URLs and two things to keep working. The client
 *  shipped the collector's URL in one place and the profile store's URL in
 *  another, and when they got mixed up the feedback form quietly posted
 *  settings-shaped JSON at the profile store and was told "callsign is
 *  required". One script, one URL, one deploy fixes that class of bug.
 *
 *  SETUP — about two minutes
 *  -------------------------
 *   1. Go to  https://script.google.com  →  New project.
 *   2. Delete the default Code.gs content and paste this whole file in.
 *   3. Run ▸ `health` once and accept the OAuth prompt — it needs Sheets
 *      access to the spreadsheet named below.
 *   4. Deploy ▸ New deployment ▸ ⚙ Web app:
 *          Execute as:       Me
 *          Who has access:   Anyone        ← required; the sim posts anonymously
 *      Authorise, then copy the URL that ends in /exec.
 *   5. Paste that /exec URL over the GAMESTATE_ENDPOINT constant in the sim's
 *      src/gamestate.ts (the file says where). The feedback form uses the same
 *      URL. That is the only step that connects the two.
 *
 *  No secrets, no keys, no script properties are required: this is an informal
 *  profile store and feedback box for a game, not a security boundary. Anyone
 *  who can guess a callsign can read or overwrite that profile — the same trust
 *  level as a username in any browser game. The data is exactly what the
 *  settings screen shows, and the reports are exactly what the form sends.
 *
 *  Optional hardening — Project settings ▸ Script properties:
 *          FEEDBACK_KEY = any long random string
 *      If it is set, feedback reports must carry it (as an `api-key` header or
 *      as `access_key` in the body); set VITE_FEEDBACK_KEY to the same value in
 *      the sim and the client will send it. Profiles are never key-checked.
 *
 *
 *  ENDPOINTS (single web app, JSON over text/plain)
 *  ------------------------------------------------
 *   POST  { action:"get",  callsign }              → { ok, found, gamestate }
 *   POST  { action:"save", callsign, gamestate }   → { ok, saved }
 *   POST  { type:"feedback", message, ... }        → { ok, id } (or duplicate)
 *   GET   (anything else)                          → health check
 *
 *  The body is sent as text/plain (Content-Type: text/plain;charset=UTF-8) so
 *  the browser treats it as a CORS simple request and skips the preflight that
 *  Apps Script web apps answer inconsistently. Apps Script hands us the exact
 *  body either way via e.postData.contents.
 *
 *
 *  STORAGE
 *  -------
 *  One spreadsheet, one tab per job:
 *
 *      GameState   Callsign | Updated | Gamestate (JSON)     one row per pilot
 *      Feedback    Received | ID | Kind | Message | …          one row per report
 *
 *  The spreadsheet ID is set below. If it is left blank, the file is created on
 *  first use and its ID remembered in script properties (persistent across
 *  requests and redeploys) so no per-request spreadsheets are ever created.
 *  Callsigns are matched case-insensitively (MAVERICK and maverick are the same
 *  pilot), matching the roster.
 * ============================================================================
 */

// --- configuration ---------------------------------------------------------

var APP_NAME = 'f14sim';

var SHEET_NAME = 'GameState';
var MAX_CALLSIGN = 12;      // matches the roster / settings cap
var MAX_STATE_BYTES = 8000; // a settings blob is ~700 bytes; be generous

// The spreadsheet everything lives in. Takes priority over the auto-created one.
var SPREADSHEET_ID = '1P-H7IB0FUROrB6VXOs_VWcicIA4Oel1tjoc6tWlbvGg';
var PROP_KEY = 'SPREADSHEET_ID'; // used only when SPREADSHEET_ID is blank

var HEADER = ['Callsign', 'Updated', 'Gamestate (JSON)'];
var COL_CALLSIGN = 1;
var COL_UPDATED = 2;
var COL_STATE = 3;

// --- feedback configuration ------------------------------------------------

var FEEDBACK_SHEET_NAME = 'Feedback';
var MAX_MESSAGE = 4000;      // matches the form's maxLength
var MAX_TEXT = 500;          // cap for callsign / email / user agent
var DEDUP_SCAN = 250;        // how many recent report IDs to check before re-adding
var REJECT_AFTER = 60000;    // ms: ignore reports timestamped in the future

// Column order. COL_ID is derived from this so the two can never drift.
var FEEDBACK_HEADER = [
  'Received',        // 1  when the script got it
  'ID',              // 2  client-side dedup key
  'Kind',            // 3  bug | idea | other
  'Message',         // 4  the report itself
  'Callsign',        // 5
  'Email',           // 6  only present if the pilot offered one
  'Aircraft',        // 7
  'World',           // 8
  'Mission profile', // 9
  'Quality',         // 10
  'Speed (kt)',      // 11
  'Alt (ft)',        // 12
  'Mach',            // 13
  'Multiplayer',     // 14
  'Room',            // 15
  'Context (JSON)',  // 16  the full context blob, for anything not columnised
  'User agent',      // 17
  'Version',         // 18  payload schema version
  'Client time'      // 19  the pilot's clock, in case it differs from ours
];
var COL_ID = FEEDBACK_HEADER.indexOf('ID') + 1; // 1-based column number


// --- entry points ----------------------------------------------------------

function doGet() {
  return json_({
    ok: true,
    app: APP_NAME,
    endpoint: 'gamestate+feedback',
    sheets: [SHEET_NAME, FEEDBACK_SHEET_NAME],
    time: new Date().toISOString()
  });
}

/**
 * Route one POST. A body carrying `type:"feedback"` (or an explicit
 * `action:"feedback"`) is a report and goes to the collector path; anything
 * else is a profile get/save. Both halves answer `{ok:…}` in the body, because
 * Apps Script's ContentService cannot set HTTP status codes — the client reads
 * `res.ok` for transport and this `ok` for meaning, so a rejection is retried
 * rather than mistaken for a delivery.
 */
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

  if (isFeedback_(payload)) return json_(feedback_(e, payload));

  var action = String(payload.action || '');
  if (action === 'get') return json_(get_(payload));
  if (action === 'save') return json_(save_(payload));
  return json_({
    ok: false,
    error: 'unknown request: use action "get" / "save", or type "feedback"'
  });
}

/** Is this body a feedback report rather than a profile action? */
function isFeedback_(payload) {
  var type = String(payload.type || '').toLowerCase();
  var action = String(payload.action || '').toLowerCase();
  if (type === 'feedback' || action === 'feedback') return true;
  // Belt and braces: a report with no action at all is still a report. This is
  // the shape that used to reach a profile-only store and come back as
  // "callsign is required", so it routes on its own fields.
  return !action && payload.message !== undefined;
}

/** Run once from the editor to grant Sheets access before deploying. */
function health() {
  var state = sheet_();
  var feedback = feedbackSheet_();
  return 'ok — profiles in "' + state.getName() + '", reports in "' +
    feedback.getName() + '" of spreadsheet ' + state.getParent().getId();
}


// --- profile store: get / save ---------------------------------------------

function get_(payload) {
  var callsign = normalize_(payload.callsign);
  if (!callsign) return { ok: false, error: 'callsign is required' };
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

function save_(payload) {
  var callsign = normalize_(payload.callsign);
  if (!callsign) return { ok: false, error: 'callsign is required' };
  var state = payload.gamestate;
  if (state === null || state === undefined) return { ok: false, error: 'gamestate is required' };
  var body = JSON.stringify(state);
  if (body.length > MAX_STATE_BYTES) return { ok: false, error: 'gamestate too large' };

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


// --- feedback collector ----------------------------------------------------

/**
 * Accept one feedback report and append it to the Feedback sheet.
 *
 * Always answers 200 — ContentService cannot set status codes — so the outcome
 * travels in the body: `{ok:true}` when the row was appended (or was already
 * there), `{ok:false, error:…}` when the report was turned away. Anything that
 * throws falls through to Apps Script's own 500, which correctly tells the sim
 * to keep the report queued and retry later.
 */
function feedback_(e, payload) {
  // Shared secret, when one is configured. Checked against both the header and
  // the body, because the client sends it in both places.
  var secret = prop_('FEEDBACK_KEY');
  if (secret && !keyMatches_(e, payload, secret)) {
    return { ok: false, error: 'unauthorised' };
  }

  var message = str_(payload.message).trim();
  if (!message) return { ok: false, error: 'message is required' };
  if (message.length > MAX_MESSAGE) message = message.slice(0, MAX_MESSAGE);

  // A clock far in the future means a bogus report; drop it rather than let it
  // pollute the top of the sheet.
  var sentAt = Date.parse(str_(payload.at));
  if (!isNaN(sentAt) && sentAt - Date.now() > REJECT_AFTER) {
    return { ok: false, error: 'implausible timestamp' };
  }

  var id = str_(payload.id);
  var sheet = feedbackSheet_();

  // The sim retries whenever a response is lost, so the same id can legitimately
  // arrive twice. Idempotency keeps the sheet free of duplicates.
  if (seen_(sheet, id)) return { ok: true, duplicate: true };

  sheet.appendRow(feedbackRow_(payload, message));
  return { ok: true, id: id };
}

/** A report payload → one Feedback row, in the header's column order. */
function feedbackRow_(payload, message) {
  var ctx = payload.context && typeof payload.context === 'object' ? payload.context : {};
  return [
    new Date(),                                  // Received
    safe_(str_(payload.id)),                     // ID
    safe_(str_(payload.kind)),                   // Kind
    safe_(message),                              // Message
    safe_(str_(payload.callsign)),               // Callsign
    safe_(str_(payload.email)),                  // Email
    safe_(str_(ctx.aircraft)),                   // Aircraft
    safe_(str_(ctx.world)),                      // World
    safe_(str_(ctx.missionMode)),                // Mission profile
    safe_(str_(ctx.quality)),                    // Quality
    num_(ctx.speedKt),                           // Speed (kt)
    num_(ctx.altFt),                             // Alt (ft)
    num_(ctx.mach),                              // Mach
    ctx.multiplayer ? 'yes' : 'no',              // Multiplayer
    safe_(str_(ctx.room)),                       // Room
    payload.context ? JSON.stringify(ctx) : '',  // Context (JSON)
    safe_(str_(payload.ua)),                     // User agent
    num_(payload.version),                       // Version
    safe_(str_(payload.at))                      // Client time
  ];
}

/**
 * True when this report id is already among the most recent rows. Bounded to
 * DEDUP_SCAN rows so a 10k-row sheet still costs one small read.
 */
function seen_(sheet, id) {
  if (!id) return false;
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var start = Math.max(2, last - DEDUP_SCAN + 1);
  var values = sheet.getRange(start, COL_ID, last - start + 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === id) return true;
  }
  return false;
}


// --- spreadsheet -----------------------------------------------------------

/**
 * The one spreadsheet both halves write to. Apps Script globals do NOT survive
 * from one request to the next, so a fresh execution would create a brand-new
 * spreadsheet on every call unless the ID is fixed above or stored in script
 * properties. If the stored spreadsheet is ever deleted, the stale ID is
 * discarded and one replacement is created and remembered the same way.
 */
function book_() {
  var props = PropertiesService.getScriptProperties();
  var id = SPREADSHEET_ID || props.getProperty(PROP_KEY);

  var ss = null;
  if (id) {
    try {
      ss = SpreadsheetApp.openById(id);
    } catch (err) {
      // Only safe to forget a *stored* ID — a hard-coded one is a real error.
      if (!SPREADSHEET_ID) props.deleteProperty(PROP_KEY);
      ss = null;
    }
  }

  if (!ss) {
    ss = SpreadsheetApp.create('F-14 Tomcat — Pilot Data');
    if (!SPREADSHEET_ID) props.setProperty(PROP_KEY, ss.getId()); // <- this sticks
  }
  return ss;
}

/** The named tab, created with its header row the first time it is needed. */
function tab_(name, header) {
  var ss = book_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
    var head = sheet.getRange(1, 1, 1, header.length);
    head.setFontWeight('bold').setFontColor('#78ff8c').setBackground('#0a0e12');
    sheet.setFrozenRows(1);
    try { sheet.autoResizeColumns(1, header.length); } catch (err) { /* cosmetic */ }
  }
  return sheet;
}

/** The profile tab. */
function sheet_() {
  return tab_(SHEET_NAME, HEADER);
}

/** The feedback tab. */
function feedbackSheet_() {
  return tab_(FEEDBACK_SHEET_NAME, FEEDBACK_HEADER);
}

function autoResizeOnce_(sheet) {
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

function prop_(name) {
  var v = PropertiesService.getScriptProperties().getProperty(name);
  return v && v.trim() ? v.trim() : null;
}

function keyMatches_(e, payload, secret) {
  var headerKey = '';
  if (e && e.headers) {
    headerKey = str_(e.headers['api-key'] || e.headers['Api-Key'] || e.headers['API-KEY']);
  }
  if (headerKey && headerKey === secret) return true;
  if (str_(payload.access_key) === secret) return true;
  if (str_(payload.api_key) === secret) return true;
  return false;
}

function str_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    try { return JSON.stringify(v); } catch (err) { return ''; }
  }
  return String(v).slice(0, MAX_TEXT);
}

function num_(v) {
  if (v === null || v === undefined || v === '') return '';
  var n = Number(v);
  return isNaN(n) ? '' : n;
}

/**
 * Neutralise spreadsheet formula injection. A report or callsign starting with
 * `=`, `+`, `-`, `@`, TAB or CR would otherwise be evaluated as a formula — and
 * this endpoint is reachable by anyone. Prefixing with an apostrophe forces
 * text; Sheets hides it when displaying the cell.
 */
function safe_(v) {
  var s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) return "'" + s;
  return s;
}

/** ContentService cannot set HTTP status codes, so the outcome travels in `ok`. */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
