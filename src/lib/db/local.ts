import { promises as fs } from "fs";
import path from "path";
import type { ResponseRecord } from "@/lib/types";
import type { DataStore } from "./store";

/**
 * File-based store for local development (no credentials required).
 * Persists to .data/responses.json. Not for production scale — swap in
 * the Supabase adapter by setting the Supabase env vars.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "responses.json");

async function readAll(): Promise<ResponseRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as ResponseRecord[];
  } catch {
    return [];
  }
}

async function writeAll(records: ResponseRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

export class LocalStore implements DataStore {
  async create(record: ResponseRecord): Promise<ResponseRecord> {
    const all = await readAll();
    all.push(record);
    await writeAll(all);
    return record;
  }

  async update(id: string, patch: Partial<ResponseRecord>): Promise<ResponseRecord | null> {
    const all = await readAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    await writeAll(all);
    return all[idx];
  }

  async getById(id: string): Promise<ResponseRecord | null> {
    const all = await readAll();
    return all.find((r) => r.id === id) ?? null;
  }

  async getByCode(sheet: string, studentCode: string): Promise<ResponseRecord | null> {
    const all = await readAll();
    const matches = all
      .filter((r) => r.studentCode === studentCode && sheetForType(r) === sheet)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return matches[0] ?? null;
  }

  async listBySheet(sheet: string): Promise<ResponseRecord[]> {
    const all = await readAll();
    return all.filter((r) => sheetForType(r) === sheet);
  }

  async listAll(): Promise<ResponseRecord[]> {
    return readAll();
  }
}

/** Derive the sheet name from a record (matches questionnaire dbSheet). */
function sheetForType(r: ResponseRecord): string {
  return `${r.questionnaireType}_${r.ageGroup}`;
}
