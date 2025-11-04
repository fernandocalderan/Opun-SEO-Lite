export type ReportItem = { id: string; title: string; project: string; generated_at: string; format: string; status: string };
export type ReportTemplate = { id: string; name: string; description: string };
export type ActivityPoint = { date: string; generated: number; shared: number };

export type ReportsStore = {
  list: ReportItem[];
  templates: ReportTemplate[];
  activity: ActivityPoint[];
  queue: Array<{ id: string; title: string; project: string; status: "pending" | "running" | "completed" | "failed"; started_at: string | null; eta_seconds: number | null }>;
  results: Record<string, { id: string; title: string; project: string; generated_at: string; html: string; format: string }>;
};

import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "reports.json");

async function ensureDir() { await fs.mkdir(DATA_DIR, { recursive: true }); }
async function fileExists(p: string) { try { await fs.access(p); return true; } catch { return false; } }

async function readStore(): Promise<ReportsStore> {
  await ensureDir();
  if (!(await fileExists(STORE_PATH))) {
    const seed: ReportsStore = {
    list: [
      { id: "report-1", title: "Monthly Reputation Overview", project: "Brand HQ", generated_at: "2025-10-30T09:10:00Z", format: "PDF + HTML", status: "Listo para compartir" },
      { id: "report-2", title: "Auditoria tecnica Ecommerce", project: "Shop / LATAM", generated_at: "2025-10-29T17:25:00Z", format: "HTML", status: "Requiere revision" },
      { id: "report-3", title: "Plan de acciones ORM Q4", project: "ORM Squad", generated_at: "2025-10-28T11:42:00Z", format: "Notion Sync", status: "Compartido" },
    ],
    templates: [
      { id: "tpl-1", name: "Executive Reputation Brief", description: "Resumen ejecutivo con KPIs principales y recomendaciones rápidas." },
      { id: "tpl-2", name: "Auditoria SEO tecnica", description: "Listado de issues técnicos priorizados por impacto/esfuerzo." },
      { id: "tpl-3", name: "Plan de remediacion ORM", description: "Roadmap semanal con asignaciones por equipo." },
    ],
    activity: [
      { date: "24 Oct", generated: 3, shared: 1 },
      { date: "25 Oct", generated: 4, shared: 2 },
      { date: "26 Oct", generated: 5, shared: 3 },
      { date: "27 Oct", generated: 4, shared: 2 },
      { date: "28 Oct", generated: 6, shared: 4 },
      { date: "29 Oct", generated: 5, shared: 3 },
      { date: "30 Oct", generated: 7, shared: 5 },
    ],
    queue: [],
    results: {},
  };
    await fs.writeFile(STORE_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  const raw = await fs.readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as ReportsStore;
}

export async function getReportsList() { const d = await readStore(); return d.list; }
export async function getReportTemplates() { const d = await readStore(); return d.templates; }
export async function getReportActivity() { const d = await readStore(); return d.activity; }

export async function createReport(input: { title: string; project: string; format?: string }) {
  const d = await readStore();
  const id = `report-${Date.now()}`;
  d.queue.push({ id, title: input.title, project: input.project, status: "pending", started_at: null, eta_seconds: null });
  await fs.writeFile(STORE_PATH, JSON.stringify(d, null, 2), "utf8");
  return { id };
}

export async function getReportStatus(id: string) {
  const d = await readStore();
  return d.queue.find((q) => q.id === id) ?? null;
}

export async function getReportResult(id: string) {
  const d = await readStore();
  return d.results[id] ?? null;
}

export async function markReportRunning(id: string, eta: number) {
  const d = await readStore();
  const idx = d.queue.findIndex((q) => q.id === id);
  if (idx >= 0) {
    d.queue[idx].status = "running";
    d.queue[idx].started_at = new Date().toISOString();
    d.queue[idx].eta_seconds = eta;
    await fs.writeFile(STORE_PATH, JSON.stringify(d, null, 2), "utf8");
  }
}

export async function markReportCompleted(id: string, html: string, format: string) {
  const d = await readStore();
  const idx = d.queue.findIndex((q) => q.id === id);
  if (idx >= 0) {
    const item = d.queue[idx];
    const generated_at = new Date().toISOString();
    d.queue[idx].status = "completed";
    d.queue[idx].eta_seconds = 0;
    d.results[id] = { id, title: item.title, project: item.project, generated_at, html, format };
    // add to list
    d.list.unshift({ id, title: item.title, project: item.project, generated_at, format, status: "Listo para compartir" });
    await fs.writeFile(STORE_PATH, JSON.stringify(d, null, 2), "utf8");
  }
}

export async function markReportFailed(id: string, reason: string) {
  const d = await readStore();
  const idx = d.queue.findIndex((q) => q.id === id);
  if (idx >= 0) {
    d.queue[idx].status = "failed";
    d.results[id] = { id, title: d.queue[idx].title, project: d.queue[idx].project, generated_at: new Date().toISOString(), html: `<p>Fallo: ${reason}</p>`, format: "HTML" };
    await fs.writeFile(STORE_PATH, JSON.stringify(d, null, 2), "utf8");
  }
}

export async function getPendingReports() {
  const d = await readStore();
  return d.queue.filter((q) => q.status === "pending");
}
