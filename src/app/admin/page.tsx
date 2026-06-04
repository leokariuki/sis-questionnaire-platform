"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResponseRecord } from "@/lib/types";
import type { Analytics } from "@/lib/analytics";
import { recordsToCsv } from "@/lib/csv";

const TOKEN_KEY = "sis:admin:token";

interface AdminData {
  records: ResponseRecord[];
  analytics: Analytics;
  backend: string;
  sheetsSync: boolean;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  const load = useCallback(async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      const [rRes, aRes] = await Promise.all([
        fetch(`/api/responses?key=${encodeURIComponent(t)}`),
        fetch(`/api/admin/analytics?key=${encodeURIComponent(t)}`),
      ]);
      if (rRes.status === 401 || aRes.status === 401) {
        setError("That admin token is not correct.");
        setData(null);
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        return;
      }
      const { records } = await rRes.json();
      const a = await aRes.json();
      setData({ records, analytics: a.analytics, backend: a.backend, sheetsSync: a.sheetsSync });
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      setError("Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  function exportCsv() {
    if (!data) return;
    const blob = new Blob([recordsToCsv(data.records)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sis_responses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!token || !data) {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-form flex-col justify-center px-container-mobile">
        <div className="card p-8">
          <h1 className="font-head text-headline-md text-on-surface">Adviser sign-in</h1>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">
            Enter the admin token to view responses, analytics and reports.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setToken(input)}
            placeholder="Admin token"
            className="mt-stack-md h-14 w-full rounded-full border-2 border-outline-variant bg-white px-6 font-body text-body-lg outline-none focus:border-primary focus:shadow-glow"
          />
          {error && <p className="mt-3 font-body text-body-md text-error">{error}</p>}
          <button onClick={() => setToken(input)} disabled={!input || loading} className="btn-primary mt-stack-md w-full">
            {loading ? "Checking…" : "Sign in"}
          </button>
        </div>
      </main>
    );
  }

  const { analytics, records } = data;

  return (
    <main className="mx-auto max-w-content px-container-mobile py-stack-lg sm:px-container-desktop">
      <header className="mb-stack-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-head text-headline-lg text-on-surface">Adviser dashboard</h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Data store: <strong>{data.backend}</strong> · Sheets sync:{" "}
            <strong>{data.sheetsSync ? "on" : "off"}</strong> · Aggregated, no names or ages.
          </p>
        </div>
        <div className="flex gap-stack-sm">
          <button onClick={exportCsv} className="btn-secondary min-h-[48px] px-6">
            ⬇ Export CSV
          </button>
          <button onClick={() => load(token)} className="btn-ghost">↻ Refresh</button>
        </div>
      </header>

      {/* Summary cards */}
      <section className="mb-stack-lg grid grid-cols-2 gap-stack-sm sm:grid-cols-4">
        <StatCard label="Responses" value={String(analytics.total)} />
        <StatCard label="Overall avg" value={analytics.overallAverage ? analytics.overallAverage.toFixed(2) : "—"} />
        <StatCard label="Strongest" value={analytics.strongest?.label ?? "—"} sub={analytics.strongest?.average.toFixed(2)} />
        <StatCard label="Needs support" value={analytics.needsSupport?.label ?? "—"} sub={analytics.needsSupport?.average.toFixed(2)} />
      </section>

      {/* Competency averages */}
      <section className="card mb-stack-lg p-6">
        <h2 className="mb-stack-md font-head text-headline-md">Average score by competency</h2>
        <div className="flex flex-col gap-stack-sm">
          {analytics.competencies.map((c) => (
            <div key={c.id} className="flex items-center gap-4">
              <span className="w-36 shrink-0 font-body text-body-md">{c.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(c.average / 5) * 100}%`, backgroundColor: c.color }}
                />
              </div>
              <span className="w-12 text-right font-head text-label-bold">{c.average ? c.average.toFixed(2) : "—"}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quality flags */}
      <section className="card mb-stack-lg p-6">
        <h2 className="mb-stack-md font-head text-headline-md">Quality checks</h2>
        <div className="grid grid-cols-2 gap-stack-sm sm:grid-cols-4">
          <Flag label="Duplicate codes" count={analytics.quality.duplicateCodes.length} />
          <Flag label="Unmatched post-tests" count={analytics.quality.unmatchedPostTests.length} />
          <Flag label="Report errors" count={analytics.quality.reportErrors.length} />
          <Flag label="By questionnaire" count={analytics.byQuestionnaire.length} neutral />
        </div>
        {analytics.quality.duplicateCodes.length > 0 && (
          <p className="mt-stack-sm font-body text-body-md text-on-surface-variant">
            Duplicates:{" "}
            {analytics.quality.duplicateCodes.map((d) => `${d.code} (${d.count})`).join(", ")}
          </p>
        )}
      </section>

      {/* Response explorer */}
      <section className="card overflow-hidden p-0">
        <h2 className="p-6 pb-3 font-head text-headline-md">Response explorer</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-body text-body-md">
            <thead>
              <tr className="border-y border-outline-variant bg-surface-container-low text-on-surface-variant">
                <Th>Code</Th>
                <Th>Type</Th>
                <Th>Date</Th>
                <Th>Overall</Th>
                <Th>Status</Th>
                <Th>Report</Th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                    No responses yet. Complete the pilot questionnaire to see data here.
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="border-b border-surface-container-high">
                  <Td><span className="font-head font-semibold">{r.studentCode}</span></Td>
                  <Td>{r.questionnaireType} · {r.ageGroup === "TEENS_13_17" ? "Teens" : "Kids"}</Td>
                  <Td>{new Date(r.timestamp).toLocaleDateString()}</Td>
                  <Td>{r.scores.overall ? r.scores.overall.toFixed(2) : "—"}</Td>
                  <Td>
                    <span
                      className="rounded-full px-3 py-1 text-label-bold"
                      style={{
                        backgroundColor: r.reportStatus === "Error" ? "#ffdad6" : "#79f3ea",
                        color: r.reportStatus === "Error" ? "#93000a" : "#006f69",
                      }}
                    >
                      {r.reportStatus}
                    </span>
                  </Td>
                  <Td>
                    <a className="font-semibold text-primary underline" href={`/api/report/${r.id}`} target="_blank" rel="noreferrer">
                      Open PDF
                    </a>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="font-body text-body-md text-on-surface-variant">{label}</p>
      <p className="mt-1 font-head text-headline-md text-on-surface">{value}</p>
      {sub && <p className="font-body text-body-md text-on-surface-variant">{sub}</p>}
    </div>
  );
}

function Flag({ label, count, neutral }: { label: string; count: number; neutral?: boolean }) {
  const danger = !neutral && count > 0;
  return (
    <div
      className="rounded-md p-4"
      style={{ backgroundColor: danger ? "#ffdad6" : "#f4f2ff", color: danger ? "#93000a" : "#161a32" }}
    >
      <p className="font-head text-headline-md">{count}</p>
      <p className="font-body text-body-md">{label}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-6 py-3 font-head text-label-bold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-6 py-3">{children}</td>;
}
