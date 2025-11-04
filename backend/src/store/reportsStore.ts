export type ReportItem = { id: string; title: string; project: string; generated_at: string; format: string; status: string };
export type ReportTemplate = { id: string; name: string; description: string };
export type ActivityPoint = { date: string; generated: number; shared: number };

export type ReportsStore = {
  list: ReportItem[];
  templates: ReportTemplate[];
  activity: ActivityPoint[];
};

let memory: ReportsStore | null = null;

export async function initReportsStore() {
  if (memory) return;
  memory = {
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
  };
}

export async function getReportsList() { await initReportsStore(); return memory!.list; }
export async function getReportTemplates() { await initReportsStore(); return memory!.templates; }
export async function getReportActivity() { await initReportsStore(); return memory!.activity; }

