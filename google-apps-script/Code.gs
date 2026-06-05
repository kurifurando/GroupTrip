/**
 * Johor Bahru Field Notes — Google Sheets receiver
 * --------------------------------------------------
 * This is a Google Apps Script Web App that receives questionnaire
 * submissions and appends one row per response to a Google Sheet.
 * Respondents never log in (it works like an anonymous Google Form).
 *
 * ONE-TIME SETUP
 * 1. Create (or open) the Google Sheet that should collect responses.
 * 2. In that Sheet: Extensions -> Apps Script.
 * 3. Delete the placeholder code and paste this whole file in. Save.
 * 4. (Optional) Set SHARED_SECRET below to a random string and put the SAME
 *    value into SHEET_SECRET in index.html. This stops strangers who find the
 *    URL from writing junk rows.
 * 5. Deploy -> New deployment -> gear icon -> "Web app".
 *       Description:    anything
 *       Execute as:     Me (your Google account)
 *       Who has access: Anyone        <-- required so respondents need no login
 *    Click Deploy, grant the permissions it asks for, and copy the
 *    "Web app" URL (ends in /exec).
 * 6. Paste that URL into SHEET_ENDPOINT in index.html.
 *
 * WHENEVER YOU EDIT THIS SCRIPT
 *   Deploy -> Manage deployments -> edit (pencil) -> Version: New version ->
 *   Deploy. The /exec URL stays the same.
 */

// Tab the responses are written to. Created automatically if missing.
var SHEET_NAME = 'Responses';

// Optional shared secret. Leave '' to disable. Must match SHEET_SECRET in index.html.
var SHARED_SECRET = '';

// Column order for the Sheet. The header row is written automatically on first use.
var COLUMNS = [
  'submittedAt',
  'name',
  'contact',
  'profile',
  'windows',
  'dates',
  'duration',
  'expectations',
  'avoid',
  'activities',
  'wildcard',
  'shenanigans',
  'type2',
  'line',
  'budget',
  'budgetWhy',
  'sideways',
  'morning',
  'decision',
  'needs',
  'request',
  'anythingElse',
  'sourceUrl'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // serialise writes so concurrent submits don't collide

  try {
    var payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (SHARED_SECRET && payload.secret !== SHARED_SECRET) {
      return json({ ok: false, error: 'unauthorized' });
    }

    var data = payload.response || {};

    // Honeypot: real people leave this blank. Pretend success, write nothing.
    if (data.companyWebsite) {
      return json({ ok: true });
    }

    // Consent is required, same as the old backend enforced.
    if (data.policyConsent !== 'yes') {
      return json({ ok: false, error: 'consent required' });
    }

    var sheet = getSheet();
    var row = COLUMNS.map(function (key) {
      if (key === 'submittedAt') return payload.submittedAt || new Date().toISOString();
      if (key === 'profile') return payload.profile || '';
      if (key === 'sourceUrl') return payload.sourceUrl || '';
      var value = data[key];
      if (Array.isArray(value)) return value.join(', ');
      return value == null ? '' : value;
    });

    sheet.appendRow(row);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the /exec URL in a browser to confirm the deployment is live.
function doGet() {
  return json({ ok: true, message: 'JB Field Notes endpoint is live. Submit with POST.' });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
