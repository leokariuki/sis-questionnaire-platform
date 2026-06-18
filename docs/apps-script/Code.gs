/**
 * SIS Platform → Google Sheets sync (Apps Script Web App).
 *
 * Billing-free alternative to the Google Sheets API service-account method.
 * Bound to the target spreadsheet; receives one POST per submission from the
 * SIS platform and appends a row to the tab matching the questionnaire
 * (e.g. PRE_TEENS_13_17), creating the tab + header row on first use.
 *
 * SETUP
 *  1. Open the Sheet → Extensions → Apps Script.
 *  2. Replace the default Code.gs with this file. Save.
 *  3. Edit SHARED_TOKEN below to a long random string (keep it secret).
 *  4. Deploy → New deployment → type "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Click Deploy, authorize, and copy the Web App URL.
 *  5. In the SIS platform .env, set:
 *       SHEETS_WEBHOOK_URL=<the Web App URL>
 *       SHEETS_WEBHOOK_TOKEN=<the same SHARED_TOKEN value>
 */

// Must match SHEETS_WEBHOOK_TOKEN in the platform .env.
const SHARED_TOKEN = "CHANGE_ME_to_a_long_random_secret";

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    // Reject anything without the shared secret.
    if (!SHARED_TOKEN || body.token !== SHARED_TOKEN) {
      return json_({ ok: false, error: "unauthorized" });
    }

    const headers = Array.isArray(body.headers) ? body.headers : [];
    const row = Array.isArray(body.row) ? body.row : [];

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const lock = LockService.getScriptLock();
    lock.waitLock(30000); // serialize concurrent submissions
    try {
      // Batch action: ensure a set of tabs exist (header-only, no data rows).
      // Used to pre-create every questionnaire tab up front.
      if (body.action === "ensureTabs") {
        const tabs = Array.isArray(body.tabs) ? body.tabs : [];
        const created = [];
        for (var i = 0; i < tabs.length; i++) {
          if (ensureTab_(ss, String(tabs[i]), headers)) created.push(tabs[i]);
        }
        return json_({ ok: true, created: created });
      }

      const tabName = String(body.tab || "Responses");

      // Replace action: clear the tab's data rows and rewrite from `rows`.
      // Used to backfill / re-sync a tab so it mirrors the database exactly.
      if (body.action === "replaceTab") {
        ensureTab_(ss, tabName, headers);
        const sh = ss.getSheetByName(tabName);
        if (sh.getLastRow() > 1) {
          sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
        }
        const rows = Array.isArray(body.rows) ? body.rows : [];
        if (rows.length) {
          sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
        }
        return json_({ ok: true, replaced: rows.length });
      }

      ensureTab_(ss, tabName, headers);
      // Append the data row only when one is supplied (header-only requests skip).
      if (row.length) ss.getSheetByName(tabName).appendRow(row);
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Create the tab + header row if missing. Returns true if it created one. */
function ensureTab_(ss, tabName, headers) {
  let sheet = ss.getSheetByName(tabName);
  let created = false;
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    created = true;
  }
  if (sheet.getLastRow() === 0 && headers.length) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return created;
}

// Simple health check in the browser.
function doGet() {
  return json_({ ok: true, service: "SIS Sheets webhook" });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
