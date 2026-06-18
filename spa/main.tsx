import React from "react";
import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import { App } from "./App";
import { setContent } from "@/lib/content";

/** Resolve the WordPress REST base (mirrors resolveConfig in App.tsx). */
function apiBase(): string {
  const c = (window as { SIS_CONFIG?: { apiBase?: string } }).SIS_CONFIG;
  return c?.apiBase || `${window.location.origin}/wp-json`;
}

/** Race a promise against a timeout so a slow/unreachable sheet can't hang boot. */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

/**
 * Load editable content (Google Sheet via WordPress) before first render, then
 * mount. Any failure is swallowed — the app renders with built-in defaults, so
 * non-technical editing can never blank out the questionnaire.
 */
async function boot(): Promise<void> {
  try {
    // Unique URL per load bypasses the WordPress page cache (LiteSpeed); the
    // plugin's own 5-minute transient still limits how often the sheet is read.
    const res = await withTimeout(
      fetch(`${apiBase()}/sis/v1/content?t=${Date.now()}`, { cache: "no-store" }),
      2500,
    );
    if (res.ok) setContent(await res.json());
  } catch {
    /* offline / not configured — fall back to built-in wording */
  }
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void boot();
