import type {
  AuditHistoryItem,
  AuditPerformancePoint,
  AuditQueueItem,
  AuditSummaryItem,
} from "./types";

export const auditSummary = [
  { label: "Auditorias completadas", value: "128", delta: "+18 mes" },
  { label: "Tiempo promedio", value: "12m 40s", delta: "-2m vs. objetivo" },
  { label: "Issues criticos", value: "7", delta: "3 abiertos" },
] satisfies AuditSummaryItem[];

export const auditQueue = [
  {
    id: "queue-1",
    project: "Brand / Landing principal",
    type: "Full crawl",
    status: "En ejecucion",
    startedAt: "16:20",
    eta: "00:05",
  },
  {
    id: "queue-2",
    project: "Blog / Cluster ORM",
    type: "Contenido",
    status: "Pendiente",
    startedAt: "--",
    eta: "--",
  },
  {
    id: "queue-3",
    project: "Ecommerce / fichas producto",
    type: "Performance",
    status: "Pendiente",
    startedAt: "--",
    eta: "--",
  },
] satisfies AuditQueueItem[];

export const auditHistory = [
  {
    id: "hist-1",
    project: "Brand / Landing principal",
    finishedAt: "30 Oct @ 15:54",
    score: 84,
    criticalIssues: 2,
    owner: "SEO Ops",
  },
  {
    id: "hist-2",
    project: "Blog / Cluster ORM",
    finishedAt: "29 Oct @ 10:12",
    score: 78,
    criticalIssues: 4,
    owner: "Content",
  },
  {
    id: "hist-3",
    project: "Knowledge base",
    finishedAt: "28 Oct @ 18:41",
    score: 88,
    criticalIssues: 1,
    owner: "Support",
  },
] satisfies AuditHistoryItem[];

export const auditPerformance = [
  {
    id: "perf-1",
    project: "Brand / Landing principal",
    completedAt: "2025-10-30T15:54:00Z",
    score: 84,
    criticalIssues: 2,
  },
  {
    id: "perf-2",
    project: "Blog / Cluster ORM",
    completedAt: "2025-10-29T10:12:00Z",
    score: 78,
    criticalIssues: 4,
  },
  {
    id: "perf-3",
    project: "Knowledge base",
    completedAt: "2025-10-28T18:41:00Z",
    score: 88,
    criticalIssues: 1,
  },
  {
    id: "perf-4",
    project: "Product / Onboarding",
    completedAt: "2025-10-27T17:20:00Z",
    score: 82,
    criticalIssues: 3,
  },
] satisfies AuditPerformancePoint[];
