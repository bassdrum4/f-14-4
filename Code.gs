/**
 * ============================================================================
 *  F-14 TOMCAT CARRIER SIMULATOR — FEEDBACK COLLECTOR  (Code.gs)
 * ============================================================================
 *
 *  A free, no-backend collector for the sim's feedback form. The static site
 *  POSTs a JSON report to this web app and each report is appended to a
 *  Google Sheet you own.
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
 *   5. In the sim:  Settings ▸ Environment  →  set
 *          VITE_FEEDBACK_ENDPOINT = the /exec URL you just copied
 *      (The client also ships with a built-in copy of the collector URL, so
 *       this step only matters when you redeploy under a different URL.)
 *
 *  Optional hardening — Project settings ▸ Script properties:
 *          FEEDBACK_KEY = any long random string
 *          SHEET_ID     = ID of an existing spreadsheet to write into
 *
 *      If you set FEEDBACK_KEY, also set VITE_FEEDBACK_KEY to the same value
 *      in the sim: the client sends it both as an `api-key` header and as
 *      `access_key` in the body, and requests without it are rejected.
 *
 *      If SHEET_ID is omitted, the first submission creates a spreadsheet and
 *      remembers its ID in Script properties.
 *
 *
 *  ENDPOINTS
 *  ---------
 *   POST  →  append a feedback row.  Body is JSON (sent as text/plain so the
 *            browser treats it as a CORS simple request and skips the
 *            preflight that Apps Script handles inconsistently).
 *   GET   →  health check; returns JSON so you can confirm the deploy works.
 *
 *
 *  WHY text/plain?
 *  ---------------
 *  `Content-Type: application/json` makes the browser send an OPTIONS
 *  preflight first. Apps Script web apps do not reliably answer it, which
 *  surfaces as "Failed to fetch" in the console. `text/plain` is a CORS
 *  simple request — no preflight — and `e.postData.contents` gives us the
 *  exact same JSON string either way.
 * ============================================================================
 */

// --- configuration ---------------------------------------------------------

var APP_NAME = 'f14sim';
var SHEET_NAME = 'Feedback';
var MAX_MESSAGE = 4000;      // matches the form's maxLength
var MAX_TEXT = 500;          // cap for callsign / email / user agent
var DEDUP_SCAN = 250;        // how many recent IDs to check before re-adding
var REJECT_AFTER = 60000;    // ms: ignore reports timestamped in the future

// Column order. COL_ID is derived from this so the two can never drift.
var HEADER = [
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
var COL_ID = HEADER.indexOf('ID') + 1;   // 1-based column number


// --- entry points ----------------------------------------------------------

/**
 * Health check. Safe to leave public: it reports nothing about stored rows.
 */
function doGet() {
  return json_({
    ok: true,
    app: APP_NAME,
    endpoint: 'feedback',
    sheet: SHEET_NAME,
    time: new Date().toISOString()
  });
}

/**
 * Accept one feedback report and append it to the sheet.
 *
 * Always answers 200 — Apps Script's ContentService cannot set arbitrary
 * status codes — so the outcome travels in the body: `{ok:true}` when the row
 * was appended (or was already there), `{ok:false, error:…}` when the report
 * was turned away. The sim reads `res.ok` for transport and `ok` for meaning,
 * so a rejection is retried rather than mistaken for a delivery. Anything
 * that throws falls through to Apps Script's own 500, which correctly tells
 * the sim to keep the report queued and retry later.
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

  // Shared secret, when one is configured. Checked against both the header and
  // the body, because the client sends it in both places.
  var secret = prop_('FEEDBACK_KEY');
  if (secret && !keyMatches_(e, payload, secret)) {
    return json_({ ok: false, error: 'unauthorised' });
  }

  var message = str_(payload.message).trim();
  if (!message) return json_({ ok: false, error: 'message is required' });
  if (message.length > MAX_MESSAGE) message = message.slice(0, MAX_MESSAGE);

  // A clock far in the future means a bogus report; drop it rather than let it
  // pollute the top of the sheet.
  var sentAt = Date.parse(str_(payload.at));
  if (!isNaN(sentAt) && sentAt - Date.now() > REJECT_AFTER) {
    return json_({ ok: false, error: 'implausible timestamp' });
  }

  var id = str_(payload.id);
  var sheet = sheet_();

  // The sim retries whenever a response is lost, so the same id can legitimately
  // arrive twice. Idempotency keeps the sheet free of duplicates.
  if (seen_(sheet, id)) {
    return json_({ ok: true, duplicate: true });
  }

  sheet.appendRow(row_(payload, message));
  return json_({ ok: true, id: id });
}


// --- payload → row ---------------------------------------------------------

function row_(payload, message) {
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


// --- spreadsheet -----------------------------------------------------------

/**
 * Resolve the target sheet, creating both the spreadsheet and the header row
 * the first time. The created spreadsheet's ID is cached in Script properties
 * so later runs reuse it.
 */
function sheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = prop_('SHEET_ID');
  var ss = null;

  if (id) {
    try {
      ss = SpreadsheetApp.openById(id);
    } catch (err) {
      // The ID was cleared or shared away — fall through and make a new one.
      ss = null;
    }
  }

  if (!ss) {
    ss = SpreadsheetApp.create('F-14 Tomcat — Feedback');
    props.setProperty('SHEET_ID', ss.getId());
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    var head = sheet.getRange(1, 1, 1, HEADER.length);
    head.setFontWeight('bold').setFontColor('#78ff8c').setBackground('#0a0e12');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADER.length);
  }

  return sheet;
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


// --- helpers ---------------------------------------------------------------

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
 * Neutralise spreadsheet formula injection. A report starting with `=`, `+`,
 * `-`, `@`, TAB or CR would otherwise be evaluated as a formula — and this
 * endpoint is reachable by anyone. Prefixing with an apostrophe forces text;
 * Sheets hides it when displaying the cell.
 */
function safe_(v) {
  var s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) return "'" + s;
  return s;
}

/**
 * ContentService cannot set HTTP status codes, so the outcome travels in the
 * body as `ok`. The sim reads `res.ok` for transport and this for meaning.
 */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
