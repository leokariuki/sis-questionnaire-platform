import type { ResponseRecord } from "@/lib/types";
import type { DataStore } from "./store";
import { recordToRow } from "@/lib/row";

/**
 * Supabase Postgres adapter (spec §3 alternative DB). Activated when
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 *
 * Each row stores the full flat 73-column schema (for analyst SQL access)
 * plus a `payload` JSONB column for faithful round-tripping of the record.
 * Run db/supabase-schema.sql once to create the table.
 */
const TABLE = "sis_responses";

type SupabaseClientLike = {
  from: (t: string) => any;
};

let cached: SupabaseClientLike | null = null;

async function getClient(): Promise<SupabaseClientLike> {
  if (cached) return cached;
  // Dynamic import keeps @supabase/supabase-js optional.
  const { createClient } = await import("@supabase/supabase-js");
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  ) as unknown as SupabaseClientLike;
  return cached;
}

function toDbRow(rec: ResponseRecord) {
  return {
    id: rec.id,
    sheet: `${rec.questionnaireType}_${rec.ageGroup}`,
    payload: rec,
    ...recordToRow(rec),
  };
}

export class SupabaseStore implements DataStore {
  async create(record: ResponseRecord): Promise<ResponseRecord> {
    const supabase = await getClient();
    const { error } = await supabase.from(TABLE).insert(toDbRow(record));
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return record;
  }

  async update(id: string, patch: Partial<ResponseRecord>): Promise<ResponseRecord | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const merged = { ...current, ...patch };
    const supabase = await getClient();
    const { error } = await supabase.from(TABLE).update(toDbRow(merged)).eq("id", id);
    if (error) throw new Error(`Supabase update failed: ${error.message}`);
    return merged;
  }

  async getById(id: string): Promise<ResponseRecord | null> {
    const supabase = await getClient();
    const { data } = await supabase.from(TABLE).select("payload").eq("id", id).maybeSingle();
    return (data?.payload as ResponseRecord) ?? null;
  }

  async getByCode(sheet: string, studentCode: string): Promise<ResponseRecord | null> {
    const supabase = await getClient();
    const { data } = await supabase
      .from(TABLE)
      .select("payload")
      .eq("sheet", sheet)
      .eq("Student_Code", studentCode)
      .order("Timestamp", { ascending: false })
      .limit(1);
    return (data?.[0]?.payload as ResponseRecord) ?? null;
  }

  async listBySheet(sheet: string): Promise<ResponseRecord[]> {
    const supabase = await getClient();
    const { data } = await supabase.from(TABLE).select("payload").eq("sheet", sheet);
    return (data ?? []).map((d: any) => d.payload as ResponseRecord);
  }

  async listAll(): Promise<ResponseRecord[]> {
    const supabase = await getClient();
    const { data } = await supabase.from(TABLE).select("payload");
    return (data ?? []).map((d: any) => d.payload as ResponseRecord);
  }
}
