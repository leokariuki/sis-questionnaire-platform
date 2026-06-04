import type { ResponseRecord } from "@/lib/types";
import { COLUMN_HEADERS, recordToOrderedRow } from "@/lib/row";

/**
 * Google Sheets synchronization (spec §3, §4). Optional: activated when
 * GOOGLE_SHEETS_ID + service-account credentials are present. Mirrors each
 * submission into the tab matching the questionnaire (e.g. PRE_TEENS_13_17),
 * creating the tab + header row on first use.
 *
 * Failures here never block a submission — sync is best-effort and logged.
 */
export function hasSheets(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEETS_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  );
}

async function getSheetsClient() {
  const { google } = await import("googleapis");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function ensureTab(sheets: any, spreadsheetId: string, tab: string): Promise<void> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s: any) => s.properties?.title === tab);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [COLUMN_HEADERS] },
    });
  }
}

export async function appendToSheet(rec: ResponseRecord): Promise<void> {
  if (!hasSheets()) return;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
  const tab = `${rec.questionnaireType}_${rec.ageGroup}`;
  const sheets = await getSheetsClient();
  await ensureTab(sheets, spreadsheetId, tab);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [recordToOrderedRow(rec)] },
  });
}

/** Best-effort sync that swallows errors (logged), per spec resilience needs. */
export async function syncToSheetSafe(rec: ResponseRecord): Promise<boolean> {
  if (!hasSheets()) return false;
  try {
    await appendToSheet(rec);
    return true;
  } catch (err) {
    console.error("[sheets] sync failed:", (err as Error).message);
    return false;
  }
}
