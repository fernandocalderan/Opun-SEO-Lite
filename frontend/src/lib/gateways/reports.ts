import { reportActivity, reportList, templateLibrary } from "../mocks/reports";
import type { ReportActivityPoint, ReportListItem, ReportTemplate } from "../mocks/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 5000;

export async function fetchReportList(): Promise<ReportListItem[]> {
  if (!API_BASE_URL) return reportList;
  try {
    const payload = await getJson(`${API_BASE_URL}/v1/reports/list`);
    return (payload as any[]).map((r) => ({
      id: r.id,
      title: r.title,
      project: r.project,
      generatedAt: formatDate(r.generated_at),
      format: r.format,
      status: r.status,
    }));
  } catch {
    return reportList;
  }
}

export async function fetchReportTemplates(): Promise<ReportTemplate[]> {
  if (!API_BASE_URL) return templateLibrary;
  try { return await getJson(`${API_BASE_URL}/v1/reports/templates`); } catch { return templateLibrary; }
}

export async function fetchReportActivity(): Promise<ReportActivityPoint[]> {
  if (!API_BASE_URL) return reportActivity;
  try { return await getJson(`${API_BASE_URL}/v1/reports/activity`); } catch { return reportActivity; }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", timeZone: "UTC" }).format(d);
  const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(d);
  return `${date} @ ${time}`;
}

async function getJson(url: string) {
  const c = new AbortController();
  const tid = setTimeout(() => c.abort(), REQUEST_TIMEOUT_MS);
  try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error(String(r.status)); return await r.json(); } finally { clearTimeout(tid); }
}

export async function createReport(payload: { title: string; project: string; format?: string }): Promise<{ id: string; status: string } | null> {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as { id: string; status: string };
}

export async function fetchReportStatus(id: string): Promise<{ id: string; status: string } | null> {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/reports/${id}/status`);
  if (!r.ok) return null;
  return (await r.json()) as { id: string; status: string };
}

export async function fetchReportResult(id: string): Promise<{ id: string; title: string; project: string; generated_at: string; html: string; format: string } | { status: "pending" } | null> {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/reports/${id}/result`);
  if (r.status === 202) return { status: "pending" } as const;
  if (!r.ok) return null;
  return (await r.json()) as any;
}
