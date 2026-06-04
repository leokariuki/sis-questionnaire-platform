import type { DataStore } from "./store";
import { LocalStore } from "./local";

/**
 * Selects the data store based on environment:
 *   • Supabase   → when NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set
 *   • Local file → default (development, no credentials)
 */
let storePromise: Promise<DataStore> | null = null;

export function hasSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function build(): Promise<DataStore> {
  if (hasSupabase()) {
    const { SupabaseStore } = await import("./supabase");
    return new SupabaseStore();
  }
  return new LocalStore();
}

export function getStore(): Promise<DataStore> {
  storePromise ??= build();
  return storePromise;
}

export function activeBackend(): "supabase" | "local" {
  return hasSupabase() ? "supabase" : "local";
}
