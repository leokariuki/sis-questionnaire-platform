import type { ResponseRecord } from "@/lib/types";
import { COLUMN_HEADERS, recordToRow } from "@/lib/row";

/** Build a CSV string from response records using the canonical 73-column order. */
export function recordsToCsv(records: ResponseRecord[]): string {
  const escape = (v: unknown) => {
    const str = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [COLUMN_HEADERS.join(",")];
  for (const rec of records) {
    const row = recordToRow(rec);
    lines.push(COLUMN_HEADERS.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}
