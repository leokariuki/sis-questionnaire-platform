import type { ResponseRecord } from "@/lib/types";

/**
 * Pluggable data-store contract. The local file store is the default;
 * the Supabase adapter implements the same interface and is selected
 * automatically when credentials are present.
 */
export interface DataStore {
  create(record: ResponseRecord): Promise<ResponseRecord>;
  update(id: string, patch: Partial<ResponseRecord>): Promise<ResponseRecord | null>;
  getById(id: string): Promise<ResponseRecord | null>;
  /** Most recent record for a code within a sheet (questionnaire). */
  getByCode(sheet: string, studentCode: string): Promise<ResponseRecord | null>;
  listBySheet(sheet: string): Promise<ResponseRecord[]>;
  listAll(): Promise<ResponseRecord[]>;
}
