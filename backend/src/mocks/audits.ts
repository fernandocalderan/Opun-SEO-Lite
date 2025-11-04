export const auditSummaryMock = {
  overall_score: 78,
  critical_issues: 4,
  warnings: 12,
  opportunities: 7,
  last_run: "2025-11-03T12:00:00Z",
} as const;

export const auditQueueMock = [
  {
    id: "queue-1",
    project: "Brand / Landing principal",
    type: "full",
    status: "running",
    started_at: "2025-11-04T19:20:00Z",
    eta_seconds: 420,
  },
  {
    id: "queue-2",
    project: "Blog / Cluster ORM",
    type: "contenido",
    status: "pending",
    started_at: null,
    eta_seconds: null,
  },
  {
    id: "queue-3",
    project: "Ecommerce / fichas producto",
    type: "performance",
    status: "pending",
    started_at: null,
    eta_seconds: null,
  },
] as const;

export const auditHistoryMock = [
  {
    id: "hist-1",
    project: "Brand / Landing principal",
    completed_at: "2025-10-30T15:54:00Z",
    score: 84,
    critical_issues: 2,
    owner: "SEO Ops",
  },
  {
    id: "hist-2",
    project: "Blog / Cluster ORM",
    completed_at: "2025-10-29T10:12:00Z",
    score: 78,
    critical_issues: 4,
    owner: "Content",
  },
  {
    id: "hist-3",
    project: "Knowledge base",
    completed_at: "2025-10-28T18:41:00Z",
    score: 88,
    critical_issues: 1,
    owner: "Support",
  },
] as const;
