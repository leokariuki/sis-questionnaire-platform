import type { ResponseRecord } from "@/lib/types";
import { COLUMN_HEADERS, recordToOrderedRow } from "@/lib/row";

/**
 * Google Apps Script webhook sync — a billing-free alternative to the
 * service-account Sheets API. Activated when SHEETS_WEBHOOK_URL is set.
 *
 * Posts each submission to an Apps Script Web App bound to the target
 * spreadsheet, which appends the row to the tab matching the questionnaire
 * (e.g. PRE_TEENS_13_17), creating the tab + header row on first use.
 *
 * Failures never block a submission — sync is best-effort and logged.
 */
export function hasWebhook(): boolean {
  return Boolean(process.env.SHEETS_WEBHOOK_URL);
}

export async function appendViaWebhook(rec: ResponseRecord): Promise<void> {
  if (!hasWebhook()) return;
  const tab = `${rec.questionnaireType}_${rec.ageGroup}`;
  const res = await fetch(process.env.SHEETS_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: process.env.SHEETS_WEBHOOK_TOKEN || "",
      tab,
      headers: COLUMN_HEADERS,
      row: recordToOrderedRow(rec),
    }),
    // A successful Apps Script doPost responds 302 -> script.googleusercontent.com
    // (the row is already written by then). A script error instead returns a 200
    // HTML page. So we DON'T auto-follow: a redirect to googleusercontent is the
    // reliable success signal; following it only yields a flaky echo fetch.
    redirect: "manual",
  });

  const isAppsScriptRedirect =
    (res.status === 301 || res.status === 302 || res.type === "opaqueredirect") &&
    (res.headers.get("location") || "").includes("googleusercontent.com");

  if (!res.ok && !isAppsScriptRedirect) {
    throw new Error(`webhook responded ${res.status}`);
  }
}

/** Best-effort sync that swallows errors (logged). */
export async function syncToWebhookSafe(rec: ResponseRecord): Promise<boolean> {
  if (!hasWebhook()) return false;
  try {
    await appendViaWebhook(rec);
    return true;
  } catch (err) {
    console.error("[webhook] sync failed:", (err as Error).message);
    return false;
  }
}
