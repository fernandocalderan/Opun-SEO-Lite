import { reportActivity, reportList, templateLibrary } from "../mocks/reports";
import { authHeaders } from "./http";
import type { ReportActivityPoint, ReportListItem, ReportTemplate } from "../mocks/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 5000;

type ReportListApi = Array<{
  id: string;
  title: string;
  project: string;
  generated_at: string;
  format: string;
  status: string;
}>;

export async function fetchReportList(): Promise<ReportListItem[]> {
  if (!API_BASE_URL) return reportList;
  try {
    const payload = (await getJson(`${API_BASE_URL}/v1/reports/list`)) as ReportListApi;
    return payload.map((r) => ({
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
  try { const r = await fetch(url, { signal: c.signal, headers: authHeaders() }); if (!r.ok) throw new Error(String(r.status)); return await r.json(); } finally { clearTimeout(tid); }
}

export async function createReport(payload: { title: string; project: string; format?: string }): Promise<{ id: string; status: string } | null> {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as { id: string; status: string };
}

export async function fetchReportStatus(id: string): Promise<{ id: string; status: string } | null> {
  if (!API_BASE_URL) return null;
  const r = await fetch(`${API_BASE_URL}/v1/reports/${id}/status`, { headers: authHeaders() });
  if (!r.ok) return null;
  return (await r.json()) as { id: string; status: string };
}

export type ReportResultApi = { id: string; title: string; project: string; generated_at: string; html: string; format: string };

export async function fetchReportResult(id: string): Promise<ReportResultApi | { status: "pending" } | null> {
  if (!API_BASE_URL) {
    // Fallback inmediato con HTML de muestra para validar la UI
    const nowIso = new Date().toISOString();
    return {
      id,
      title: `Executive Brief ${new Date().toLocaleDateString("es-ES")}`,
      project: "Demo",
      generated_at: nowIso,
      format: "html",
      html: `<!doctype html><html><head><meta charset=\"utf-8\"/><title>Reporte ${id}</title></head><body style=\"font-family: system-ui, sans-serif; padding: 24px\"><h1>Reporte demo</h1><p>Generado: ${nowIso}</p><p>Contenido de ejemplo para validar estilos y export.</p></body></html>`
    } satisfies ReportResultApi;
  }
  const r = await fetch(`${API_BASE_URL}/v1/reports/${id}/result`, { headers: authHeaders() });
  if (r.status === 202) return { status: "pending" } as const;
  if (!r.ok) return null;
  return (await r.json()) as ReportResultApi;
}

// Fallback para generar un ID y HTML temporal si no hay API
export async function createReportFallback(payload: { title: string; project: string; format?: string }): Promise<{ id: string; status: string }> {
  const id = `rep_${Date.now().toString(36)}`;
  // Simula estado accepted
  return { id, status: "pending" };
}
